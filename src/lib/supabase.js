// Supabase access — split into a synchronous "is it configured?" flag and an
// async client getter.
//
// @supabase/supabase-js is ~55 KB gzipped and was previously pulled into the
// main bundle (it's imported by AuthProvider, which wraps every route). That
// meant every public/SEO page shipped the whole auth library in the critical
// bundle that gates first paint, even though nobody is signed in there.
//
// Now the library is loaded via dynamic import(), so webpack code-splits it
// into its own async chunk the browser fetches off the critical path.
// Render-time checks use the library-free `isSupabaseConfigured` boolean;
// anything that actually talks to Supabase awaits `getSupabase()`.

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Synchronous, dependency-free: true when cloud persistence + auth are wired up.
// Safe to read during render (no bundle cost).
export const isSupabaseConfigured = !!(url && key);

// Returns a cached Supabase client, creating it on first use by dynamically
// importing the library. Resolves to null when Supabase isn't configured (the
// app then runs in localStorage-only mode).
let clientPromise = null;
export function getSupabase() {
  if (!isSupabaseConfigured) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url, key)
    );
  }
  return clientPromise;
}
