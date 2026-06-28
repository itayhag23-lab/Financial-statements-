import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { FONTS } from '../brand/theme';
import { supabase } from '../lib/supabase';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, useAuth } from '../contexts/AuthContext';

const P = {
  bgDark:    '#070D1A',
  bgCard:    '#0F172A',
  border:    'rgba(255,255,255,0.08)',
  ink:       '#F8FAFC',
  ink2:      'rgba(248,250,252,0.55)',
  muted:     'rgba(248,250,252,0.35)',
  accent:    '#10B981',
  accentSoft:'rgba(16,185,129,0.12)',
  accentBorder:'rgba(16,185,129,0.3)',
  error:     '#F87171',
  inputBg:   'rgba(255,255,255,0.04)',
  inputBorder:'rgba(255,255,255,0.1)',
  inputFocus:'rgba(16,185,129,0.5)',
};

const body = { fontFamily: FONTS.body };
const disp = { fontFamily: FONTS.display };

function BrandLockup() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <img src="/koala-mascot.png" alt="" width={48} height={48} style={{ display: 'block', objectFit: 'contain', flexShrink: 0 }} />
      <span style={{ ...disp, fontSize: 20, fontWeight: 700, color: P.ink, letterSpacing: '-0.03em' }}>
        Koala <span style={{ color: P.accent, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', verticalAlign: 'middle', marginLeft: 2 }}>Statements</span>
      </span>
    </span>
  );
}

function Input({ icon: Icon, type = 'text', placeholder, value, onChange, onToggleShow, showToggle, error }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: P.inputBg,
        border: `1px solid ${error ? P.error : focused ? P.inputFocus : P.inputBorder}`,
        borderRadius: 10, padding: '0 14px',
        transition: 'border-color 180ms ease',
      }}>
        <Icon size={15} color={focused ? P.accent : P.muted} style={{ flexShrink: 0, transition: 'color 180ms' }} />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...body, flex: 1, background: 'none', border: 'none', outline: 'none',
            color: P.ink, fontSize: 14.5, padding: '13px 0',
            '::placeholder': { color: P.muted },
          }}
        />
        {showToggle && (
          <button type="button" onClick={onToggleShow} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: P.muted, display: 'flex' }}>
            {type === 'password' ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <div style={{ ...body, fontSize: 12, color: P.error, marginTop: 5 }}>{error}</div>}
    </div>
  );
}

function friendlyError(msg = '') {
  const m = msg.toLowerCase();
  if (m.includes('email rate limit') || m.includes('over_email_send_rate_limit'))
    return 'Too many attempts. Please wait a few minutes, then try again — or check your inbox for a confirmation link.';
  if (m.includes('unsupported provider') || m.includes('provider is not enabled'))
    return 'Google sign-in isn\'t enabled yet. Please use email and password below.';
  if (m.includes('invalid login credentials') || m.includes('invalid_credentials'))
    return 'Incorrect email or password.';
  if (m.includes('email not confirmed'))
    return 'Please check your inbox and click the confirmation link first, then sign in.';
  if (m.includes('user already registered'))
    return 'An account with this email already exists. Try signing in instead.';
  if (m.includes('password should be at least'))
    return 'Password must be at least 6 characters.';
  return msg || 'Something went wrong. Please try again.';
}

export default function AuthPage() {
  const navigate  = useNavigate();
  const user      = useAuth();
  const [mode, setMode]           = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  // Where to send the user after a successful auth. If they were sent here from
  // somewhere in the app (e.g. trying an AI feature), return them there; this is
  // stashed in sessionStorage by the caller. Otherwise default to the dashboard.
  const postAuthDest = () => {
    try {
      const d = sessionStorage.getItem('koala:postAuthRedirect');
      if (d) { sessionStorage.removeItem('koala:postAuthRedirect'); return d; }
    } catch {}
    return '/dashboard';
  };

  // Redirect if already signed in
  useEffect(() => {
    if (user) navigate(postAuthDest(), { replace: true });
  }, [user, navigate]);

  // If Supabase isn't configured, skip straight to app
  useEffect(() => {
    if (!supabase) navigate('/app', { replace: true });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        navigate(postAuthDest(), { replace: true });
      } else {
        const signedIn = await signUpWithEmail(email, password);
        if (signedIn) {
          navigate(postAuthDest(), { replace: true });
        } else {
          setSuccess('Check your email for a confirmation link, then sign in.');
          setMode('signin');
        }
      }
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      // Google OAuth redirects the browser — no manual navigate needed here
    } catch (err) {
      setError(friendlyError(err.message));
      setLoading(false);
    }
  };

  return (
    <div className="koala-page" style={{ minHeight: '100vh', background: P.bgDark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', boxSizing: 'border-box' }}>

      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(16,185,129,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}><BrandLockup /></Link>
          <div style={{ ...disp, fontSize: 22, fontWeight: 700, color: P.ink, marginTop: 20, letterSpacing: '-0.02em' }}>
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </div>
          <div style={{ ...body, fontSize: 14, color: P.ink2, marginTop: 6 }}>
            {mode === 'signin' ? 'Sign in to access your financial models' : 'Models saved forever, shareable anywhere'}
          </div>
        </div>

        {/* Card */}
        <div style={{ background: P.bgCard, border: `1px solid ${P.border}`, borderRadius: 16, padding: '28px 24px', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)' }}>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            style={{
              ...body, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: 'rgba(255,255,255,0.05)', border: `1px solid ${P.border}`,
              borderRadius: 10, padding: '12px 16px', cursor: 'pointer',
              fontSize: 14, fontWeight: 500, color: P.ink,
              transition: 'background 150ms, border-color 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = P.border; }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: P.border }} />
            <span style={{ ...body, fontSize: 12, color: P.muted }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: P.border }} />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input icon={Mail} type="email" placeholder="Email address" value={email} onChange={setEmail} />
            <Input
              icon={Lock}
              type={showPass ? 'text' : 'password'}
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={setPassword}
              showToggle
              onToggleShow={() => setShowPass(v => !v)}
            />

            {error   && <div style={{ ...body, fontSize: 13, color: P.error, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '9px 12px' }}>{error}</div>}
            {success && <div style={{ ...body, fontSize: 13, color: P.accent, background: P.accentSoft, border: `1px solid ${P.accentBorder}`, borderRadius: 8, padding: '9px 12px' }}>{success}</div>}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...body, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: loading ? 'rgba(16,185,129,0.5)' : P.accent,
                color: '#0F172A', border: 'none', borderRadius: 10,
                padding: '13px 16px', fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
                transition: 'opacity 150ms',
              }}
            >
              {loading ? 'Please wait…' : mode === 'signin' ? <><ArrowRight size={16} /> Sign in</> : <><ArrowRight size={16} /> Create account</>}
            </button>
          </form>

          {/* Toggle mode */}
          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <span style={{ ...body, fontSize: 13, color: P.muted }}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              type="button"
              onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess(''); }}
              style={{ ...body, fontSize: 13, color: P.accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
            >
              {mode === 'signin' ? 'Sign up free' : 'Sign in'}
            </button>
          </div>
        </div>

        {/* Continue without signing in */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/app" style={{ ...body, fontSize: 13, color: P.muted, textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 1 }}>
            Continue without signing in →
          </Link>
          <div style={{ ...body, fontSize: 11, color: 'rgba(248,250,252,0.2)', marginTop: 6 }}>
            Models will only be saved in this browser
          </div>
        </div>
      </div>
    </div>
  );
}
