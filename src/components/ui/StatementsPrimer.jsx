import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import ReactDOM from 'react-dom';
import { X, ArrowLeft, ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { C, FONTS } from '../../brand/theme';

// "Statements 101" — a short, friendly macro primer: three cards, one per
// financial statement, answering the big question each one solves. It is the
// conceptual layer above the per-line "?" help (HelpTooltip) and above the
// mechanics ProductTour. Centered modal carousel; dependency-free and
// CSP-clean (inline styles only), mirroring ProductTour's visual grammar.

const CARD_WIDTH = 380;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Single source of truth for the copy (also usable elsewhere if needed).
export const PRIMER_CARDS = [
  {
    kind: 'intro',
    mascot: true,
    eyebrow: 'Financial statements 101',
    title: 'Meet your three statements',
    body: 'Together they answer the three questions every founder needs to know. Here’s the 30-second version — no accounting degree required.',
  },
  {
    kind: 'statement',
    badge: 'Are you making money?',
    title: 'Income Statement',
    what: 'A recap of everything you earned and everything you spent over a period, ending in profit (or loss).',
    why: 'It’s the classic bottom line — proof the business actually makes money once every cost is paid.',
  },
  {
    kind: 'statement',
    badge: 'What do you own vs. owe?',
    title: 'Balance Sheet',
    what: 'A snapshot, frozen on a single day, of everything you own and everything you owe.',
    why: 'It shows what the business is really worth — and how much of it is yours versus the bank’s.',
  },
  {
    kind: 'statement',
    badge: 'Will you run out of cash?',
    title: 'Cash Flow Statement',
    what: 'A trace of the real cash moving in and out of your bank account each period.',
    why: 'You can be profitable on paper and still go broke — this is the statement that warns you first.',
    closer: 'Profit, worth, and cash — three angles on one business. Koala links them, so a change in one updates the others automatically.',
    tip: 'Tip: hover the ⓘ beside any line to see what that specific number means.',
    guideHref: '/learn',
    guideLabel: 'Want the full story? Read the complete guide',
  },
];

export default function StatementsPrimer({ open, onClose, onFinish, initialIndex = 0, cards = PRIMER_CARDS }) {
  const [idx, setIdx] = useState(initialIndex);
  const cardRef = useRef(null);
  const nextBtnRef = useRef(null);
  const titleId = useId();
  const bodyId = useId();

  const card = cards[idx];
  const isFirst = idx === 0;
  const isLast = idx === cards.length - 1;

  const close = useCallback(() => { onClose?.(); }, [onClose]);
  const finish = useCallback(() => { onFinish?.(); }, [onFinish]);
  const goNext = useCallback(() => { if (isLast) finish(); else setIdx((i) => Math.min(cards.length - 1, i + 1)); }, [isLast, finish, cards.length]);
  const goBack = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);

  useEffect(() => { if (open) setIdx(initialIndex); }, [open, initialIndex]);
  useEffect(() => { if (open) nextBtnRef.current?.focus(); }, [open, idx]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goBack(); }
      else if (e.key === 'Enter') {
        const t = e.target;
        if (t && (t.dataset?.primerAction === 'back' || t.dataset?.primerAction === 'skip' || t.tagName === 'A')) return;
        e.preventDefault(); goNext();
      } else if (e.key === 'Tab') {
        const f = cardRef.current?.querySelectorAll('button, a[href]');
        if (!f || !f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close, goNext, goBack]);

  if (!open || !card) return null;

  const eyebrowStyle = { fontFamily: FONTS.body, fontSize: 9, fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase', color: C.muted, marginBottom: 3 };

  return ReactDOM.createPortal(
    <>
      <div onClick={close} aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(15,23,42,0.55)' }} />
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, pointerEvents: 'none' }}
      >
        <div
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={bodyId}
          style={{
            pointerEvents: 'auto', width: 'min(' + CARD_WIDTH + 'px, calc(100vw - 32px))',
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
            boxShadow: '0 24px 60px -12px rgba(15,23,42,0.4)', padding: '22px 24px 16px',
            animation: prefersReducedMotion() ? 'none' : 'koala-primer-in 200ms ease-out',
          }}
        >
          <style>{'@keyframes koala-primer-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}'}</style>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: FONTS.body, fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.goldText }}>
              {card.kind === 'intro' ? 'Start here' : `Statement ${idx} of ${cards.length - 1}`}
            </span>
            <button type="button" data-primer-action="skip" onClick={close} aria-label="Close" style={{ display: 'inline-flex', padding: 3, borderRadius: 6, background: 'transparent', border: 'none', color: C.faint, cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>

          {card.mascot && (
            <img src="/koala-mascot.png" alt="" width={52} height={52} style={{ display: 'block', marginBottom: 12 }} />
          )}

          {card.badge && (
            <div style={{ display: 'inline-block', fontFamily: FONTS.body, fontSize: 11.5, fontWeight: 600, color: C.goldText, background: C.goldSoft, borderRadius: 999, padding: '4px 11px', marginBottom: 10 }}>
              {card.badge}
            </div>
          )}
          {card.eyebrow && <div style={eyebrowStyle}>{card.eyebrow}</div>}

          <div id={titleId} style={{ fontFamily: FONTS.display, fontSize: 21, fontWeight: 600, color: C.ink, lineHeight: 1.2, marginBottom: card.what ? 12 : 6 }}>
            {card.title}
          </div>

          <div id={bodyId}>
            {card.body && (
              <div style={{ fontFamily: FONTS.body, fontSize: 13.5, lineHeight: 1.55, color: C.ink2 }}>{card.body}</div>
            )}
            {card.what && (
              <div style={{ marginBottom: 12 }}>
                <div style={eyebrowStyle}>What it is</div>
                <div style={{ fontFamily: FONTS.body, fontSize: 13, lineHeight: 1.55, color: C.ink2 }}>{card.what}</div>
              </div>
            )}
            {card.why && (
              <div>
                <div style={eyebrowStyle}>Why it matters</div>
                <div style={{ fontFamily: FONTS.body, fontSize: 13, lineHeight: 1.55, color: C.ink2 }}>{card.why}</div>
              </div>
            )}
            {card.closer && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`, fontFamily: FONTS.body, fontSize: 12, lineHeight: 1.5, color: C.ink }}>{card.closer}</div>
            )}
            {card.tip && (
              <div style={{ marginTop: 8, fontFamily: FONTS.body, fontSize: 11, lineHeight: 1.45, color: C.muted }}>{card.tip}</div>
            )}
            {card.guideHref && (
              <a
                href={card.guideHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 10, fontFamily: FONTS.body, fontSize: 12, fontWeight: 600, color: C.goldText, textDecoration: 'none' }}
              >
                {card.guideLabel} <ArrowUpRight size={12} />
              </a>
            )}
          </div>

          <div aria-hidden="true" style={{ display: 'flex', gap: 4, marginTop: 16, marginBottom: 12 }}>
            {cards.map((_, i) => (
              <span key={i} style={{ height: 3, flex: 1, borderRadius: 3, background: i <= idx ? C.gold : C.border, transition: prefersReducedMotion() ? 'none' : 'background 200ms ease-out' }} />
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <button type="button" data-primer-action="skip" onClick={close} style={{ fontFamily: FONTS.body, fontSize: 12, color: C.muted, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 2px' }}>
              Skip
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {!isFirst && (
                <button type="button" data-primer-action="back" onClick={goBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: FONTS.body, fontSize: 12.5, color: C.ink2, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 12px', cursor: 'pointer' }}>
                  <ArrowLeft size={13} /> Back
                </button>
              )}
              <button ref={nextBtnRef} type="button" data-primer-action="next" onClick={goNext} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: FONTS.body, fontSize: 12.5, fontWeight: 600, color: C.ink, background: C.gold, border: `1px solid ${C.gold}`, borderRadius: 8, padding: '7px 14px', cursor: 'pointer' }}>
                {isLast ? <>Got it <Check size={13} /></> : <>Next <ArrowRight size={13} /></>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
