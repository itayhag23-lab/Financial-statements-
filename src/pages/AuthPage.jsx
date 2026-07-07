import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import { FONTS } from '../brand/theme';
import { supabase } from '../lib/supabase';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, useAuth } from '../contexts/AuthContext';

const P = {
  bgDark:    '#070D1A',
  bgCard:    '#0F172A',
  bgPanel:   '#0B101B',   // brand panel surface (landing's dark "statement" block)
  border:    'rgba(255,255,255,0.08)',
  ink:       '#F8FAFC',
  ink2:      'rgba(248,250,252,0.55)',
  muted:     'rgba(248,250,252,0.35)',
  accent:    '#10B981',
  accentDeep:'#047857',
  accentMid: '#059669',
  accentSoft:'rgba(16,185,129,0.12)',
  accentBorder:'rgba(16,185,129,0.3)',
  error:     '#F87171',
  inputBg:   'rgba(255,255,255,0.04)',
  inputBorder:'rgba(255,255,255,0.1)',
  inputFocus:'rgba(16,185,129,0.5)',
};

const body = { fontFamily: FONTS.body };
const disp = { fontFamily: FONTS.display };

// Hydration-safe responsive hook — first render assumes desktop (false).
function useIsMobile(bp = 900) {
  const [mob, setMob] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp}px)`);
    setMob(mq.matches);
    const fn = e => setMob(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, [bp]);
  return mob;
}

// Stacked lockup matching the landing's BrandLockup.
function BrandLockup({ size = 34 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <img src="/koala-mascot.png" alt="" width={size * 1.85} height={size * 1.85} style={{ display: 'block', objectFit: 'contain', flexShrink: 0 }} />
      <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ ...disp, fontWeight: 700, fontSize: size * 0.62, color: P.ink, letterSpacing: '-0.03em' }}>Koala</span>
        <span style={{ ...body, fontWeight: 600, fontSize: size * 0.29, color: P.accent, letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 3 }}>Statements</span>
      </span>
    </span>
  );
}

const VALUE_BULLETS = [
  'Full 3-statement model in under 60 seconds',
  'Every line item explained in plain English',
  'Investor-ready exports that hold up to scrutiny',
  'Free forever · No credit card required',
];

// Left brand / value panel (desktop only).
function BrandPanel() {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: `linear-gradient(160deg, ${P.bgPanel} 0%, #070D1A 100%)`,
      borderRight: `1px solid ${P.border}`,
      padding: '48px 44px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      minHeight: 560,
    }}>
      {/* Ambient emerald glow */}
      <div style={{ position: 'absolute', top: -120, left: -80, width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(16,185,129,0.16) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative' }}>
        <Link to="/" aria-label="Koala Statements home" style={{ textDecoration: 'none', display: 'inline-block' }}>
          <BrandLockup size={34} />
        </Link>
      </div>

      <div style={{ position: 'relative' }}>
        <h1 style={{ ...disp, fontSize: 'clamp(28px, 2.6vw, 38px)', fontWeight: 800, color: P.ink, letterSpacing: '-0.03em', lineHeight: 1.12, margin: '0 0 16px' }}>
          Your investors expect<br />institutional quality.
        </h1>
        <p style={{ ...body, fontSize: 15.5, color: P.ink2, lineHeight: 1.65, maxWidth: 380, margin: '0 0 32px' }}>
          Build a complete, defensible financial model without a spreadsheet, a finance degree, or a credit card.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          {VALUE_BULLETS.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span aria-hidden="true" style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 8, background: P.accentSoft, border: `1px solid ${P.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={14} color={P.accent} strokeWidth={2.75} />
              </span>
              <span style={{ ...body, fontSize: 14.5, color: 'rgba(248,250,252,0.82)', lineHeight: 1.4 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: P.accent, animation: 'authPulse 1.6s ease-in-out infinite', flexShrink: 0 }} />
        <span style={{ ...body, fontSize: 12.5, color: P.muted, letterSpacing: '0.01em' }}>Trusted by founders building their next raise</span>
      </div>
    </div>
  );
}

function Input({ icon: Icon, type = 'text', placeholder, value, onChange, onToggleShow, showToggle, error }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 11,
        background: focused ? 'rgba(255,255,255,0.06)' : P.inputBg,
        border: `1px solid ${error ? P.error : focused ? P.inputFocus : P.inputBorder}`,
        borderRadius: 12, padding: '0 15px',
        boxShadow: focused ? '0 0 0 3px rgba(16,185,129,0.14)' : 'none',
        transition: 'border-color 180ms ease, box-shadow 180ms ease, background 180ms ease',
      }}>
        <Icon size={16} color={focused ? P.accent : P.muted} style={{ flexShrink: 0, transition: 'color 180ms' }} />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...body, flex: 1, background: 'none', border: 'none', outline: 'none',
            color: P.ink, fontSize: 14.5, padding: '14px 0',
            '::placeholder': { color: P.muted },
          }}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggleShow}
            aria-label={type === 'password' ? 'Show password' : 'Hide password'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, margin: -6, color: P.muted, display: 'flex' }}
          >
            {type === 'password' ? <EyeOff size={16} /> : <Eye size={16} />}
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
    return 'Too many attempts. Please wait a few minutes, then try again, or check your inbox for a confirmation link.';
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

  const mob = useIsMobile(900);

  return (
    <div className="koala-page" style={{ minHeight: '100vh', background: P.bgDark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: mob ? '28px 16px' : '40px 24px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>

      <style>{`@keyframes authPulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.82); } }`}</style>

      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: '18%', left: '50%', transform: 'translateX(-50%)', width: 720, height: 340, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(16,185,129,0.10) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{
        width: '100%', maxWidth: mob ? 440 : 980, position: 'relative',
        display: 'grid', gridTemplateColumns: mob ? '1fr' : '1.02fr 1fr',
        background: P.bgCard, border: `1px solid ${P.border}`,
        borderRadius: mob ? 20 : 24, overflow: 'hidden',
        boxShadow: '0 50px 100px -30px rgba(0,0,0,0.7)',
      }}>

        {/* LEFT — brand / value panel (desktop only) */}
        {!mob && <BrandPanel />}

        {/* RIGHT — auth form panel */}
        <div style={{ padding: mob ? '30px 22px 32px' : '48px 44px' }}>

          {/* Compact brand lockup + tagline (mobile only) */}
          {mob && (
            <div style={{ textAlign: 'center', marginBottom: 26 }}>
              <Link to="/" aria-label="Koala Statements home" style={{ textDecoration: 'none', display: 'inline-block' }}>
                <BrandLockup size={30} />
              </Link>
              <div style={{ ...body, fontSize: 13, color: P.ink2, marginTop: 14, lineHeight: 1.5 }}>
                Institutional-quality financial models, in minutes.
              </div>
            </div>
          )}

          {/* Welcome copy */}
          <div style={{ marginBottom: 26, textAlign: mob ? 'center' : 'left' }}>
            <div style={{ ...disp, fontSize: mob ? 22 : 26, fontWeight: 800, color: P.ink, letterSpacing: '-0.025em' }}>
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </div>
            <div style={{ ...body, fontSize: 14.5, color: P.ink2, marginTop: 7, lineHeight: 1.55 }}>
              {mode === 'signin' ? 'Sign in to access your financial models' : 'Models saved forever, shareable anywhere'}
            </div>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            style={{
              ...body, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: 'rgba(255,255,255,0.05)', border: `1px solid ${P.border}`,
              borderRadius: 12, padding: '13px 16px', cursor: 'pointer', minHeight: 48,
              fontSize: 14.5, fontWeight: 600, color: P.ink,
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
            <span style={{ ...body, fontSize: 12, color: P.muted, letterSpacing: '0.02em' }}>or continue with email</span>
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

            {error   && <div style={{ ...body, fontSize: 13, color: P.error, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '10px 13px', lineHeight: 1.45 }}>{error}</div>}
            {success && <div style={{ ...body, fontSize: 13, color: P.accent, background: P.accentSoft, border: `1px solid ${P.accentBorder}`, borderRadius: 10, padding: '10px 13px', lineHeight: 1.45 }}>{success}</div>}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...body, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: loading ? P.accentMid : P.accentDeep,
                color: '#FFFFFF', border: 'none', borderRadius: 12,
                padding: '14px 16px', minHeight: 48, fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
                boxShadow: loading ? 'none' : '0 10px 24px -8px rgba(4,120,87,0.55)',
                transition: 'transform 150ms ease, box-shadow 150ms ease, background 150ms ease',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = P.accentMid; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = P.accentDeep; e.currentTarget.style.transform = 'translateY(0)'; } }}
            >
              {loading ? 'Please wait…' : mode === 'signin' ? <>Sign in <ArrowRight size={17} /></> : <>Create account <ArrowRight size={17} /></>}
            </button>
          </form>

          {/* Toggle mode */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
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

          {/* Continue without signing in */}
          <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 22, borderTop: `1px solid ${P.border}` }}>
            <Link to="/app?new=manual" style={{ ...body, fontSize: 13, color: P.ink2, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
              Continue without signing in <ArrowRight size={14} />
            </Link>
            <div style={{ ...body, fontSize: 11.5, color: P.muted, marginTop: 7 }}>
              Models will only be saved in this browser
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
