import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { loadShare, saveProject, genId } from '../lib/persistence';
import { Logo } from '../brand/Logo';
import { FONTS } from '../brand/theme';
import { ArrowRight, Lock, ExternalLink } from 'lucide-react';

const P = {
  bg: '#FFFFFF', bgAlt: '#F8FAFC', bgDark: '#0F172A',
  border: '#E2E8F0', ink: '#0F172A', ink2: '#334155', muted: '#64748B',
  accent: '#10B981', accentSoft: 'rgba(16,185,129,0.1)',
  red: '#EF4444',
};
const maxW = { maxWidth: 960, marginLeft: 'auto', marginRight: 'auto' };
const body = { fontFamily: FONTS.body };
const disp = { fontFamily: FONTS.display };
const mono = { fontFamily: FONTS.num };

function fmt(n, { paren = false, abbreviate = false } = {}) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  const r = Math.round(n);
  if (r === 0) return '0';
  if (abbreviate) {
    const abs = Math.abs(r);
    if (abs >= 1e6) return (r >= 0 ? '' : '−') + (abs / 1e6).toFixed(1) + 'M';
    if (abs >= 1000) return (r >= 0 ? '' : '−') + (abs / 1000).toFixed(1) + 'K';
  }
  if (paren && r < 0) return `(${Math.abs(r).toLocaleString('en-US')})`;
  return r.toLocaleString('en-US');
}

