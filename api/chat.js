// Rate limiting via Upstash Redis REST API (zero extra packages).
// Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in Vercel to activate.
// Without those vars the function still works — rate limiting is simply skipped.
const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const RATE_LIMIT  = 15;   // AI requests per hour per IP
const WINDOW_S    = 3600;

async function checkRateLimit(ip) {
  if (!REDIS_URL || !REDIS_TOKEN) return { ok: true };
  try {
    const key = `rl:chat:${ip}`;
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

  // Rate limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  const rl = await checkRateLimit(ip);
  if (!rl.ok) {
    res.setHeader('Retry-After', WINDOW_S);
    return res.status(429).json({ error: `Rate limit exceeded. You can make ${RATE_LIMIT} AI requests per hour.` });
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
