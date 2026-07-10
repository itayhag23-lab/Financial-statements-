import React, { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { C, FONTS } from '../../brand/theme';

// Interactive animated explainers for the Learn hub — the "video" replacement.
// A play button reveals each figure in sequence so the concept lands visually:
//   'bars'    → a waterfall (Revenue peeling down to Net income; cash buckets)
//   'balance' → Assets on one side equalling Liabilities + Equity on the other
// Pure CSS transitions, no dependencies, honours prefers-reduced-motion.

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const toneColor = (t) => (t === 'neg' ? C.rust : t === 'strong' ? C.green : t === 'muted' ? C.faint : C.green);

export const VIZ = {
  income: {
    kind: 'bars', caption: 'Revenue comes in at the top; each cost peels a slice away until Net income is what’s left.',
    bars: [
      { label: 'Revenue', val: 100, tone: 'pos' },
      { label: '− Cost of goods sold', val: 40, tone: 'neg' },
      { label: '= Gross profit', val: 60, tone: 'pos' },
      { label: '− Operating expenses', val: 35, tone: 'neg' },
      { label: '= Operating income', val: 25, tone: 'pos' },
      { label: '− Interest & tax', val: 5, tone: 'neg' },
      { label: '= Net income', val: 20, tone: 'strong' },
    ],
  },
  cashflow: {
    kind: 'bars', caption: 'Three buckets of real cash add up to the change in your bank balance for the period.',
    bars: [
      { label: 'Operating activities', val: 30, tone: 'pos' },
      { label: 'Investing activities', val: 15, tone: 'neg' },
      { label: 'Financing activities', val: 5, tone: 'pos' },
      { label: '= Net change in cash', val: 20, tone: 'strong' },
    ],
  },
  balance: {
    kind: 'balance', caption: 'It always balances: everything you own equals what you borrowed plus what’s truly yours.',
    left: [{ label: 'Assets', val: 100, tone: 'pos' }],
    right: [{ label: 'Liabilities', val: 60, tone: 'neg' }, { label: 'Equity', val: 40, tone: 'strong' }],
  },
};

function Bars({ spec, played, accent }) {
  const max = Math.max(...spec.bars.map((b) => b.val));
  return (
    <div>
      {spec.bars.map((b, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
          <div style={{ width: 150, flexShrink: 0, fontFamily: FONTS.body, fontSize: 12, color: b.tone === 'strong' ? C.ink : C.ink2, fontWeight: b.tone === 'strong' ? 700 : 500, textAlign: 'right' }}>{b.label}</div>
          <div style={{ flex: 1, height: 22, background: C.bgWarm, borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: played ? `${(b.val / max) * 100}%` : '0%', background: toneColor(b.tone), borderRadius: 5, transition: prefersReducedMotion() ? 'none' : `width 620ms cubic-bezier(0.16,1,0.3,1) ${i * 240}ms` }} />
          </div>
          <div className="ff-num" style={{ width: 34, flexShrink: 0, fontSize: 12.5, fontWeight: b.tone === 'strong' ? 700 : 500, color: toneColor(b.tone), opacity: played ? 1 : 0, transition: `opacity 300ms ${i * 240 + 300}ms` }}>{b.val}</div>
        </div>
      ))}
    </div>
  );
}

function Balance({ spec, played, accent }) {
  const Col = ({ items, delay }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 4, height: 180 }}>
      {items.map((it, i) => (
        <div key={i} style={{ height: played ? `${it.val}%` : '0%', background: toneColor(it.tone), borderRadius: 6, transition: prefersReducedMotion() ? 'none' : `height 640ms cubic-bezier(0.16,1,0.3,1) ${delay + i * 200}ms`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <span className="ff-num" style={{ color: '#fff', fontSize: 12, fontWeight: 700, opacity: played ? 1 : 0, transition: `opacity 300ms ${delay + i * 200 + 400}ms`, whiteSpace: 'nowrap' }}>{it.label} {it.val}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, padding: '0 8px' }}>
      <Col items={spec.left} delay={0} />
      <div style={{ fontFamily: FONTS.display, fontSize: 24, fontWeight: 700, color: C.ink, paddingBottom: 74 }}>=</div>
      <Col items={spec.right} delay={300} />
    </div>
  );
}

export default function StatementViz({ type, accent = C.green }) {
  const spec = VIZ[type];
  const [played, setPlayed] = useState(false);
  if (!spec) return null;
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, background: C.bg, padding: '18px 18px 16px', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div style={{ fontFamily: FONTS.body, fontSize: 12.5, lineHeight: 1.5, color: C.muted, flex: 1 }}>{spec.caption}</div>
        <button
          type="button"
          onClick={() => { setPlayed(false); requestAnimationFrame(() => requestAnimationFrame(() => setPlayed(true))); }}
          style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONTS.body, fontSize: 12.5, fontWeight: 600, color: C.ink, background: accent === C.green ? C.greenSoft : accent === C.blue ? C.blueSoft : C.goldSoft, border: `1px solid ${accent}55`, borderRadius: 8, padding: '7px 13px', cursor: 'pointer' }}
        >
          {played ? <><RotateCcw size={13} /> Replay</> : <><Play size={13} /> Play</>}
        </button>
      </div>
      {spec.kind === 'balance' ? <Balance spec={spec} played={played} accent={accent} /> : <Bars spec={spec} played={played} accent={accent} />}
    </div>
  );
}
