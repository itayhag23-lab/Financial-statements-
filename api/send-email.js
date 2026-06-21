// POST /api/send-email  { to, template }
// Requires RESEND_API_KEY and RESEND_FROM env vars.
// Returns 501 (not implemented) when not configured — callers should treat
// this as a non-fatal error so the core user flow is never blocked.
//
// Email content is rendered server-side from a fixed template allowlist —
// callers can never supply arbitrary subject/HTML. This is what keeps the
// endpoint from being usable as an open relay for attacker-controlled
// email content sent under our domain's reputation.

// Rate limiting via Upstash Redis REST API, same pattern as api/chat.js.
// Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in Vercel to activate.
const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const RATE_LIMIT  = 5;     // emails per hour per IP
const WINDOW_S    = 3600;

// Best-effort fallback when Upstash isn't configured. Only persists for the
// lifetime of a warm serverless instance and isn't shared across instances,
// but still blunts trivial scripted abuse instead of leaving the endpoint
// fully unbounded.
const memoryHits = new Map();
function checkMemoryRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - WINDOW_S * 1000;
  const hits = (memoryHits.get(ip) || []).filter((t) => t > windowStart);
  hits.push(now);
  memoryHits.set(ip, hits);
  return hits.length <= RATE_LIMIT;
}

async function checkRateLimit(ip) {
  if (!REDIS_URL || !REDIS_TOKEN) return { ok: checkMemoryRateLimit(ip) };
  try {
    const key = `rl:email:${ip}`;
    const r = await fetch(`${REDIS_URL}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['INCR', key], ['EXPIRE', key, WINDOW_S, 'NX']]),
    });
    const [[, count]] = await r.json();
    return { ok: count <= RATE_LIMIT };
  } catch {
    return { ok: checkMemoryRateLimit(ip) };
  }
}

function welcomeEmail() {
  return `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:520px;margin:40px auto;background:#fff;border-radius:14px;border:1px solid #E2E8F0;overflow:hidden;">
  <div style="background:#070D1A;padding:28px 32px;">
    <div style="display:inline-flex;align-items:center;gap:10px;">
      <span style="font-size:22px;font-weight:700;color:#F8FAFC;letter-spacing:-0.02em;">Koala <span style="color:#10B981;">Statements</span></span>
    </div>
  </div>
  <div style="padding:32px;">
    <h1 style="font-size:22px;font-weight:700;color:#0F172A;margin:0 0 12px;letter-spacing:-0.01em;">You're in. Let's build.</h1>
    <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 20px;">Welcome to Koala Statements — your financial models are now saved to the cloud and available on every device.</p>
    <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 28px;">Get started by describing your business to the AI. It'll build a full 3-statement model — Income Statement, Cash Flow, and Balance Sheet — in under 60 seconds.</p>
    <a href="https://koalastatements.com/app" style="display:inline-block;background:#10B981;color:#0F172A;text-decoration:none;padding:13px 26px;border-radius:10px;font-weight:700;font-size:15px;">Build my first model →</a>
  </div>
  <div style="padding:20px 32px;border-top:1px solid #E2E8F0;">
    <p style="font-size:12px;color:#94A3B8;margin:0;">Not financial advice. If you have questions, reply to this email or visit <a href="https://koalastatements.com" style="color:#10B981;">koalastatements.com</a>.</p>
  </div>
</div>
</body></html>`.trim();
}

const TEMPLATES = {
  welcome: { subject: 'Welcome to Koala Statements', render: welcomeEmail },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(501).json({ error: 'Email not configured' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  const rl = await checkRateLimit(ip);
  if (!rl.ok) {
    res.setHeader('Retry-After', WINDOW_S);
    return res.status(429).json({ error: 'Rate limit exceeded.' });
  }

  const { to, template } = req.body || {};
  const tpl = TEMPLATES[template];
  if (!tpl) return res.status(400).json({ error: 'Unknown template' });
  if (typeof to !== 'string' || !EMAIL_RE.test(to)) {
    return res.status(400).json({ error: 'Invalid recipient' });
  }

  const from = process.env.RESEND_FROM || 'Koala Statements <hello@koalastatements.com>';

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject: tpl.subject, html: tpl.render() }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
