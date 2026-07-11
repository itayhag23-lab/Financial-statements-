import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Check, Sparkles, Loader2 } from 'lucide-react';
import { C, FONTS } from '../../brand/theme';
import { useDialog } from '../../lib/useDialog';
import { PRICING, PRO_FEATURES, FREE_AI_CREDITS, startCheckout } from '../../lib/subscription';

// Upgrade-to-Pro modal. Opened when a free user runs out of AI credits (or from
// an explicit "Upgrade" entry). Monthly/yearly toggle, feature list, and a CTA
// that kicks off Stripe Checkout. Dependency-free, inline styles, CSP-clean.

export default function PricingModal({ open, onClose, reason, creditsLeft }) {
  const [interval, setInterval] = useState('year'); // default to the better-value plan
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const ref = useDialog(open ? onClose : null, open);

  if (!open) return null;

  const plan = interval === 'year' ? PRICING.yearly : PRICING.monthly;

  const upgrade = async () => {
    setBusy(true); setErr(null);
    try { await startCheckout(interval); }
    catch (e) { setErr(e.message || 'Could not start checkout.'); setBusy(false); }
  };

  const Toggle = ({ id, label, sub }) => {
    const on = interval === id;
    return (
      <button
        type="button"
        onClick={() => setInterval(id)}
        aria-pressed={on}
        style={{
          flex: 1, textAlign: 'left', padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
          background: on ? C.goldSoft : C.surface, border: `1.5px solid ${on ? C.gold : C.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: C.ink }}>{label}</span>
          <span style={{ width: 15, height: 15, borderRadius: '50%', border: `1.5px solid ${on ? C.gold : C.faint}`, background: on ? C.gold : 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {on && <Check size={10} color="#fff" />}
          </span>
        </div>
        {sub && <div style={{ fontFamily: FONTS.body, fontSize: 11.5, color: C.muted, marginTop: 3 }}>{sub}</div>}
      </button>
    );
  };

  return ReactDOM.createPortal(
    <>
      <div onClick={onClose} aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(15,23,42,0.55)' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}>
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="Upgrade to Koala Pro"
          tabIndex={-1}
          style={{ pointerEvents: 'auto', width: 'min(440px, calc(100vw - 32px))', maxHeight: 'calc(100vh - 32px)', overflowY: 'auto', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, boxShadow: '0 24px 60px -12px rgba(15,23,42,0.4)', padding: '24px 24px 20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FONTS.body, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.goldText, background: C.goldSoft, borderRadius: 999, padding: '5px 11px' }}>
              <Sparkles size={13} /> Koala Pro
            </span>
            <button type="button" onClick={onClose} aria-label="Close" style={{ display: 'inline-flex', padding: 4, borderRadius: 6, background: 'transparent', border: 'none', color: C.faint, cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          <h2 style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.2, margin: '6px 0 6px' }}>
            {reason === 'out-of-credits' ? 'You’ve used your free AI runs' : 'Unlock the AI features'}
          </h2>
          <p style={{ fontFamily: FONTS.body, fontSize: 14, lineHeight: 1.6, color: C.ink2, margin: '0 0 18px' }}>
            {reason === 'out-of-credits'
              ? `You've used all ${FREE_AI_CREDITS} free AI runs. Upgrade to Pro for unlimited AI Advisor and Build-from-description.`
              : `The AI Advisor and Build-from-description are part of Koala Pro. Everything else stays free, always.`}
          </p>

          {/* Interval toggle */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
            <Toggle id="year" label={`${PRICING.symbol}${PRICING.yearly.amount}/yr`} sub={`${PRICING.symbol}${PRICING.yearly.perMonth}/mo · ${PRICING.yearly.monthsFree} months free`} />
            <Toggle id="month" label={`${PRICING.symbol}${PRICING.monthly.amount}/mo`} sub="Billed monthly" />
          </div>

          {/* Price headline */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
            <span style={{ fontFamily: FONTS.display, fontSize: 34, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>{PRICING.symbol}{plan.amount}</span>
            <span style={{ fontFamily: FONTS.body, fontSize: 14, color: C.muted }}>/ {plan.per}</span>
            {interval === 'year' && (
              <span style={{ marginLeft: 'auto', fontFamily: FONTS.body, fontSize: 11.5, fontWeight: 700, color: C.green, background: C.greenSoft, borderRadius: 999, padding: '4px 10px' }}>Save {PRICING.yearly.savePct}%</span>
            )}
          </div>

          {/* Features */}
          <ul style={{ listStyle: 'none', margin: '0 0 20px', padding: 0 }}>
            {PRO_FEATURES.map((f, i) => (
              <li key={i} style={{ display: 'flex', gap: 9, marginBottom: 10 }}>
                <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: '50%', background: C.greenSoft, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                  <Check size={11} color={C.green} />
                </span>
                <span style={{ fontFamily: FONTS.body, fontSize: 13.5, lineHeight: 1.5, color: C.ink2 }}>{f}</span>
              </li>
            ))}
          </ul>

          {err && (
            <div style={{ fontFamily: FONTS.body, fontSize: 12.5, color: C.rust, background: C.rustSoft, border: `1px solid ${C.rust}33`, borderRadius: 8, padding: '8px 11px', marginBottom: 12 }}>{err}</div>
          )}

          <button
            type="button"
            onClick={upgrade}
            disabled={busy}
            style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: FONTS.body, fontSize: 15, fontWeight: 700, color: C.ink, background: C.gold, border: `1px solid ${C.gold}`, borderRadius: 10, padding: '12px 18px', cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}
          >
            {busy ? <><Loader2 size={16} className="koala-spin" /> Redirecting…</> : <>Upgrade to Pro <Sparkles size={15} /></>}
          </button>
          <div style={{ fontFamily: FONTS.body, fontSize: 11.5, color: C.muted, textAlign: 'center', marginTop: 10 }}>
            Secure checkout via Lemon Squeezy · Cancel anytime
          </div>

          <style>{'@keyframes koala-spin{to{transform:rotate(360deg)}}.koala-spin{animation:koala-spin 1s linear infinite}'}</style>
        </div>
      </div>
    </>,
    document.body
  );
}
