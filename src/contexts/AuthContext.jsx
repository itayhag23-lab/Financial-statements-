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
    body: JSON.stringify({
      to: email,
      subject: 'Welcome to Koala Statements',
      html: welcomeEmail(email),
    }),
  }).catch(() => {});
  return !!data.session;
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Auth not configured');
  capture('auth_initiated', { method: 'google' });
  // Flag the pending OAuth so we can route to the dashboard once the session
  // resolves — even if Supabase's Site URL config lands us on the homepage.
  try { sessionStorage.setItem('koala:postAuthRedirect', '/dashboard'); } catch {}
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

function welcomeEmail(email) {
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
    <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://koalastatements.com'}/app" style="display:inline-block;background:#10B981;color:#0F172A;text-decoration:none;padding:13px 26px;border-radius:10px;font-weight:700;font-size:15px;">Build my first model →</a>
  </div>
  <div style="padding:20px 32px;border-top:1px solid #E2E8F0;">
    <p style="font-size:12px;color:#94A3B8;margin:0;">Not financial advice. If you have questions, reply to this email or visit <a href="https://koalastatements.com" style="color:#10B981;">koalastatements.com</a>.</p>
  </div>
</div>
</body></html>`.trim();
}
