const { createClient } = require('@supabase/supabase-js');

// AI usage limit, enforced in Supabase (no external service needed).
// Each signed-in user gets a fixed number of AI requests per calendar day,
// overridable via AI_DAILY_LIMIT. Counting happens atomically inside the
// `check_ai_usage_limit` Postgres function against the `user_ai_usage` table
// (see supabase-setup.sql).
const DAILY_LIMIT = parseInt(process.env.AI_DAILY_LIMIT || '15', 10);

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Pull the Supabase access token off the request, if present.
function getBearerToken(req) {
  const authHeader = req.headers['authorization'] || '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
}

// AI features require a signed-in Supabase user — verifies the bearer token
// server-side rather than trusting anything the client claims.
async function getAuthedUser(token) {
  if (!SUPABASE_URL || !SUPABASE_KEY || !token) return null;
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

// Increment today's usage counter via the Supabase RPC and report whether the
// caller is still within the daily limit. The call is made AS the signed-in
// user (their token in the Authorization header) so the function's
// auth.uid() resolves correctly. Fails open: a Supabase hiccup should never
// block a legitimate user.
async function checkDailyLimit(token) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return { ok: true };
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.rpc('check_ai_usage_limit', {
      p_daily_limit: DAILY_LIMIT,
    });
    if (error) return { ok: true };
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return { ok: true };
    return { ok: row.allowed, used: row.used, limit: row.max_allowed };
  } catch {
    return { ok: true };
  }
}

// Preference order for which Gemini model to use. The first one that both
// exists for this API key AND has available quota wins. GEMINI_MODEL (if set)
// is tried first.
const MODEL_PREFERENCES = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-pro-latest'
];

// Ask the API which models this key can actually call with generateContent.
async function listAvailableModels(apiKey) {
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!r.ok) return null;
    const d = await r.json();
    return (d.models || [])
      .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map(m => m.name.replace('models/', ''));
  } catch {
    return null;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = getBearerToken(req);
  const user = await getAuthedUser(token);
  if (!user) {
    return res.status(401).json({ error: 'Sign in required to use AI features.' });
  }

  // Usage limit (per signed-in user, per calendar day), counted in Supabase.
  const daily = await checkDailyLimit(token);
  if (!daily.ok) {
    return res.status(429).json({ error: `Daily AI limit reached. You can make ${DAILY_LIMIT} AI requests per day.` });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured. Add it in your Vercel project settings.' });
  }

  try {
    const { messages = [], system, max_tokens } = req.body;

    // Translate Anthropic-format messages → Gemini contents
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof m.content === 'string' ? m.content : (m.content || []).map(c => c.text || '').join('') }]
    }));

    // Fold the system prompt into the first user turn. This avoids the
    // `systemInstruction` field entirely, so it works on every API version.
    if (system) {
      const firstUser = contents.find(c => c.role === 'user');
      if (firstUser) {
        firstUser.parts[0].text = system + '\n\n---\n\n' + firstUser.parts[0].text;
      } else {
        contents.unshift({ role: 'user', parts: [{ text: system }] });
      }
    }

    const geminiReq = {
      contents,
      generationConfig: { maxOutputTokens: max_tokens || 2048 }
    };

    // Build the candidate list: env override first, then preferences, then
    // whatever the key actually exposes (so we adapt to any account).
    const available = await listAvailableModels(apiKey);
    const candidates = [];
    if (process.env.GEMINI_MODEL) candidates.push(process.env.GEMINI_MODEL);
    for (const m of MODEL_PREFERENCES) if (!candidates.includes(m)) candidates.push(m);
    if (available) {
      // keep only candidates that exist, then append any other available flash models
      const existing = candidates.filter(c => available.includes(c));
      const extraFlash = available.filter(a => a.includes('flash') && !existing.includes(a));
      const finalList = [...existing, ...extraFlash, ...available.filter(a => !existing.includes(a) && !extraFlash.includes(a))];
      candidates.length = 0;
      candidates.push(...finalList);
    }

    let lastError = 'No model produced a response.';
    let lastStatus = 500;

    for (const model of candidates) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiReq)
        }
      );

      const data = await response.json();

      if (response.ok) {
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        // Anthropic-shaped response so the frontend needs no changes.
        return res.status(200).json({ content: [{ type: 'text', text }] });
      }

      lastError = data.error?.message || 'Gemini API error';
      lastStatus = response.status;

      // 404 (model not found) and 429 (quota) → try the next candidate.
      // Any other error (e.g. bad request, bad key) → stop and report.
      if (response.status !== 404 && response.status !== 429) {
        break;
      }
    }

    return res.status(lastStatus).json({ error: lastError });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
