// POST /api/send-email  { to, subject, html }
// Requires RESEND_API_KEY and RESEND_FROM env vars.
// Returns 501 (not implemented) when not configured — callers should treat
// this as a non-fatal error so the core user flow is never blocked.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(501).json({ error: 'Email not configured' });

  const { to, subject, html } = req.body || {};
  if (!to || !subject || !html) return res.status(400).json({ error: 'Missing to, subject, or html' });

  const from = process.env.RESEND_FROM || 'Koala Statements <hello@koalastatements.com>';

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
