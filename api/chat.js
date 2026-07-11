const { createClient } = require('@supabase/supabase-js');
const { billingConfigured, serviceClient } = require('./_lemonsqueezy');

// Koala Pro paywall. AI is unlimited for Pro subscribers; free users get a small
// number of AI runs before the upgrade prompt. Enforced HERE (server-side) so it
// can't be bypassed from the client. The gate only activates once billing is
// configured (LEMONSQUEEZY_API_KEY + service role), so existing deployments keep
// working unchanged until Lemon Squeezy is wired up.
const FREE_AI_CREDITS = 3; // keep in sync with src/lib/subscription.js

// Returns { allow, isPro, consume } describing the caller's AI access. `consume`
// is called after a successful response to spend one free credit (Pro doesn't).
async function checkAIAccess(userId) {
  if (!billingConfigured()) return { allow: true, isPro: true, consume: async () => {} };
  const admin = serviceClient();
  if (!admin) return { allow: true, isPro: true, consume: async () => {} }; // not fully configured → don't block
  const { data: row } = await admin
    .from('subscriptions')
    .select('plan,status,ai_credits_used')
    .eq('user_id', userId)
    .maybeSingle();
  const isPro = !!row && row.plan === 'pro' && (row.status === 'active' || row.status === 'trialing');
  if (isPro) return { allow: true, isPro: true, consume: async () => {} };
  const used = row?.ai_credits_used || 0;
  if (used >= FREE_AI_CREDITS) return { allow: false, isPro: false, consume: async () => {} };
  return {
    allow: true,
    isPro: false,
    consume: async () => {
      await admin.from('subscriptions').upsert(
        { user_id: userId, ai_credits_used: used + 1 },
        { onConflict: 'user_id' }
      );
    },
  };
}

// Rate limiting via Upstash Redis REST API (zero extra packages).
// Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in Vercel to activate.
// Without those vars the function still works — rate limiting is simply skipped.
const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const RATE_LIMIT  = 15;   // AI requests per hour per signed-in user
const WINDOW_S    = 3600;

async function checkRateLimit(key) {
  if (!REDIS_URL || !REDIS_TOKEN) return { ok: true };
  try {
    const r = await fetch(`${REDIS_URL}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['INCR', key], ['EXPIRE', key, WINDOW_S, 'NX']]),
    });
    const [[, count]] = await r.json();
    return { ok: count <= RATE_LIMIT, count, limit: RATE_LIMIT };
  } catch {
    return { ok: true }; // fail open — never block legitimate users due to Redis errors
  }
}

// AI features require a signed-in Supabase user — verifies the bearer token
// server-side rather than trusting anything the client claims.
async function getAuthedUser(req) {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
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

  const user = await getAuthedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Sign in required to use AI features.' });
  }

  // Paywall: Pro is unlimited; free users get FREE_AI_CREDITS runs, then 402.
  const access = await checkAIAccess(user.id);
  if (!access.allow) {
    return res.status(402).json({
      error: `You've used your ${FREE_AI_CREDITS} free AI runs. Upgrade to Koala Pro for unlimited AI.`,
      code: 'upgrade_required',
    });
  }

  // Rate limiting (per signed-in user, now that every caller is authenticated)
  const rl = await checkRateLimit(`rl:chat:${user.id}`);
  if (!rl.ok) {
    res.setHeader('Retry-After', WINDOW_S);
    return res.status(429).json({ error: `Rate limit exceeded. You can make ${RATE_LIMIT} AI requests per hour.` });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured. Add it in your Vercel project settings.' });
  }

  try {
    const { messages = [], system, max_tokens, response_format } = req.body;

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

    const generationConfig = { maxOutputTokens: max_tokens || 2048 };
    // When the caller needs structured output (the "build from description"
    // feature), force Gemini to emit a raw JSON object — no prose, no fences.
    if (response_format === 'json') generationConfig.responseMimeType = 'application/json';

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
      const cfg = { ...generationConfig };
      // Gemini 2.5 flash models "think" by default, and that internal
      // reasoning is billed against maxOutputTokens — on a tight budget it can
      // consume the whole allowance and leave the actual JSON truncated or
      // empty. Disable thinking for the structured-JSON path so the full token
      // budget goes to the answer. (thinkingBudget:0 is valid for 2.5 flash
      // variants; left on for the free-form advisor chat, which benefits.)
      if (response_format === 'json' && /2\.5-flash|flash-latest/.test(model)) {
        cfg.thinkingConfig = { thinkingBudget: 0 };
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents, generationConfig: cfg })
        }
      );

      const data = await response.json();

      if (response.ok) {
        const candidate = data.candidates?.[0];
        // Concatenate every text part (a thinking model can split its output
        // across multiple parts), not just the first.
        const text = (candidate?.content?.parts || []).map(p => p.text || '').join('');
        if (text) {
          // Spend one free credit now that we know the run succeeded (Pro is a no-op).
          try { await access.consume(); } catch {}
          // Anthropic-shaped response so the frontend needs no changes.
          return res.status(200).json({ content: [{ type: 'text', text }] });
        }
        // OK status but no text: usually a truncated/blocked generation.
        // Record a clear reason and fall through to the next candidate.
        const reason = candidate?.finishReason || data.promptFeedback?.blockReason;
        lastError = reason === 'MAX_TOKENS'
          ? 'The AI response was cut off before it finished. Please try again.'
          : reason
            ? `The AI returned no usable text (${reason}). Please try again.`
            : 'The AI returned an empty response. Please try again.';
        lastStatus = 502;
        continue;
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
