const { createClient } = require('@supabase/supabase-js');

// Account self-deletion.
//
// Deleting a Supabase auth user is an admin operation, so it must run on the
// server with the service-role key — never in the browser. We first verify the
// caller's bearer token with the public anon key (so a user can only delete
// THEIR OWN account), then delete that exact user id with the admin client.
//
// The `projects` and `shares` tables reference auth.users(id) with
// ON DELETE CASCADE, so removing the auth user also removes all of their stored
// models and share links — no extra cleanup needed here.

async function getAuthedUser(req, supabaseUrl, anonKey) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  const supabase = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl  = process.env.REACT_APP_SUPABASE_URL;
  const anonKey      = process.env.REACT_APP_SUPABASE_ANON_KEY;
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey) {
    return res.status(500).json({ error: 'Supabase is not configured.' });
  }
  if (!serviceKey) {
    return res.status(500).json({ error: 'Account deletion is not enabled — SUPABASE_SERVICE_ROLE_KEY is missing.' });
  }

  const user = await getAuthedUser(req, supabaseUrl, anonKey);
  if (!user) {
    return res.status(401).json({ error: 'Sign in required.' });
  }

  try {
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      return res.status(500).json({ error: error.message || 'Could not delete the account.' });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not delete the account.' });
  }
};
