import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthCtx = createContext(null);

// undefined = still loading, null = signed out, object = signed in user
export function AuthProvider({ children }) {
  const [user, setUser] = useState(supabase ? undefined : null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return <AuthCtx.Provider value={user}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);

export async function signInWithEmail(email, password) {
  if (!supabase) throw new Error('Auth not configured');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpWithEmail(email, password) {
  if (!supabase) throw new Error('Auth not configured');
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Auth not configured');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/dashboard' },
  });
  if (error) throw error;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
