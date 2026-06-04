import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

// null when env vars aren't set — app falls back to localStorage-only mode.
// Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in Vercel env
// (or a local .env file) to enable cloud persistence + auth.
export const supabase = (url && key) ? createClient(url, key) : null;
