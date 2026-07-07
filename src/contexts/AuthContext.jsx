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
  // Flag the pending OAuth so PostAuthRedirect (see App.jsx) can route the
  // user once the session resolves. Preserve any destination already stashed
  // (e.g. an in-progress model the user came from); only fall back to the
  // dashboard when nothing was set.
  let dest = '/dashboard';
  try {
    const existing = sessionStorage.getItem('koala:postAuthRedirect');
    if (existing) dest = existing; else sessionStorage.setItem('koala:postAuthRedirect', dest);
  } catch {}
  // Always ask Supabase to send the browser back to the bare origin, not the
  // deep path — a deep path (e.g. /dashboard) has to be individually allowed
  // in the Supabase project's Auth > URL Configuration > Redirect URLs list,
  // and if it isn't, Supabase silently drops it and falls back to the Site
  // URL, which is what made this look like "Google sign-in dumps you on the
  // homepage." The bare origin is virtually always the allowed Site URL
  // itself, so this always lands cleanly, and PostAuthRedirect then reads
  // the stashed destination from sessionStorage and finishes the trip.
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signOut() {
  if (!supabase) return;
  capture('auth_signed_out');
  await supabase.auth.signOut();
}

// Removes all locally cached Koala data (project index, individual projects,
// shares, last-active pointer). Used after an account deletion so nothing about
// the old account lingers in this browser.
function clearLocalKoalaData() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('koala:')) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
  } catch {}
}

// Permanently deletes the signed-in user's account. The actual deletion happens
// server-side (/api/delete-account) with the Supabase service-role key; here we
// just authenticate the request, then sign out and wipe local data so the
// browser is left in a clean signed-out state.
export async function deleteAccount() {
  if (!supabase) throw new Error('Auth not configured');
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('You need to be signed in to delete your account.');

  const res = await withTimeout(fetch('/api/delete-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  }));

  let body = {};
  try { body = await res.json(); } catch {}
  if (!res.ok) throw new Error(body.error || 'Could not delete your account. Please try again.');

  capture('account_deleted');
  try { await supabase.auth.signOut(); } catch {}
  clearLocalKoalaData();
  analyticsReset();
}
