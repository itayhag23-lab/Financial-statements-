import React, { useState } from 'react';
import { C, FONTS } from '../../brand/theme';
import { Field, Stat, fmtMonths, calcGrid } from './CalcKit';

// Runway = cash ÷ net monthly burn. Also projects the zero-cash date.
export default function RunwayCalculator() {
  const [cash, setCash] = useState(250000);
  const [burn, setBurn] = useState(40000);
  // `new Date()` differs between build time (prerender) and view time, which
  // would cause a hydration mismatch — so the zero-cash date is computed only
  // after mount, on the client.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const n = (v) => (Number.isFinite(v) ? v : 0);
  const runway = n(burn) > 0 ? n(cash) / n(burn) : Infinity;

  const zeroDate = (() => {
    if (!mounted || !isFinite(runway) || runway <= 0) return '—';
    const d = new Date();
    d.setMonth(d.getMonth() + Math.floor(runway));
    d.setDate(d.getDate() + Math.round((runway % 1) * 30));
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  })();

  const tone = !isFinite(runway) ? 'good' : runway >= 12 ? 'good' : runway >= 6 ? 'default' : 'bad';
  const verdict = !isFinite(runway)
    ? 'Cash-flow positive — no burn.'
    : runway >= 12
    ? 'Comfortable. Most investors want 12–18 months.'
    : runway >= 6
    ? 'Getting tight — start planning your raise or cuts.'
    : 'Critical. Raise or reduce burn now.';

  return (
    <div>
      <div style={{ ...calcGrid, marginBottom: 20 }}>
        <Field label="Cash on hand" prefix="$" value={cash} onChange={setCash} hint="Current bank balance" />
        <Field label="Net monthly burn" prefix="$" value={burn} onChange={setBurn} hint="Cash out − cash in, per month" />
      </div>
      <div style={{ ...calcGrid }}>
        <Stat label="Runway" value={isFinite(runway) ? `${fmtMonths(runway)} mo` : '∞'} tone={tone} big note={verdict} />
        <Stat label="Out of cash" value={zeroDate} />
      </div>
      <p style={{ fontFamily: FONTS.body, fontSize: 12.5, color: C.faint, marginTop: 16 }}>
        Runway = cash ÷ net monthly burn. This is a point-in-time estimate at today's burn — a full model
        shows how runway shifts as revenue grows and spending changes.
      </p>
    </div>
  );
}
