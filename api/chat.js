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
const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const RATE_LIMIT  = 15;
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
    return { ok: true };
  }
}

async function getAuthedUser(req) {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  const token = (req.headers['authorization'] || '').replace('Bearer ', '') || null;
  if (!token) return null;
  const sb = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

// Hardcoded to gemini-2.0-flash — fastest model, no per-request listing overhead.
// Override via GEMINI_MODEL env var if needed.
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthedUser(req);
  if (!user) return res.status(401).json({ error: 'Sign in required to use AI features.' });

  // Paywall: Pro is unlimited; free users get FREE_AI_CREDITS runs, then 402.
  const access = await checkAIAccess(user.id);
  if (!access.allow) {
    return res.status(402).json({
      error: `You've used your ${FREE_AI_CREDITS} free AI runs. Upgrade to Koala Pro for unlimited AI.`,
      code: 'upgrade_required',
    });
  }

  // Rate limiting
  const rl = await checkRateLimit(`rl:chat:${user.id}`);
  if (!rl.ok) {
    res.setHeader('Retry-After', WINDOW_S);
    return res.status(429).json({ error: `Rate limit exceeded. You can make ${RATE_LIMIT} AI requests per hour.` });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured.' });

  const { messages = [], system, max_tokens, response_format } = req.body;

  // Translate Anthropic-style messages → Gemini contents
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: typeof m.content === 'string' ? m.content : (m.content || []).map(c => c.text || '').join('') }],
  }));
  if (system) {
    const firstUser = contents.find(c => c.role === 'user');
    if (firstUser) firstUser.parts[0].text = system + '\n\n---\n\n' + firstUser.parts[0].text;
    else contents.unshift({ role: 'user', parts: [{ text: system }] });
  }

  const generationConfig = { maxOutputTokens: max_tokens || 2048 };
  if (response_format === 'json') generationConfig.responseMimeType = 'application/json';

  try {
    // ── Non-streaming path: JSON model generation ──────────────────────────
    if (response_format === 'json') {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents, generationConfig }) }
      );
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json({ error: data.error?.message || 'Gemini error' });
      const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
      if (!text) return res.status(502).json({ error: 'Empty response from AI.' });
      try { await access.consume(); } catch {}
      return res.status(200).json({ content: [{ type: 'text', text }] });
    }

    // ── Streaming path: advisor chat ───────────────────────────────────────
    // Gemini SSE streaming so the first tokens arrive in ~300 ms instead of
    // waiting for the entire response (~3-5 s) before anything renders.
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents, generationConfig }) }
    );

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      return res.status(r.status).json({ error: err.error?.message || 'Gemini streaming error' });
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // prevent Nginx/Vercel edge from buffering

    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    let sentAny = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop(); // keep any incomplete trailing line
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (!raw || raw === '[DONE]') continue;
        try {
          const chunk = JSON.parse(raw);
          const text = (chunk.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
          if (text) { res.write(`data: ${JSON.stringify({ text })}\n\n`); sentAny = true; }
        } catch { /* ignore malformed chunks */ }
      }
    }

    if (sentAny) {
      try { await access.consume(); } catch {}
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    if (!res.headersSent) return res.status(500).json({ error: err.message });
    res.end();
  }
};
