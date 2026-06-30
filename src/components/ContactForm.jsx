import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { FONTS } from '../brand/theme';

// EmailJS credentials live in environment variables (.env). Because this is a
// Create React App project, they MUST be prefixed with REACT_APP_ to be exposed
// to the client bundle:
//   REACT_APP_EMAILJS_SERVICE_ID
//   REACT_APP_EMAILJS_TEMPLATE_ID
//   REACT_APP_EMAILJS_PUBLIC_KEY
// The Public Key is safe to ship to the browser; still allowlist your domain in
// the EmailJS dashboard so the template can't be abused from elsewhere.
// EmailJS Service ID, Template ID and Public Key are all designed to be exposed
// in the browser, so we ship working defaults and let env vars override them.
// Lock the template to your domain in EmailJS → Account → Security to stop abuse.
const SERVICE_ID  = process.env.REACT_APP_EMAILJS_SERVICE_ID  || 'service_mfxkd6';
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'template_sps6i1m';
const PUBLIC_KEY  = process.env.REACT_APP_EMAILJS_PUBLIC_KEY  || 'VxXwvX-5iEi1zNmTJ';

// Two palettes so the same component drops cleanly onto the dark landing page
// and the light dashboard.
const THEMES = {
  dark: {
    label: 'rgba(248,250,252,0.7)', input: 'rgba(255,255,255,0.04)',
    inputBorder: 'rgba(255,255,255,0.12)', inputFocus: 'rgba(16,185,129,0.5)',
    text: '#F8FAFC', placeholder: 'rgba(248,250,252,0.35)',
    accent: '#10B981', accentText: '#0F172A', error: '#F87171',
  },
  light: {
    label: '#334155', input: '#FFFFFF',
    inputBorder: '#E2E8F0', inputFocus: 'rgba(16,185,129,0.55)',
    text: '#0F172A', placeholder: '#94A3B8',
    accent: '#10B981', accentText: '#0F172A', error: '#DC2626',
  },
};

const body = { fontFamily: FONTS.body };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Reusable Contact / Feedback form backed by EmailJS.
 *
 * Props:
 *   theme        'dark' | 'light'  (default 'light')
 *   defaultEmail prefill the email field (e.g. the signed-in user's address)
 *   source       short string sent to the template so you know which surface it
 *                came from (e.g. 'landing' or 'dashboard')
 *   onSent       optional callback fired after a successful send
 */
export default function ContactForm({ theme = 'light', defaultEmail = '', source = 'app', onSent }) {
  const T = THEMES[theme] || THEMES.light;
  const formRef = useRef(null);

  const [values, setValues] = useState({ name: '', email: defaultEmail, message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [serverError, setServerError] = useState('');

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  // ── Front-end validation ──────────────────────────────────────────────────
  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = 'Please enter your name.';
    if (!values.email.trim()) next.email = 'Please enter your email.';
    else if (!EMAIL_RE.test(values.email.trim())) next.email = 'That email doesn’t look right.';
    if (values.message.trim().length < 10) next.message = 'Tell us a little more (10+ characters).';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      setStatus('error');
      setServerError('Messaging isn’t configured yet. Please try again later.');
      return;
    }

    setStatus('sending');
    try {
      // sendForm reads the <input name="..."> fields from the form element.
      // The field names below must match the variables in your EmailJS template
      // (e.g. {{from_name}}, {{reply_to}}, {{message}}, {{source}}).
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, { publicKey: PUBLIC_KEY });
      setStatus('success');
      setValues({ name: '', email: defaultEmail, message: '' });
      onSent && onSent();
    } catch (err) {
      setStatus('error');
      setServerError(err?.text || 'Could not send your message. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ ...body, textAlign: 'center', padding: '28px 20px', borderRadius: 14, background: T.input, border: `1px solid ${T.inputBorder}` }}>
        <CheckCircle2 size={34} color={T.accent} style={{ margin: '0 auto 12px', display: 'block' }} />
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>Thanks, message sent!</div>
        <div style={{ fontSize: 13.5, color: T.label }}>We read every note and usually reply within a day.</div>
        <button
          onClick={() => setStatus('idle')}
          style={{ ...body, marginTop: 16, background: 'none', border: `1px solid ${T.inputBorder}`, color: T.label, borderRadius: 9, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}
        >
          Send another
        </button>
      </div>
    );
  }

  const inputStyle = (field) => ({
    ...body, width: '100%', boxSizing: 'border-box', borderRadius: 10,
    background: T.input, color: T.text, fontSize: 14, padding: '11px 13px',
    border: `1px solid ${errors[field] ? T.error : T.inputBorder}`, outline: 'none',
    transition: 'border-color 150ms',
  });
  const fieldErr = (field) => errors[field] && (
    <div style={{ ...body, fontSize: 12, color: T.error, marginTop: 5 }}>{errors[field]}</div>
  );
  const labelStyle = { ...body, fontSize: 12.5, fontWeight: 600, color: T.label, marginBottom: 6, display: 'block' };

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* These name="" attributes are the EmailJS template variables. They match
          the default "Contact Us" template: {{name}}, {{email}}, {{title}}, {{message}}.
          `title` becomes the email subject ("Contact Us: {{title}}"); `source`
          is an extra harmless field noting which page the message came from. */}
      <input type="hidden" name="title" value={`${source === 'dashboard' ? 'Dashboard' : 'Landing'} feedback: Koala Statements`} readOnly />
      <input type="hidden" name="source" value={source} readOnly />

      <div>
        <label style={labelStyle} htmlFor="cf-name">Name</label>
        <input id="cf-name" name="name" type="text" value={values.name} onChange={set('name')}
          placeholder="Jane Doe" style={inputStyle('name')}
          onFocus={(e) => { e.target.style.borderColor = T.inputFocus; }}
          onBlur={(e) => { e.target.style.borderColor = errors.name ? T.error : T.inputBorder; }} />
        {fieldErr('name')}
      </div>

      <div>
        <label style={labelStyle} htmlFor="cf-email">Email</label>
        <input id="cf-email" name="email" type="email" value={values.email} onChange={set('email')}
          placeholder="you@company.com" style={inputStyle('email')}
          onFocus={(e) => { e.target.style.borderColor = T.inputFocus; }}
          onBlur={(e) => { e.target.style.borderColor = errors.email ? T.error : T.inputBorder; }} />
        {fieldErr('email')}
      </div>

      <div>
        <label style={labelStyle} htmlFor="cf-message">Message</label>
        <textarea id="cf-message" name="message" rows={4} value={values.message} onChange={set('message')}
          placeholder="How can we help, or what would make Koala Statements better?"
          style={{ ...inputStyle('message'), resize: 'vertical', lineHeight: 1.5 }}
          onFocus={(e) => { e.target.style.borderColor = T.inputFocus; }}
          onBlur={(e) => { e.target.style.borderColor = errors.message ? T.error : T.inputBorder; }} />
        {fieldErr('message')}
      </div>

      {status === 'error' && serverError && (
        <div style={{ ...body, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.error, background: 'rgba(220,38,38,0.08)', border: `1px solid ${T.error}55`, borderRadius: 9, padding: '9px 12px' }}>
          <AlertTriangle size={15} /> {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        style={{ ...body, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: status === 'sending' ? 'rgba(16,185,129,0.6)' : T.accent, color: T.accentText,
          border: 'none', borderRadius: 10, padding: '12px 16px', fontSize: 14.5, fontWeight: 700,
          cursor: status === 'sending' ? 'default' : 'pointer' }}
      >
        {status === 'sending' ? 'Sending…' : <><Send size={15} /> Send message</>}
      </button>
    </form>
  );
}
