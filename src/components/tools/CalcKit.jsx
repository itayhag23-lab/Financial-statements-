import React from 'react';
import { C, FONTS } from '../../brand/theme';

// Shared primitives for the free /tools calculators — a labeled numeric field
// and a result stat — so each calculator stays short and consistent.

const body = { fontFamily: FONTS.body };
const disp = { fontFamily: FONTS.display };

export const fmtInt = (n) =>
  isFinite(n) ? Math.round(n).toLocaleString('en-US') : '—';
export const fmtMoney = (n) =>
  isFinite(n) ? '$' + Math.round(n).toLocaleString('en-US') : '—';
export const fmtMonths = (n) =>
  !isFinite(n) || n <= 0 ? '—' : n >= 100 ? '100+' : n.toFixed(1);

export function Field({ label, value, onChange, prefix, suffix, min = 0, step = 'any', hint }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ ...body, display: 'block', fontSize: 13, fontWeight: 600, color: C.ink2, marginBottom: 6 }}>
        {label}
      </span>
      <span
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
          padding: '0 12px',
        }}
      >
        {prefix && <span style={{ ...body, fontSize: 14, color: C.muted }}>{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === '' ? '' : parseFloat(v));
          }}
          style={{
            ...body, flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            color: C.ink, fontSize: 15, padding: '11px 0', fontVariantNumeric: 'tabular-nums',
          }}
        />
        {suffix && <span style={{ ...body, fontSize: 14, color: C.muted }}>{suffix}</span>}
      </span>
      {hint && <span style={{ ...body, display: 'block', fontSize: 11.5, color: C.faint, marginTop: 5 }}>{hint}</span>}
    </label>
  );
}

export function Stat({ label, value, tone = 'default', big = false, note }) {
  const color = tone === 'good' ? C.green : tone === 'bad' ? C.rust : C.ink;
  return (
    <div
      style={{
        background: tone === 'good' ? C.greenSoft : tone === 'bad' ? C.rustSoft : C.surfaceAlt,
        border: `1px solid ${tone === 'good' ? 'rgba(4,120,87,0.2)' : tone === 'bad' ? 'rgba(220,38,38,0.2)' : C.border}`,
        borderRadius: 12, padding: big ? '18px 18px' : '14px 16px',
      }}
    >
      <div style={{ ...body, fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ ...disp, fontSize: big ? 34 : 24, fontWeight: 800, color, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
        {value}
      </div>
      {note && <div style={{ ...body, fontSize: 12.5, color: C.ink2, marginTop: 6 }}>{note}</div>}
    </div>
  );
}

export const calcGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 };
