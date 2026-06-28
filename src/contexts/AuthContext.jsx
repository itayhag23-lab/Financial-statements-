import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { capture, identify, reset as analyticsReset, page } from '../lib/analytics';

const AuthCtx = createContext(null);

const AUTH_TIMEOUT_MS = 15000;

// Supabase requests can hang indefinitely on a flaky connection or a paused
// project — race against a timeout so the UI never gets stuck on "loading".
function withTimeout(promise, ms = AUTH_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out — check your connection and try again.')), ms)
    ),
  ]);
}

// undefined = still loading, null = signed out, object = signed in user
export function AuthProvider({ children }) {
  const [user, setUser] = useState(supabase ? undefined : null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) identify(u.id, { email: u.email });
      if (event === 'SIGNED_OUT') analyticsReset();
    });
    return () => subscription.unsubscribe();
  }, []);

  return <AuthCtx.Provider value={user}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);

export async function signInWithEmail(email, password) {
  if (!supabase) throw new Error('Auth not configured');
  const { error } = await withTimeout(supabase.auth.signInWithPassword({ email, password }));
  if (error) throw error;
  capture('auth_signed_in', { method: 'email' });
}

// Returns true if the account is signed in immediately (no email confirmation
// required), false if Supabase is waiting on a confirmation-link click.
export async function signUpWithEmail(email, password) {
  if (!supabase) throw new Error('Auth not configured');
  const { data, error } = await withTimeout(supabase.auth.signUp({ email, password }));
  if (error) throw error;
  // Supabase silently returns a user with no identities (and no error) when
  // the email is already registered — this is intentional, to prevent
  // account enumeration. Surface it as a normal "already registered" error.
  if (data.user && data.user.identities?.length === 0) {
    throw new Error('User already registered');
  }
  capture('auth_signed_up', { method: 'email' });
  // Welcome email — fire-and-forget, never blocks the signup flow
  fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: email, template: 'welcome' }),
  }).catch(() => {});
  return !!data.session;
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Auth not configured');
  capture('auth_initiated', { method: 'google' });
  // Flag the pending OAuth so we can route to the dashboard once the session
  // resolves — even if Supabase's Site URL config lands us on the homepage.
  // Mirror it into localStorage too: sessionStorage can be dropped across some
  // OAuth round-trips, and the localStorage copy is a durable fallback.
  try {
    sessionStorage.setItem('koala:postAuthRedirect', '/dashboard');
    localStorage.setItem('koala:postAuthRedirect', '/dashboard');
  } catch {}
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/dashboard' },
  });
  if (error) throw error;
}

export async function signOut() {
  if (!supabase) return;
  capture('auth_signed_out');
  await supabase.auth.signOut();
}
