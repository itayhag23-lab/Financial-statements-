import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import ReactDOM from 'react-dom';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { C, FONTS } from '../../brand/theme';

// First-run guided walkthrough ("coach-marks"). A lightweight, dependency-free
// spotlight + tooltip built on the same portal / rect-positioning / escape
// pattern as HelpTooltip — kept custom so it matches the inline-styled design
// system and stays clean under the app's strict CSP (no third-party CSS/eval).
//
// Props:
//   open      — whether the tour is running
//   steps     — [{ target:'[data-tour="…"]', title, body, placement, onBeforeStep? }]
//   onClose   — user dismissed (X / Skip / Esc) before finishing
//   onFinish  — user reached and confirmed the final step

const BUBBLE_WIDTH = 320;
const MARGIN = 14;          // keep the bubble this far from the viewport edge
const GAP = 14;             // distance between the highlighted target and bubble
const PAD = 6;              // spotlight padding around the target

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ProductTour({ open, steps = [], onClose, onFinish }) {
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState(null);       // highlighted target rect (or null → centered)
  const [pos, setPos] = useState({ top: 0, left: 0, placement: 'bottom' });
  const bubbleRef = useRef(null);
  const nextBtnRef = useRef(null);
  const titleId = useId();
  const bodyId = useId();

  const step = steps[idx];
  const isFirst = idx === 0;
  const isLast = idx === steps.length - 1;

  const finish = useCallback(() => { onFinish?.(); }, [onFinish]);
  const close = useCallback(() => { onClose?.(); }, [onClose]);
  const goNext = useCallback(() => {
    if (isLast) finish();
    else setIdx((i) => Math.min(steps.length - 1, i + 1));
  }, [isLast, finish, steps.length]);
  const goBack = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);

  // Reset to the first step every time the tour is (re)opened.
  useEffect(() => { if (open) setIdx(0); }, [open]);

  // Resolve the current target, scroll it into view, then measure + position.
  useEffect(() => {
    if (!open || !step) return;
    let raf1 = 0, raf2 = 0;
    step.onBeforeStep?.();
    const measure = () => {
      const el = typeof document !== 'undefined' ? document.querySelector(step.target) : null;
      if (!el) { setRect(null); place(null); return; }
      const smooth = !prefersReducedMotion();
      try { el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center', inline: 'center' }); } catch { el.scrollIntoView(); }
      // Wait a frame for the scroll to settle before reading the rect.
      raf2 = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        setRect(r);
        place(r);
      });
    };
    // Let onBeforeStep-driven state (e.g. switching to the Income tab) mount first.
    raf1 = requestAnimationFrame(measure);
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
    // eslint-disable-next-line
  }, [open, idx, step]);

  const place = (r) => {
    const vw = window.innerWidth, vh = window.innerHeight;
    if (!r) { // no target → center the bubble
      setPos({ top: Math.max(MARGIN, vh / 2 - 90), left: Math.max(MARGIN, vw / 2 - BUBBLE_WIDTH / 2), placement: 'center' });
      return;
    }
    const want = step?.placement || 'auto';
    const below = vh - r.bottom, above = r.top;
    let placement = want;
    if (want === 'auto') placement = below > 220 || below >= above ? 'bottom' : 'top';
    let top, left = Math.min(Math.max(MARGIN, r.left + r.width / 2 - BUBBLE_WIDTH / 2), vw - BUBBLE_WIDTH - MARGIN);
    if (placement === 'bottom') top = r.bottom + GAP;
    else if (placement === 'top') top = r.top - GAP;               // translated up via transform
    else { top = Math.min(Math.max(MARGIN, r.top), vh - 180); left = r.right + GAP; if (placement === 'left') left = r.left - GAP; }
    setPos({ top, left, placement });
  };

  // Reposition on scroll/resize while the tour is open.
  useEffect(() => {
    if (!open) return;
    const onReposition = () => {
      const el = step && typeof document !== 'undefined' ? document.querySelector(step.target) : null;
      const r = el ? el.getBoundingClientRect() : null;
      setRect(r); place(r);
    };
    window.addEventListener('scroll', onReposition, true);
    window.addEventListener('resize', onReposition);
    return () => {
      window.removeEventListener('scroll', onReposition, true);
      window.removeEventListener('resize', onReposition);
    };
    // eslint-disable-next-line
  }, [open, idx, step]);

  // Keyboard: Esc closes, →/Enter advances, ← goes back. Trap Tab in the bubble.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goBack(); }
      else if (e.key === 'Enter') {
        // Enter advances unless focus is on the Back/Skip control.
        const t = e.target;
        if (t && (t.dataset?.tourAction === 'back' || t.dataset?.tourAction === 'skip')) return;
        e.preventDefault(); goNext();
      } else if (e.key === 'Tab') {
        const focusables = bubbleRef.current?.querySelectorAll('button');
        if (!focusables || !focusables.length) return;
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close, goNext, goBack]);

  // Move focus into the bubble on each step so keyboard users land in-context.
  useEffect(() => { if (open) nextBtnRef.current?.focus(); }, [open, idx]);

  if (!open || !step) return null;

  const transform =
    pos.placement === 'top' ? 'translateY(-100%)' :
    pos.placement === 'left' ? 'translateX(-100%)' : 'none';

  const spotlight = rect ? {
    position: 'fixed',
    top: rect.top - PAD, left: rect.left - PAD,
    width: rect.width + PAD * 2, height: rect.height + PAD * 2,
    borderRadius: 10, pointerEvents: 'none', zIndex: 10000,
    boxShadow: '0 0 0 9999px rgba(15,23,42,0.55)',
    transition: prefersReducedMotion() ? 'none' : 'all 240ms cubic-bezier(0.16,1,0.3,1)',
  } : null;

  return ReactDOM.createPortal(
    <>
      {/* Overlay. When a target exists we use the box-shadow "cut-out" above and
          a transparent click-blocker; otherwise a plain scrim. */}
      {rect
        ? <><div style={spotlight} aria-hidden="true" />
            <div onClick={close} aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 9999, cursor: 'default' }} /></>
        : <div onClick={close} aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.55)' }} />}

      <div
        ref={bubbleRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        style={{
          position: 'fixed', top: pos.top, left: pos.left, width: BUBBLE_WIDTH, zIndex: 10001,
          transform, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
          boxShadow: '0 20px 48px -12px rgba(15,23,42,0.34)', padding: '16px 18px 14px',
          animation: prefersReducedMotion() ? 'none' : 'koala-tour-in 180ms ease-out',
        }}
      >
        <style>{'@keyframes koala-tour-in{from{opacity:0;transform:'+transform+' translateY(6px)}to{opacity:1;transform:'+transform+'}}'}</style>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: FONTS.body, fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.goldText }}>
            Step {idx + 1} of {steps.length}
          </span>
          <button
            type="button" data-tour-action="skip" onClick={close} aria-label="Skip the tour"
            style={{ display: 'inline-flex', padding: 3, borderRadius: 6, background: 'transparent', border: 'none', color: C.faint, cursor: 'pointer' }}
          ><X size={15} /></button>
        </div>

        <div id={titleId} style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 5, lineHeight: 1.25 }}>
          {step.title}
        </div>
        <div id={bodyId} style={{ fontFamily: FONTS.body, fontSize: 12.5, lineHeight: 1.55, color: C.ink2 }}>
          {step.body}
        </div>

        {/* Progress dots */}
        <div aria-hidden="true" style={{ display: 'flex', gap: 4, marginTop: 12, marginBottom: 12 }}>
          {steps.map((_, i) => (
            <span key={i} style={{ height: 3, flex: 1, borderRadius: 3, background: i <= idx ? C.gold : C.border, transition: prefersReducedMotion() ? 'none' : 'background 200ms ease-out' }} />
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <button
            type="button" data-tour-action="skip" onClick={close}
            style={{ fontFamily: FONTS.body, fontSize: 12, color: C.muted, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 2px' }}
          >Skip</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!isFirst && (
              <button
                type="button" data-tour-action="back" onClick={goBack}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: FONTS.body, fontSize: 12.5, color: C.ink2, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 12px', cursor: 'pointer' }}
              ><ArrowLeft size={13} /> Back</button>
            )}
            <button
              ref={nextBtnRef} type="button" data-tour-action="next" onClick={goNext}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: FONTS.body, fontSize: 12.5, fontWeight: 600, color: C.ink, background: C.gold, border: `1px solid ${C.gold}`, borderRadius: 8, padding: '7px 14px', cursor: 'pointer' }}
            >{isLast ? <>Done <Check size={13} /></> : <>Next <ArrowRight size={13} /></>}</button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
