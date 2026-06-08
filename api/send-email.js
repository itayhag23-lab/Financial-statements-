// POST /api/send-email  { subject, html }
// Requires the caller to be signed in (Supabase access token in the
// Authorization header) — email is ALWAYS sent to that authenticated user's
// own address. This endpoint must never be a generic relay: accepting an
// arbitrary `to` would let anyone on the internet send mail from our domain.
//
// Requires RESEND_API_KEY and RESEND_FROM env vars.
// Returns 501 (not implemented) when not configured — callers should treat
// this as a non-fatal error so the core user flow is never blocked.
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(501).json({ error: 'Email not configured' });

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return res.status(501).json({ error: 'Auth not configured' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (!token) return res.status(401).json({ error: 'Sign in required' });

  let user;
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user?.email) return res.status(401).json({ error: 'Invalid or expired session' });
    user = data.user;
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  const { subject, html } = req.body || {};
  if (!subject || !html) return res.status(400).json({ error: 'Missing subject or html' });

  const from = process.env.RESEND_FROM || 'Koala Statements <hello@koalastatements.com>';
  // Never trust a client-supplied recipient — always mail the authenticated user.
  const to = user.email;

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