// Inline mini sparkline — no Recharts dep on the share page.
function Spark({ values, color, w = 80, h = 32 }) {
  if (!values || values.length < 2) return null;
  const max = Math.max(...values), min = Math.min(...values), range = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  const area = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg-${color.replace('#', '')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NotFoundView() {
  return (
    <div style={{ minHeight: '100vh', background: P.bgAlt, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Logo size={32} />
      <h2 style={{ ...disp, fontSize: 28, fontWeight: 700, color: P.ink, margin: '24px 0 10px', letterSpacing: '-0.02em' }}>Link not found</h2>
      <p style={{ ...body, fontSize: 15, color: P.muted, marginBottom: 24, textAlign: 'center', maxWidth: 420 }}>
        This share link was created on a different device or has expired. Share links are stored locally and only work on the same browser that created them.
      </p>
      <Link to="/app" style={{ ...body, fontSize: 14, fontWeight: 600, color: '#fff', background: P.ink, padding: '10px 20px', borderRadius: 9, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        Build your own model <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function LoadingView() {
  return (
    <div style={{ minHeight: '100vh', background: P.bgAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ ...body, fontSize: 14, color: P.muted }}>Loading shared model…</span>
    </div>
  );
}

export default function SharedReport() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    (async () => {
      const d = await loadShare(shareId);
      if (d) setDoc(d);
      else setNotFound(true);
    })();
  }, [shareId]);

  const openEditable = async () => {
    if (!doc || opening) return;
    setOpening(true);
    const newId = genId();
    await saveProject(newId, {
      meta: {
        name: `${doc.meta?.name || 'Shared Model'} (copy)`,
        sectorKey: doc.meta?.sectorKey,
        regionKey: doc.meta?.regionKey,
        currencyKey: doc.meta?.currencyKey,
        enabledStatements: doc.meta?.enabledStatements,
      },
      model: doc.model,
      wizardAnswers: doc.wizardAnswers,
    });
    navigate(`/app/${newId}`);
  };

  if (notFound) return <NotFoundView />;
  if (!doc) return <LoadingView />;

  const { snapshot, meta } = doc;
  const snap = snapshot || {};
  const periods = snap.periods || [];
  const revenue = snap.revenue || [];
  const netIncome = snap.netIncome || [];
  const grossProfit = snap.grossProfit || [];
  const incomeRows = snap.incomeRows || [];
  const incomeValues = snap.incomeValues || {};
  const sharedDate = doc.sharedAt ? new Date(doc.sharedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown date';

  const li = periods.length - 1;
  const finalRev = revenue[li] || 0;
  const finalNI = netIncome[li] || 0;
  const finalGM = finalRev > 0 ? ((grossProfit[li] || 0) / finalRev * 100).toFixed(1) : '—';
  const symbol = meta?.currencyKey === 'eur' ? '€' : meta?.currencyKey === 'gbp' ? '£' : meta?.currencyKey === 'ils' ? '₪' : '$';

  // Income table rows to display (parents + computed)
  const displayRows = incomeRows.filter(r => r.type === 'parent' || r.type === 'computed');

  return (
    <div style={{ background: P.bgAlt, minHeight: '100vh', ...body, color: P.ink }}>

      {/* ── NAV ── */}
      <header style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${P.border}`, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ ...maxW, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}><Logo size={38} /></Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ ...body, fontSize: 11, color: P.muted, display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
              <Lock size={11} color={P.accent} /> <span className="hidden sm:inline">Read-only shared model</span>
            </div>
            <button
              onClick={openEditable}
              disabled={opening}
              style={{ ...body, fontSize: 13, fontWeight: 600, color: '#fff', background: opening ? P.muted : P.bgDark, padding: '8px 14px', borderRadius: 8, border: 'none', cursor: opening ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}
            >
              {opening ? 'Opening…' : 'Open editable copy'} {!opening && <ExternalLink size={13} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── HEADER ── */}
      <section style={{ background: P.bg, padding: 'clamp(28px, 5vw, 44px) 16px 28px', borderBottom: `1px solid ${P.border}` }}>
        <div style={{ ...maxW }}>
          <div style={{ ...body, fontSize: 11, color: P.accent, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
            Shared Financial Model · {sharedDate}
          </div>
          <h1 style={{ ...disp, fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: P.ink, margin: 0, letterSpacing: '-0.025em' }}>
            {meta?.name || 'Untitled Model'}
          </h1>
          <p style={{ ...body, fontSize: 14, color: P.muted, marginTop: 10 }}>
            {periods.length > 0 ? `${periods[0]} – ${periods[periods.length - 1]}` : ''} · Base scenario · Read-only
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button
              onClick={openEditable}
              style={{ ...body, fontSize: 14, fontWeight: 600, color: '#fff', background: P.accent, padding: '11px 20px', borderRadius: 9, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}
            >
              Open editable copy <ArrowRight size={15} />
            </button>
            <Link to="/app" style={{ ...body, fontSize: 14, fontWeight: 500, color: P.ink2, background: P.bg, border: `1px solid ${P.border}`, padding: '11px 20px', borderRadius: 9, textDecoration: 'none' }}>
              Build my own model →
            </Link>
          </div>
        </div>
      </section>

      {/* ── KPI TILES ── */}
      <div style={{ background: P.bg, borderBottom: `1px solid ${P.border}` }}>
        <div style={{ ...maxW, padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', borderLeft: `1px solid ${P.border}` }}>
            {[
              { label: `Revenue · ${periods[li] || ''}`, value: symbol + fmt(finalRev, { abbreviate: true }), spark: revenue, color: P.ink },
              { label: `Net Income · ${periods[li] || ''}`, value: symbol + fmt(finalNI, { abbreviate: true, paren: true }), spark: netIncome, color: finalNI >= 0 ? P.ink : P.red },
              { label: `Gross Margin · ${periods[li] || ''}`, value: finalGM === '—' ? '—' : `${finalGM}%`, spark: revenue.map((r, i) => r > 0 ? (grossProfit[i] / r) * 100 : 0), color: P.ink },
              { label: 'Periods', value: `${periods.length}`, spark: null, color: P.ink },
            ].map(({ label, value, spark, color }, i) => (
              <div key={label} style={{ padding: '20px 20px', borderRight: `1px solid ${P.border}`, borderBottom: `1px solid ${P.border}`, borderTop: `1px solid ${P.border}` }}>
                <div style={{ ...body, fontSize: 10, color: P.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ ...mono, fontSize: 22, fontWeight: 600, color, letterSpacing: '-0.02em' }}>{value}</div>
                  {spark && <Spark values={spark} color={P.accent} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── INCOME STATEMENT ── */}
      {incomeRows.length > 0 && (
        <section style={{ ...maxW, padding: 'clamp(24px, 4vw, 40px) 16px' }}>
          <div style={{ ...body, fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: P.accent, marginBottom: 16 }}>Income Statement · Base scenario</div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden', background: P.bg, minWidth: 480 }}>
            {/* Header row */}
            <div style={{ display: 'flex', background: P.bgAlt, borderBottom: `1px solid ${P.border}`, padding: '10px 18px' }}>
              <div style={{ flex: 1, ...body, fontSize: 10, color: P.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Line item</div>
              {periods.map(p => (
                <div key={p} style={{ width: 80, textAlign: 'right', ...body, fontSize: 10, color: P.muted, letterSpacing: '0.06em' }}>{p}</div>
              ))}
            </div>
            {/* Data rows — parents + computed rows only */}
            {incomeRows.map((row, i) => {
              const vals = incomeValues[row.id] || [];
              const isBold = row.type === 'computed' || row.type === 'parent';
              const isComputed = row.type === 'computed';
              const isChild = !!row.parentId;
              return (
                <div
                  key={row.id}
                  style={{
                    display: 'flex',
                    padding: `${isBold ? 9 : 6}px 18px`,
                    borderBottom: i < incomeRows.length - 1 ? `1px solid ${P.border}` : 'none',
                    background: isComputed && !isChild ? P.bgAlt : 'transparent',
                  }}
                >
                  <div style={{ flex: 1, ...body, fontSize: isBold ? 12.5 : 11.5, color: isBold ? P.ink : P.ink2, fontWeight: isBold ? 600 : 400, paddingLeft: isChild ? 14 : 0 }}>
                    {row.label}
                  </div>
                  {periods.map((_, pi) => {
                    const v = vals[pi];
                    const neg = v < 0;
                    return (
                      <div key={pi} style={{ width: 80, textAlign: 'right', ...mono, fontSize: isBold ? 12.5 : 11.5, color: neg ? P.red : isBold ? P.ink : P.ink2, fontWeight: isBold ? 600 : 400 }}>
                        {v !== undefined ? (neg ? `(${fmt(Math.abs(v), { abbreviate: true })})` : fmt(v, { abbreviate: true })) : '—'}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          </div>
        </section>
      )}

      {/* ── REVENUE CHART ── */}
      {revenue.length > 1 && (
        <section style={{ ...maxW, padding: '0 16px 40px' }}>
          <div style={{ background: P.bg, border: `1px solid ${P.border}`, borderRadius: 12, padding: '24px 24px 16px' }}>
            <div style={{ ...body, fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: P.accent, marginBottom: 4 }}>Revenue & Net Income trend</div>
            <div style={{ ...body, fontSize: 12, color: P.muted, marginBottom: 16 }}>Base scenario · {symbol}thousands</div>
            {(() => {
              const w = 700, h = 120, maxR = Math.max(...revenue, 1);
              const revPts = revenue.map((v, i) => `${(i / (revenue.length - 1)) * w},${h - (v / maxR) * h}`).join(' ');
              const revArea = `0,${h} ${revPts} ${w},${h}`;
              const maxN = Math.max(...netIncome.map(Math.abs), 1);
              const niPts = netIncome.map((v, i) => `${(i / (netIncome.length - 1)) * w},${h / 2 - (v / maxN) * (h / 2)}`).join(' ');
              return (
                <div>
                  <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block', height: 120 }}>
                    <defs>
                      <linearGradient id="sr-rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={P.accent} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={P.accent} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polygon points={revArea} fill="url(#sr-rev)" />
                    <polyline points={revPts} fill="none" stroke={P.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points={niPts} fill="none" stroke="#3B82F6" strokeWidth="1.6" strokeDasharray="5,3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    {periods.map(p => <span key={p} style={{ ...body, fontSize: 10, color: P.muted }}>{p}</span>)}
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                    {[[P.accent, 'Revenue'], ['#3B82F6', 'Net Income']].map(([c, l]) => (
                      <span key={l} style={{ ...body, fontSize: 11, color: P.muted, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 12, height: 2, background: c, display: 'inline-block', borderRadius: 1 }} />{l}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ background: P.bg, borderTop: `1px solid ${P.border}`, padding: '20px 16px' }}>
        <div style={{ ...maxW, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Logo size={22} />
          <div style={{ ...body, fontSize: 12, color: P.muted }}>Shared read-only view · Not financial advice</div>
          <button onClick={openEditable} style={{ ...body, fontSize: 13, fontWeight: 600, color: '#fff', background: P.accent, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
            Open editable copy →
          </button>
        </div>
      </footer>
    </div>
  );
}
