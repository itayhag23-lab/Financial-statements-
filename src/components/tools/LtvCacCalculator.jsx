import React, { useState } from 'react';
import { C, FONTS } from '../../brand/theme';
import { Field, Stat, fmtMoney, fmtMonths, calcGrid } from './CalcKit';

// LTV = (ARPU × gross margin) ÷ monthly churn; ratio vs CAC; payback in months.
export default function LtvCacCalculator() {
  const [arpu, setArpu] = useState(100);
  const [margin, setMargin] = useState(80);       // %
  const [churn, setChurn] = useState(3);          // % monthly
  const [cac, setCac] = useState(400);

  const n = (v) => (Number.isFinite(v) ? v : 0);
  const gm = n(margin) / 100;
  const churnRate = n(churn) / 100;
  const marginPerMonth = n(arpu) * gm;
  const ltv = churnRate > 0 ? marginPerMonth / churnRate : Infinity;
  const ratio = n(cac) > 0 ? ltv / n(cac) : Infinity;
  const payback = marginPerMonth > 0 ? n(cac) / marginPerMonth : Infinity;

  const tone = !isFinite(ratio) ? 'good' : ratio >= 3 ? 'good' : ratio >= 1 ? 'default' : 'bad';
  const verdict = !isFinite(ratio)
    ? 'Effectively infinite — no churn entered.'
    : ratio >= 3
    ? 'Healthy. 3:1 or better is the benchmark.'
    : ratio >= 1
    ? 'Marginal. You recover CAC but have little room.'
    : 'Unprofitable — you lose money per customer.';

  return (
    <div>
      <div style={{ ...calcGrid, marginBottom: 20 }}>
        <Field label="ARPU (revenue / customer)" prefix="$" value={arpu} onChange={setArpu} suffix="/mo" />
        <Field label="Gross margin" value={margin} onChange={setMargin} suffix="%" hint="After cost to serve" />
        <Field label="Monthly churn" value={churn} onChange={setChurn} suffix="%" hint="Customers lost per month" />
        <Field label="CAC (cost to acquire)" prefix="$" value={cac} onChange={setCac} />
      </div>
      <div style={{ ...calcGrid }}>
        <Stat label="LTV : CAC" value={isFinite(ratio) ? `${ratio.toFixed(1)} : 1` : '∞'} tone={tone} big note={verdict} />
        <Stat label="Customer LTV" value={isFinite(ltv) ? fmtMoney(ltv) : '∞'} note="Gross-margin dollars per customer." />
        <Stat label="CAC payback" value={isFinite(payback) ? `${fmtMonths(payback)} mo` : '—'}
          tone={payback <= 12 ? 'good' : payback <= 18 ? 'default' : 'bad'} note="Months to recover CAC." />
      </div>
      <p style={{ fontFamily: FONTS.body, fontSize: 12.5, color: C.faint, marginTop: 16 }}>
        LTV = (ARPU × gross margin) ÷ monthly churn. A ratio of 3:1+ is generally considered healthy.
      </p>
    </div>
  );
}
