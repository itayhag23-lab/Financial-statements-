import React, { useState, useRef, useEffect, useId } from 'react';
import ReactDOM from 'react-dom';
import { Info, Sparkles } from 'lucide-react';
import { C, FONTS } from '../../brand/theme';
import { getGlossaryEntry } from '../../lib/financialGlossary';

const POPOVER_WIDTH = 280;
const VIEWPORT_MARGIN = 12;

// Help icon + popover shown next to a financial statement row or metric.
// Look up content by `glossaryKey` (row id / ratio key in financialGlossary.js),
// or pass `what`/`why`/`wizardHint` directly for one-off use. Renders nothing
// if there's no content to show, so unknown custom rows stay icon-free.
export default function HelpTooltip({ glossaryKey, term, what, why, wizardHint, size = 13, className = '' }) {
  const entry = getGlossaryEntry(glossaryKey);
  const resolvedTerm = term || entry?.term || '';
  const resolvedWhat = what !== undefined ? what : entry?.what;
  const resolvedWhy = why !== undefined ? why : entry?.why;
  const resolvedHint = wizardHint !== undefined ? wizardHint : entry?.wizardHint;

  const [hovering, setHovering] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovering || pinned;
  const [pos, setPos] = useState({ top: 0, left: 0, placement: 'bottom' });
  const btnRef = useRef(null);
  const popoverRef = useRef(null);
  const tooltipId = useId();

  const place = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const placement = vh - r.bottom < 200 && r.top > 200 ? 'top' : 'bottom';
    const left = Math.max(VIEWPORT_MARGIN, Math.min(r.left - 8, vw - POPOVER_WIDTH - VIEWPORT_MARGIN));
    const top = placement === 'bottom' ? r.bottom + 8 : r.top - 8;
    setPos({ top, left, placement });
  };

  useEffect(() => {
    if (!open) return;
    place();
    const onReposition = () => place();
    window.addEventListener('scroll', onReposition, true);
    window.addEventListener('resize', onReposition);
    return () => {
      window.removeEventListener('scroll', onReposition, true);
      window.removeEventListener('resize', onReposition);
    };
  }, [open]);

  // Click-to-pin keeps the popover open (for reading/copying on mobile);
  // hover/focus alone only previews it. Both close on outside click or Escape.
  useEffect(() => {
    if (!pinned) return;
    const onDocMouseDown = (e) => {
      if (btnRef.current?.contains(e.target)) return;
      if (popoverRef.current?.contains(e.target)) return;
      setPinned(false);
      setHovering(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setPinned(false);
        setHovering(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [pinned]);

  if (!resolvedWhat && !resolvedWhy) return null;

  return (
    <span className={`inline-flex items-center ${className}`} style={{ lineHeight: 0 }}>
      <button
        ref={btnRef}
        type="button"
        aria-label={`What is ${resolvedTerm || 'this'}? Why it matters.`}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onFocus={() => setHovering(true)}
        onBlur={() => setHovering(false)}
        onClick={(e) => { e.stopPropagation(); setPinned((p) => !p); }}
        className="inline-flex items-center justify-center rounded-full align-middle"
        style={{
          width: size + 7, height: size + 7, flexShrink: 0,
          color: open ? C.gold : C.faint, background: open ? C.goldSoft : 'transparent',
          transition: 'color 120ms ease-out, background-color 120ms ease-out',
        }}
      >
        <Info size={size} strokeWidth={2} />
      </button>
      {open && ReactDOM.createPortal(
        <div
          ref={popoverRef}
          id={tooltipId}
          role="tooltip"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{
            position: 'fixed', top: pos.top, left: pos.left, width: POPOVER_WIDTH, zIndex: 9999,
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            boxShadow: '0 16px 40px -12px rgba(15,23,42,0.28)', padding: '14px 16px',
            transform: pos.placement === 'top' ? 'translateY(-100%)' : 'none',
            animation: 'koala-help-tip-in 140ms ease-out',
          }}
        >
          <style>{'@keyframes koala-help-tip-in{from{opacity:0;transform:translateY('+(pos.placement==='top'?'calc(-100% + 4px)':'-4px')+')}to{opacity:1;transform:translateY('+(pos.placement==='top'?'-100%':'0')+')}}'}</style>
          {resolvedTerm && (
            <div style={{ fontFamily: FONTS.display, fontSize: 13.5, fontWeight: 600, color: C.ink, marginBottom: 6 }}>
              {resolvedTerm}
            </div>
          )}
          {resolvedWhat && (
            <div style={{ marginBottom: resolvedWhy ? 8 : 0 }}>
              <div style={{ fontFamily: FONTS.body, fontSize: 9, fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase', color: C.muted, marginBottom: 2 }}>
                What is this?
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 12, lineHeight: 1.5, color: C.ink2 }}>{resolvedWhat}</div>
            </div>
          )}
          {resolvedWhy && (
            <div>
              <div style={{ fontFamily: FONTS.body, fontSize: 9, fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase', color: C.muted, marginBottom: 2 }}>
                Why it matters
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 12, lineHeight: 1.5, color: C.ink2 }}>{resolvedWhy}</div>
            </div>
          )}
          {resolvedHint && (
            <div className="flex items-start gap-1.5" style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
              <Sparkles size={11} style={{ color: C.gold, marginTop: 2, flexShrink: 0 }} />
              <div style={{ fontFamily: FONTS.body, fontSize: 11, lineHeight: 1.45, color: C.goldText, fontWeight: 500 }}>{resolvedHint}</div>
            </div>
          )}
        </div>,
        document.body
      )}
    </span>
  );
}
