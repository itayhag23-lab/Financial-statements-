import React, { useMemo } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { C, FONTS } from '../../brand/theme';

const compact = (n) => {
  const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (a >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (a >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return Math.round(n).toString();
};

function KPI({ label, value, tone }) {
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.borderSoft}`, borderRadius: 12, padding: '12px 14px', minWidth: 120, flex: 1 }}>
      <div className="label-eyebrow ff-body" style={{ color: C.muted }}>{label}</div>
      <div className="ff-num" style={{ fontSize: 21, fontWeight: 600, color: tone || C.ink, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function ChartTooltip({ active, payload, label, symbol }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 12px', boxShadow: '0 10px 28px -10px rgba(31,27,22,0.25)', fontFamily: FONTS.body }}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 5, letterSpacing: '0.04em' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: C.ink }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: 'inline-block' }} />
          <span style={{ color: C.ink2 }}>{p.name}</span>
          <span style={{ fontFamily: FONTS.num, fontWeight: 600, marginLeft: 'auto' }}>{symbol}{compact(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function PerformanceDashboard({ computed, periods, scenarioLabel = 'Base', symbol = '$' }) {
  const v = computed?.values || {};
  const data = useMemo(() => periods.map((p, i) => ({
    name: p,
    Revenue: Math.round(v.revenue?.[i] || 0),
    'Net Income': Math.round(v.netIncome?.[i] || 0),
  })), [periods, v]);

  const last = periods.length - 1;
  const lastRev = v.revenue?.[last] || 0;
  const lastNI = v.netIncome?.[last] || 0;
  const margin = lastRev > 0 ? (lastNI / lastRev) * 100 : 0;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div className="label-eyebrow ff-body" style={{ color: C.gold }}>Performance · {scenarioLabel}</div>
        <div style={{ display: 'flex', gap: 16, fontFamily: FONTS.body, fontSize: 11.5, color: C.muted }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 3, borderRadius: 2, background: C.gold, display: 'inline-block' }} /> Revenue</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 3, borderRadius: 2, background: C.green, display: 'inline-block' }} /> Net Income</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <KPI label="Revenue (final)" value={`${symbol}${compact(lastRev)}`} />
        <KPI label="Net Income (final)" value={`${symbol}${compact(lastNI)}`} tone={lastNI < 0 ? C.rust : C.green} />
        <KPI label="Net Margin" value={`${margin.toFixed(1)}%`} tone={margin < 0 ? C.rust : C.ink} />
      </div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 6, right: 6, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.gold} stopOpacity={0.28} />
                <stop offset="100%" stopColor={C.gold} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontFamily: FONTS.body, fontSize: 11, fill: C.muted }} axisLine={{ stroke: C.border }} tickLine={false} />
            <YAxis tickFormatter={compact} tick={{ fontFamily: FONTS.num, fontSize: 10.5, fill: C.muted }} axisLine={false} tickLine={false} width={44} />
            <Tooltip content={<ChartTooltip symbol={symbol} />} />
            <ReferenceLine y={0} stroke={C.faint} />
            <Area type="monotone" dataKey="Revenue" stroke={C.gold} strokeWidth={2.5} fill="url(#revFill)" dot={false} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="Net Income" stroke={C.green} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
