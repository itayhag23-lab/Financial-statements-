import React, { useState } from 'react';
import { C, FONTS } from '../../brand/theme';
import { Field, Stat, fmtMoney, fmtMonths, calcGrid } from './CalcKit';

// Net burn from a cash-balance change over a period; gross burn adds revenue back.
export default function BurnRateCalculator() {
  const [startCash, setStartCash] = useState(400000);
  const [endCash, setEndCash] = useState(280000);
  const [months, setMonths] = useState(3);
  const [revenue, setRevenue] = useState(20000);

  const n = (v) => (Number.isFinite(v) ? v : 0);
  const m = n(months) > 0 ? n(months) : 1;
  const netBurn = (n(startCash) - n(endCash)) / m;      // cash lost per month
  const grossBurn = netBurn + n(revenue);               // total spend per month
  const runway = netBurn > 0 ? n(endCash) / netBurn : Infinity;

  const tone = netBurn <= 0 ? 'good' : runway >= 12 ? 'good' : runway >= 6 ? 'default' : 'bad';

  return (
    <div>
      <div style={{ ...calcGrid, marginBottom: 20 }}>
        <Field label="Cash at start" prefix="$" value={startCash} onChange={setStartCash} />
        <Field label="Cash at end" prefix="$" value={endCash} onChange={setEndCash} />
        <Field label="Months in period" value={months} onChange={setMonths} min={1} hint="Length of the window above" />
        <Field label="Monthly revenue" prefix="$" value={revenue} onChange={setRevenue} hint="Avg. cash in per month" />
      </div>
      <div style={{ ...calcGrid }}>
        <Stat label="Net monthly burn" value={netBurn <= 0 ? 'Cash positive' : fmtMoney(netBurn)} tone={tone} big
          note={netBurn <= 0 ? 'You added cash over the period.' : 'Cash lost each month.'} />
        <Stat label="Gross monthly burn" value={fmtMoney(grossBurn)} note="Total spend before revenue." />
        <Stat label="Runway on ending cash" value={isFinite(runway) ? `${fmtMonths(runway)} mo` : '∞'} tone={tone} />
      </div>
      <p style={{ fontFamily: FONTS.body, fontSize: 12.5, color: C.faint, marginTop: 16 }}>
        Net burn = (start − end cash) ÷ months. Gross burn adds revenue back to show total spend.
      </p>
    </div>
  );
}
