import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Share2,
  ArrowRight, Check, Zap, Link2,
} from 'lucide-react';
import { FONTS } from '../brand/theme';
import { capture } from '../lib/analytics';
import ContactForm from '../components/ContactForm';

// Detects viewport width for truly responsive inline styles.
// Starts as `false` (desktop) so the first client render matches the
// pre-rendered HTML — the real value is set in the effect right after mount,
// which keeps hydration free of server/client mismatches.
function useIsMobile(bp = 640) {
  const [mob, setMob] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp}px)`);
    setMob(mq.matches);
    const fn = e => setMob(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, [bp]);
  return mob;
}

// Scroll-reveal wrapper — fades + slides up as element enters the viewport.
function Reveal({ children, delay = 0, style = {}, className = '' }) {
  const ref = React.useRef(null);
  const [vis, setVis] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.08, rootMargin: '0px 0px -28px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(22px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      ...style,
    }}>{children}</div>
  );
}

// Counts from 0 to `end` when the element scrolls into view.
function CountUp({ end, prefix = '', suffix = '' }) {
  const ref = React.useRef(null);
  const [val, setVal] = React.useState(0);
  const [started, setStarted] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); obs.disconnect(); }
    }, { threshold: 0.6 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  React.useEffect(() => {
    if (!started) return;
    const dur = 1400, t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, end]);
  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

// Returns [isHovered, eventProps] for inline-style hover effects.
function useHover() {
  const [hov, setHov] = React.useState(false);
  return [hov, { onMouseEnter: () => setHov(true), onMouseLeave: () => setHov(false) }];
}

// Cycles through a list of strings with a typewriter type-in/erase effect —
// draws the eye to the AI row, which is otherwise static text.
function TypingLine({ lines, typeMs = 38, eraseMs = 22, holdMs = 1800 }) {
  const [i, setI] = React.useState(0);
  const [text, setText] = React.useState('');
  const [phase, setPhase] = React.useState('typing'); // typing | hold | erasing
  React.useEffect(() => {
    const full = lines[i];
    if (phase === 'typing') {
      if (text.length < full.length) {
        const t = setTimeout(() => setText(full.slice(0, text.length + 1)), typeMs);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase('erasing'), holdMs);
      return () => clearTimeout(t);
    }
    if (phase === 'erasing') {
      if (text.length > 0) {
        const t = setTimeout(() => setText(text.slice(0, -1)), eraseMs);
        return () => clearTimeout(t);
      }
      setI((i + 1) % lines.length);
      setPhase('typing');
    }
  }, [text, phase, i, lines, typeMs, eraseMs, holdMs]);
  return (
    <>"{text}<span style={{ opacity: 0.6 }}>|</span>"</>
  );
}

// Primary hero CTA — pulses to draw the eye while idle (works on touch
// devices, unlike a :hover-only effect), then scales/brightens on hover.
function HeroCTA({ onClick, mob }) {
  const [hov, hp] = useHover();
  return (
    <Link to="/auth" onClick={onClick} {...hp} style={{
      fontFamily: FONTS.body, fontSize: mob ? 14 : 15, fontWeight: 600, color: P.bgDark,
      background: hov ? '#34D399' : P.accent, padding: mob ? '12px 20px' : '13px 24px', borderRadius: 10,
      textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
      transform: hov ? 'scale(1.04)' : 'scale(1)',
      boxShadow: hov ? '0 10px 28px -8px rgba(16,185,129,0.55)' : '0 0 0 rgba(0,0,0,0)',
      animation: hov ? 'none' : 'badgePulse 2.4s ease-in-out infinite',
      transition: 'transform 180ms cubic-bezier(0.16,1,0.3,1), box-shadow 180ms, background 180ms',
    }}>
      Build your model free <ArrowRight size={16} />
    </Link>
  );
}

// Illustrative example output per segment — clearly framed as a preview,
// not a live calculation (same convention as DashboardMock's "Acme Corp").
const AI_TEASER_SEGMENTS = {
  'B2B SaaS':   [{ label: 'ARR target',           value: '$1.2M' },   { label: 'Monthly burn rate',    value: '$84K' },    { label: 'Runway',     value: '14 months' }],
  'E-commerce': [{ label: 'Revenue run-rate',      value: '$3.4M' },   { label: 'Gross margin',         value: '42%' },     { label: 'Inventory turns', value: '6.1x/yr' }],
  'Consulting': [{ label: 'Utilization rate',      value: '71%' },     { label: 'Revenue / consultant', value: '$186K' },   { label: 'Net margin', value: '18%' }],
  'Other':      [{ label: 'Revenue growth',        value: '+24% YoY' },{ label: 'Burn rate',            value: '$52K/mo' }, { label: 'Runway',     value: '11 months' }],
};

// Click-driven "AI thinking" demo in the hero — gives every visitor (mobile
// included, unlike DashboardMock) a real, hands-on AI moment before signup.
function AITeaser({ mob }) {
  const [segment, setSegment] = React.useState(null);
  const [phase, setPhase] = React.useState('idle'); // idle | analyzing | result

  React.useEffect(() => {
    if (phase !== 'analyzing') return;
    const t = setTimeout(() => setPhase('result'), 1100);
    return () => clearTimeout(t);
  }, [phase]);

  function pick(seg) {
    capture('cta_click', { location: 'ai_teaser_start', segment: seg });
    setSegment(seg);
    setPhase('analyzing');
  }
  function reset() {
    setPhase('idle');
    setSegment(null);
  }

  return (
    <div style={{ marginTop: mob ? 18 : 22, background: 'rgba(255,255,255,0.04)', border: `1px solid ${P.borderDark}`, borderRadius: 14, padding: mob ? 16 : 20, maxWidth: mob ? '100%' : 460 }}>
      {phase === 'idle' && (
        <>
          <div style={{ ...body, fontSize: 13, fontWeight: 600, color: '#F8FAFC', marginBottom: 10 }}>
            Try it — 10 second preview
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.keys(AI_TEASER_SEGMENTS).map((seg) => (
              <button key={seg} onClick={() => pick(seg)} style={{
                ...body, fontSize: 12.5, fontWeight: 500, color: P.accent, background: P.accentSoft,
                border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, padding: '7px 13px', cursor: 'pointer',
              }}>
                {seg}
              </button>
            ))}
          </div>
        </>
      )}
      {phase === 'analyzing' && (
        <div style={{ ...body, fontSize: 13.5, color: 'rgba(248,250,252,0.75)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={14} color={P.accent} />
          AI is analyzing your {segment} numbers…
        </div>
      )}
      {phase === 'result' && (
        <>
          <div style={{ ...body, fontSize: 11, fontWeight: 600, color: P.accent, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Example {segment} model
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
            {AI_TEASER_SEGMENTS[segment].map((row) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, ...body, color: 'rgba(248,250,252,0.85)' }}>
                <span style={{ color: 'rgba(248,250,252,0.55)' }}>{row.label}</span>
                <span style={{ ...mono, fontWeight: 600 }}>{row.value}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/auth" onClick={() => capture('cta_click', { location: 'ai_teaser_result', segment })} style={{
              ...body, fontSize: 13, fontWeight: 600, color: P.bgDark, background: P.accent,
              padding: '9px 16px', borderRadius: 8, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              Build your real model free <ArrowRight size={14} />
            </Link>
            <button onClick={reset} style={{ ...body, fontSize: 12.5, color: 'rgba(248,250,252,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Try another →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Brand lockup — clean geometric K monogram mark + wordmark.
function BrandLockup({ size = 30, textColor = '#0F172A', accent = '#10B981' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <img src="/koala-mascot.png" alt="" width={size * 1.6} height={size * 1.6} style={{ display: 'block', objectFit: 'contain', flexShrink: 0 }} />
      <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: size * 0.62, color: textColor, letterSpacing: '-0.03em' }}>Koala</span>
        <span style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: size * 0.29, color: accent, letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 3 }}>Statements</span>
      </span>
    </span>
  );
}

// ── Enterprise palette ──────────────────────────────────────────────────────
const P = {
  bgDark:     '#070D1A',
  bgDarkCard: '#0F172A',
  bgDarkAlt:  '#1C2333',
  bg:         '#FFFFFF',
  bgAlt:      '#F8FAFC',
  bgSlate:    '#F1F5F9',
  border:     '#E2E8F0',
  borderDark: 'rgba(255,255,255,0.07)',
  ink:        '#0F172A',
  ink2:       '#334155',
  muted:      '#64748B',
  faint:      '#CBD5E1',
  accent:     '#10B981',
  accentDark: '#059669',
  // #10B981 only passes WCAG AA as text on dark surfaces (~7.6:1); on white/
  // bgAlt it drops to ~2.2:1. accentText is the same hue darkened enough to
  // pass on light backgrounds (~5:1) — use it instead of `accent` for any
  // text sitting on a light surface.
  accentText: '#047857',
  accentSoft: 'rgba(16,185,129,0.1)',
  accentGlow: 'rgba(16,185,129,0.2)',
  blue:       '#3B82F6',
  blueSoft:   'rgba(59,130,246,0.1)',
  amber:      '#F59E0B',
  red:        '#EF4444',
};

const maxW = { maxWidth: 1200, marginLeft: 'auto', marginRight: 'auto' };
const disp = { fontFamily: FONTS.display };
const body = { fontFamily: FONTS.body };
const mono = { fontFamily: FONTS.num };

// ── Sparkline ───────────────────────────────────────────────────────────────
function Spark({ data, color, w = 52, h = 22 }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── High-fidelity dashboard mock ────────────────────────────────────────────
function DashboardMock() {
  const periods   = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const revenue   = [840, 920, 1050, 1180, 1340, 1520];
  const netIncome = [92, 128, 158, 201, 254, 320];
  const cw = 380, ch = 68, maxR = 1600, maxN = 340;
  const revPts = revenue.map((v, i) => `${(i / (revenue.length - 1)) * cw},${ch - (v / maxR) * ch}`).join(' ');
  const revArea = `0,${ch} ${revPts} ${cw},${ch}`;
  const niPts  = netIncome.map((v, i) => `${(i / (netIncome.length - 1)) * cw},${ch - (v / maxN) * ch}`).join(' ');

  const kpis = [
    { label: 'ARR',           value: '$7.85M', change: '↑18.2%', spk: [680,710,760,820,890,970,1050], sc: P.accent },
    { label: 'EBITDA Margin', value: '17.1%',  change: '↑3.0 pp', spk: [12.1,13.4,14.2,15.1,15.8,16.2,17.1], sc: P.blue },
    { label: 'Net Income',    value: '$891K',  change: '↑24.7%', spk: [74,93,114,144,178,228,305], sc: P.accent },
    { label: 'Cash Runway',   value: '34 mo',  change: 'Healthy', spk: [28,29,30,31,33,34,34], sc: P.amber },
  ];

  const rows = [
    { label: 'Revenue',              q: ['$840K','$920K','$1,050K','$1,180K'], bold: true,  neg: false, accent: P.accent },
    { label: '  Cost of Revenue',    q: ['($336K)','($368K)','($420K)','($472K)'], bold: false, neg: true,  accent: null },
    { label: 'Gross Profit',         q: ['$504K','$552K','$630K','$708K'],   bold: true,  neg: false, accent: P.accent },
    { label: '  Operating Expenses', q: ['($399K)','($414K)','($459K)','($498K)'], bold: false, neg: true,  accent: null },
    { label: 'EBITDA',               q: ['$105K','$138K','$171K','$210K'],   bold: true,  neg: false, accent: P.accent },
    { label: 'Net Income',           q: ['$92K','$128K','$158K','$201K'],    bold: true,  neg: false, accent: P.blue },
  ];

  return (
    <div style={{
      background: P.bgDarkCard,
      borderRadius: 14,
      overflow: 'hidden',
      border: `1px solid ${P.accentGlow}`,
      boxShadow: `0 0 0 1px ${P.accentSoft}, 0 60px 120px -30px rgba(0,0,0,0.85), 0 0 80px ${P.accentGlow}`,
      maxWidth: 560,
      width: '100%',
    }}>
      {/* macOS title bar */}
      <div style={{ background: P.bgDark, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${P.borderDark}` }}>
        <div style={{ display: 'flex', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
        </div>
        <div style={{ ...body, fontSize: 11, color: '#94A3B8', marginLeft: 6, flex: 1 }}>
          Acme Corp — Financial Model · FY 2025–2026
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {['Base', 'Optimistic', 'Stress'].map((s, i) => (
            <span key={s} style={{ ...body, fontSize: 9, padding: '2px 7px', borderRadius: 4, background: i === 0 ? P.accent : 'rgba(255,255,255,0.07)', color: i === 0 ? P.bgDark : '#94A3B8', fontWeight: i === 0 ? 700 : 400, cursor: 'default' }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0 14px', display: 'flex', borderBottom: `1px solid ${P.borderDark}` }}>
        {['Income Statement', 'Cash Flow', 'Balance Sheet', 'Analytics'].map((t, i) => (
          <div key={t} style={{ ...body, fontSize: 10.5, padding: '8px 12px', color: i === 0 ? P.accent : '#94A3B8', fontWeight: i === 0 ? 600 : 400, borderBottom: `2px solid ${i === 0 ? P.accent : 'transparent'}`, cursor: 'default', whiteSpace: 'nowrap' }}>{t}</div>
        ))}
      </div>

      {/* KPI tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: `1px solid ${P.borderDark}` }}>
        {kpis.map(({ label, value, change, spk, sc }, i) => (
          <div key={label} style={{ padding: '10px 12px', borderRight: i < 3 ? `1px solid ${P.borderDark}` : 'none' }}>
            <div style={{ ...body, fontSize: 8.5, color: '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ ...mono, fontSize: 15, fontWeight: 600, color: '#F1F5F9', letterSpacing: '-0.02em' }}>{value}</div>
                <div style={{ ...body, fontSize: 9, color: sc, marginTop: 2 }}>{change}</div>
              </div>
              <Spark data={spk} color={sc} />
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ padding: '10px 14px 6px', borderBottom: `1px solid ${P.borderDark}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ ...body, fontSize: 9.5, color: '#94A3B8' }}>Revenue & Net Income — H1 2025</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[[P.accent, 'Revenue'], [P.blue, 'Net Income']].map(([c, l]) => (
              <span key={l} style={{ ...body, fontSize: 8.5, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 2, background: c, display: 'inline-block', borderRadius: 1 }} />{l}
              </span>
            ))}
          </div>
        </div>
        <svg width="100%" viewBox={`0 0 ${cw} ${ch}`} preserveAspectRatio="none" style={{ display: 'block', height: 52 }}>
          <defs>
            <linearGradient id="dg-rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={P.accent} stopOpacity="0.3" />
              <stop offset="100%" stopColor={P.accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={revArea} fill="url(#dg-rev)" />
          <polyline points={revPts} fill="none" stroke={P.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={niPts}  fill="none" stroke={P.blue}   strokeWidth="1.4" strokeDasharray="4,3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
          {periods.map(p => <span key={p} style={{ ...body, fontSize: 8, color: '#94A3B8' }}>{p}</span>)}
        </div>
      </div>

      {/* Data table */}
      <div>
        <div style={{ display: 'flex', padding: '5px 14px', background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${P.borderDark}` }}>
          <div style={{ flex: 1, ...body, fontSize: 8.5, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Line item</div>
          {['Q1 25', 'Q2 25', 'Q3 25', 'Q4 25'].map(q => <div key={q} style={{ width: 62, textAlign: 'right', ...body, fontSize: 8.5, color: '#94A3B8', letterSpacing: '0.05em' }}>{q}</div>)}
        </div>
        {rows.map(({ label, q, bold, neg, accent: rowAccent }) => (
          <div key={label} style={{ display: 'flex', padding: `${bold ? 6 : 4}px 14px`, background: bold ? 'rgba(255,255,255,0.02)' : 'transparent', borderBottom: `1px solid ${P.borderDark}` }}>
            <div style={{ flex: 1, ...body, fontSize: 9.5, color: bold ? (rowAccent === P.blue ? P.blue : rowAccent ? P.accent : '#94A3B8') : '#94A3B8', fontWeight: bold ? 600 : 400 }}>{label}</div>
            {q.map((v, vi) => (
              <div key={vi} style={{ width: 62, textAlign: 'right', ...mono, fontSize: 9.5, color: v.startsWith('(') ? P.red : bold ? (rowAccent === P.blue ? P.blue : rowAccent ? P.accent : '#F1F5F9') : '#94A3B8', fontWeight: bold ? 600 : 400 }}>{v}</div>
            ))}
          </div>
        ))}
      </div>

      {/* AI bar */}
      <div style={{ padding: '9px 14px', background: 'rgba(16,185,129,0.06)', borderTop: `1px solid rgba(16,185,129,0.14)`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 18, height: 18, borderRadius: '50%', background: P.accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ ...body, fontSize: 9, fontWeight: 800, color: P.bgDark }}>AI</span>
        </span>
        <span style={{ ...body, fontSize: 9.5, color: '#94A3B8', fontStyle: 'italic', flex: 1 }}>
          <TypingLine lines={[
            'What if headcount increases 30% in Q3?',
            'What if we raise prices 10%?',
            'What if CAC drops by 20%?',
          ]} />
        </span>
        <span style={{ ...body, fontSize: 9.5, color: P.accent, fontWeight: 600, cursor: 'default', whiteSpace: 'nowrap' }}>Ask AI →</span>
      </div>
    </div>
  );
}

// ── Integration badges ──────────────────────────────────────────────────────
const INTEGRATIONS = [
  { name: 'QuickBooks', abbr: 'QB', color: '#2CA01C' },
  { name: 'Xero',       abbr: 'Xe', color: '#13B5EA' },
  { name: 'NetSuite',   abbr: 'NS', color: '#FF6C2C' },
  { name: 'Salesforce', abbr: 'SF', color: '#00A1E0' },
  { name: 'Stripe',     abbr: 'St', color: '#6772E5' },
  { name: 'Excel',      abbr: 'Ex', color: '#217346' },
];

function IntegrationBadge({ name, abbr, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 8, border: `1px solid ${P.border}`, background: P.bg }}>
      <div style={{ width: 22, height: 22, borderRadius: 5, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ ...body, fontSize: 8.5, fontWeight: 800, color: '#fff' }}>{abbr}</span>
      </div>
      <span style={{ ...body, fontSize: 12.5, fontWeight: 500, color: P.ink2 }}>{name}</span>
    </div>
  );
}

// ── Feature visuals — each one illustrates its specific capability with real
// numbers/UI moments instead of a generic icon-in-a-square. ───────────────
function VisualFrame({ children }) {
  return (
    <div style={{ borderRadius: 10, background: P.bgSlate, border: `1px solid ${P.border}`, padding: '13px 14px', marginBottom: 16, minHeight: 112, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {children}
    </div>
  );
}

function AssumptionVisual() {
  const tags = [['Revenue growth', '8.5%/mo'], ['Gross margin', '72%'], ['Opex ratio', '41%']];
  return (
    <VisualFrame>
      <div style={{ ...mono, fontSize: 11, color: P.ink2, background: P.bg, border: `1px solid ${P.border}`, borderRadius: 7, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
        <span>&ldquo;B2B SaaS, $30K MRR, 18mo runway&rdquo;</span>
        <span style={{ width: 1, height: 12, background: P.accent, display: 'inline-block', animation: 'caretBlink 1s step-end infinite', flexShrink: 0 }} />
      </div>
      <div style={{ ...body, fontSize: 11, color: P.faint, textAlign: 'center', margin: '7px 0' }}>↓ AI extracts</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {tags.map(([k, v]) => (
          <span key={k} style={{ ...body, fontSize: 10.5, color: P.accentText, background: P.accentSoft, border: '1px solid rgba(16,185,129,0.22)', borderRadius: 6, padding: '4px 8px' }}>
            {k} <b style={mono}>{v}</b>
          </span>
        ))}
      </div>
    </VisualFrame>
  );
}

function ScenarioFanVisual() {
  const w = 220, h = 84, x0 = 8, y0 = 42;
  const lines = [
    { to: [w - 8, 12], color: P.blue,   dash: '4,3', label: 'Optimistic' },
    { to: [w - 8, 42], color: P.accent, dash: '0',   label: 'Base' },
    { to: [w - 8, 68], color: P.amber,  dash: '4,3', label: 'Stress' },
  ];
  return (
    <VisualFrame>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
        <circle cx={x0} cy={y0} r="2.5" fill={P.ink2} />
        {lines.map((l) => (
          <path key={l.label} d={`M ${x0} ${y0} Q ${w * 0.45} ${y0}, ${l.to[0]} ${l.to[1]}`} fill="none" stroke={l.color} strokeWidth="2" strokeDasharray={l.dash} strokeLinecap="round" />
        ))}
      </svg>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 2, flexWrap: 'wrap' }}>
        {lines.map((l) => (
          <span key={l.label} style={{ ...body, fontSize: 9.5, color: P.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 2, background: l.color, display: 'inline-block', borderRadius: 1 }} />{l.label}
          </span>
        ))}
      </div>
    </VisualFrame>
  );
}

function LinkageFlowVisual() {
  const steps = ['Income Statement', 'Cash Flow', 'Balance Sheet'];
  return (
    <VisualFrame>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: P.bg, border: `1px solid ${P.border}`, borderRadius: 7, padding: '6px 10px' }}>
            <span style={{ ...body, fontSize: 11, color: P.ink2 }}>{s}</span>
            <span style={{ ...mono, fontSize: 10.5, color: P.accentText, fontWeight: 700 }}>$201K</span>
          </div>
          {i < steps.length - 1 && <div style={{ width: 1, height: 8, background: P.accent, marginLeft: 14 }} />}
        </React.Fragment>
      ))}
    </VisualFrame>
  );
}

function BenchmarkVisual() {
  const rows = [
    { label: 'Your gross margin', value: 72, color: P.accent },
    { label: 'Industry median',   value: 64, color: P.faint },
  ];
  return (
    <VisualFrame>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {rows.map((r) => (
          <div key={r.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ ...body, fontSize: 10.5, color: P.muted }}>{r.label}</span>
              <span style={{ ...mono, fontSize: 10.5, color: P.ink2, fontWeight: 700 }}>{r.value}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 4, background: P.border, overflow: 'hidden' }}>
              <div style={{ width: `${r.value}%`, height: '100%', background: r.color, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}

function WhatIfDiffVisual() {
  const deltas = [['Opex', '+$42K', true], ['Net Income', '-$18K', true], ['Cash runway', '-3 mo', true]];
  return (
    <VisualFrame>
      <div style={{ ...body, fontSize: 11.5, color: P.ink2, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <span style={{ ...body, fontSize: 9, fontWeight: 800, color: '#fff', background: P.ink, borderRadius: 4, padding: '2px 5px', fontStyle: 'normal', flexShrink: 0 }}>AI</span>
        &ldquo;What if headcount grows 30% in Q3?&rdquo;
      </div>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        {deltas.map(([k, v, bad]) => (
          <div key={k}>
            <div style={{ ...body, fontSize: 9.5, color: P.faint, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</div>
            <div style={{ ...mono, fontSize: 13, fontWeight: 700, color: bad ? P.red : P.accentText }}>{v}</div>
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}

function LiveReportVisual() {
  return (
    <VisualFrame>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: P.bg, border: `1px solid ${P.border}`, borderRadius: 7, padding: '8px 10px', marginBottom: 10 }}>
        <Link2 size={12} color={P.muted} style={{ flexShrink: 0 }} />
        <span style={{ ...mono, fontSize: 10.5, color: P.ink2, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>koala.app/r/acme-fy26</span>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: P.accent, animation: 'livePulse 1.6s ease-in-out infinite', flexShrink: 0 }} />
      </div>
    </VisualFrame>
  );
}

// ── Feature card — bento layout: span-2 cards carry the three exclusive
// capabilities, span-1 cards fill the gaps. No two cards share a visual idiom. ─
const FEATURES = [
  { title: 'AI-Driven Assumption Engine', tag: 'Exclusive', span: 2, visual: <AssumptionVisual />,
    body: 'Describe your business in plain English. Our AI generates a validated, sector-calibrated 3-statement model with realistic assumptions — no spreadsheet, no accounting data required.' },
  { title: 'Dynamic Multi-Scenario Architecture', tag: null, span: 1, visual: <ScenarioFanVisual />,
    body: 'Base, Optimistic, and Stress scenarios run simultaneously and stay fully linked. Pressure-test your downside without rebuilding — toggle and compare in real time.' },
  { title: 'Conversational What-If Analysis', tag: 'Exclusive', span: 2, visual: <WhatIfDiffVisual />,
    body: '"What if we expand headcount 30% in Q3?" The AI proposes exact line-item changes with a diff preview. Apply or discard — full undo history included.' },
  { title: 'Automated 3-Statement Integration', tag: null, span: 1, visual: <LinkageFlowVisual />,
    body: 'Every assumption flows automatically through Income Statement → Cash Flow → Balance Sheet. No manual reconciliation, no broken links, no version chaos.' },
  { title: 'Investor-Ready Live Reports', tag: 'Exclusive', span: 2, visual: <LiveReportVisual />,
    body: 'Share a live, interactive report — not a dead PDF. Your investors and board explore the numbers themselves, drilldown and all. One-click pitch one-pager included.' },
  { title: 'Institutional Benchmarking', tag: null, span: 1, visual: <BenchmarkVisual />,
    body: 'Compare your margins, growth rates, and unit economics against sector data across 17+ industries. Anchor your plan in reality before walking into the boardroom.' },
];

function FeatureCard({ title, body: text, tag, span, visual, mob }) {
  const [hov, hp] = useHover();
  return (
    <div {...hp} style={{ gridColumn: mob ? 'auto' : `span ${span}`, background: P.bg, border: `1px solid ${hov ? '#CBD5E1' : P.border}`, borderRadius: 12, padding: '20px 20px 22px', position: 'relative', transform: hov ? 'translateY(-3px)' : 'translateY(0)', boxShadow: hov ? '0 14px 30px -12px rgba(15,23,42,0.14)' : 'none', transition: 'transform 200ms cubic-bezier(0.16,1,0.3,1), box-shadow 200ms, border-color 200ms' }}>
      {tag && (
        <span style={{ position: 'absolute', top: 16, right: 16, ...body, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.accentText, background: P.accentSoft, padding: '3px 8px', borderRadius: 20, zIndex: 1 }}>{tag}</span>
      )}
      {visual}
      <h3 style={{ ...disp, fontSize: 16.5, fontWeight: 700, color: P.ink, marginBottom: 7, letterSpacing: '-0.01em' }}>{title}</h3>
      <p style={{ ...body, fontSize: 13.5, lineHeight: 1.65, color: P.ink2, margin: 0 }}>{text}</p>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const mob = useIsMobile(640);   // phone
  const tab = useIsMobile(860);   // tablet/collapse-2col

  const sp = mob ? '16px' : '24px';          // side padding
  const vp = mob ? '44px' : '84px';          // vertical section padding

  return (
    <div className="koala-page" style={{ background: P.bg, minHeight: '100vh', ...body, color: P.ink, overflowX: 'hidden' }}>
      <style>{`
        @keyframes badgePulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.55); }
          60%      { box-shadow: 0 0 0 9px rgba(16,185,129,0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes caretBlink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes livePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
          60%      { box-shadow: 0 0 0 5px rgba(16,185,129,0); }
        }
      `}</style>

      {/* NAV */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${P.border}` }}>
        <div style={{ ...maxW, padding: `12px ${sp}`, display: 'flex', alignItems: 'center', gap: mob ? 12 : 28 }}>
          <BrandLockup size={mob ? 24 : 30} />
          <nav style={{ display: mob ? 'none' : 'flex', alignItems: 'center', gap: 22, flex: 1 }}>
            <a href="#features" style={{ ...body, fontSize: 14, color: P.ink2, textDecoration: 'none' }}>Features</a>
            <a href="#how"      style={{ ...body, fontSize: 14, color: P.ink2, textDecoration: 'none' }}>How it works</a>
            <a href="#free"     style={{ ...body, fontSize: 14, color: P.accentText, fontWeight: 600, textDecoration: 'none' }}>Free</a>
            <a href="#contact"  style={{ ...body, fontSize: 14, color: P.ink2, textDecoration: 'none' }}>Contact</a>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: mob ? 6 : 10, marginLeft: 'auto' }}>
            {!mob && <Link to="/auth" style={{ ...body, fontSize: 14, color: P.muted, textDecoration: 'none', padding: '8px 12px' }}>Log in</Link>}
            <Link to="/auth" style={{ ...body, fontSize: mob ? 13 : 14, fontWeight: 600, color: '#fff', background: P.ink, padding: mob ? '10px 16px' : '9px 18px', borderRadius: 9, textDecoration: 'none' }}>Start free</Link>
          </div>
        </div>
      </header>

      <main id="main-content">
      {/* HERO */}
      <section style={{ background: P.bgDark, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, right: -80, width: 700, height: 700, borderRadius: '50%', background: `radial-gradient(circle, ${P.accentGlow} 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -120, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ ...maxW, padding: `${mob ? '44px' : '84px'} ${sp} ${mob ? '40px' : '80px'}`, display: 'grid', gridTemplateColumns: tab ? '1fr' : '1fr 1fr', gap: mob ? 28 : 60, alignItems: 'center', position: 'relative' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: P.accentSoft, border: `1px solid rgba(16,185,129,0.25)`, borderRadius: 20, padding: '5px 14px', marginBottom: mob ? 16 : 22 }}>
              <Zap size={12} color={P.accent} />
              <span style={{ ...body, fontSize: 11, fontWeight: 600, color: P.accent, letterSpacing: '0.14em', textTransform: 'uppercase' }}>AI-Native Financial Modeling</span>
            </div>
            <h1 style={{ ...disp, fontSize: mob ? 'clamp(28px, 8vw, 36px)' : 'clamp(32px, 4.4vw, 56px)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.025em', color: '#F8FAFC', margin: 0 }}>
              From one sentence to<br />an investor-ready<br />
              <span style={{ color: P.accent }}>financial model.</span>
            </h1>
            <p style={{ ...body, fontSize: mob ? 15 : 17, lineHeight: 1.65, color: 'rgba(248,250,252,0.55)', marginTop: mob ? 14 : 20, maxWidth: mob ? '100%' : 490 }}>
              Income statement, balance sheet, and cash flow, fully linked and generated by AI in under 60 seconds. Built for founders and CFOs who don't have weeks to spare.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: mob ? 20 : 28, flexWrap: 'wrap' }}>
              <HeroCTA mob={mob} onClick={() => capture('cta_click', { location: 'hero_primary' })} />
              {!mob && (
                <a href="#how" onClick={() => capture('cta_click', { location: 'hero_secondary' })} style={{ ...body, fontSize: 15, fontWeight: 500, color: 'rgba(248,250,252,0.7)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '13px 24px', borderRadius: 10, textDecoration: 'none' }}>
                  See how it works
                </a>
              )}
            </div>
            <div style={{ display: 'flex', gap: mob ? 12 : 20, marginTop: mob ? 16 : 22, flexWrap: 'wrap' }}>
              {['< 60 sec to first model', 'No credit card required', 'Encrypted & private'].map((t) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, ...body, fontSize: mob ? 11.5 : 12.5, color: mob ? '#CBD5E1' : '#94A3B8' }}>
                  <Check size={13} color={P.accent} />{t}
                </div>
              ))}
            </div>
            <p style={{ ...body, fontSize: mob ? 12 : 13, color: 'rgba(248,250,252,0.4)', margin: `${mob ? 14 : 18}px 0 0` }}>
              No spreadsheets. No finance degree. Free.
            </p>
            <AITeaser mob={mob} />
          </div>
          {!tab && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <DashboardMock />
            </div>
          )}
        </div>
      </section>

      {/* INTEGRATION STRIP — scrolling marquee */}
      <div style={{ background: P.bgAlt, borderBottom: `1px solid ${P.border}`, padding: `14px 0` }}>
        <div style={{ ...body, fontSize: 11, color: P.muted, fontWeight: 500, letterSpacing: '0.09em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 12 }}>
          Works with your stack
        </div>
        <div style={{ overflow: 'hidden', position: 'relative' }}>
          {/* fade masks at edges */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 40, background: `linear-gradient(to right, ${P.bgAlt}, transparent)`, zIndex: 1, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 40, background: `linear-gradient(to left, ${P.bgAlt}, transparent)`, zIndex: 1, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', gap: 10, animation: 'marquee 18s linear infinite', width: 'max-content' }}>
            {[...INTEGRATIONS, ...INTEGRATIONS].map((ig, i) => (
              <IntegrationBadge key={i} {...ig} />
            ))}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ background: P.bg, borderBottom: `1px solid ${P.border}` }}>
        <div style={{ ...maxW, padding: `${mob ? '28px' : '44px'} ${sp}`, display: 'flex', justifyContent: 'space-around', textAlign: 'center', flexWrap: 'wrap', gap: 0 }}>
          {[
            { label: 'From description to first model', end: 60, prefix: '< ', suffix: 's' },
            { label: 'Live scenarios per model',        end: 3,  prefix: '',   suffix: '' },
            { label: 'Industry benchmarks built in',   end: 17, prefix: '',   suffix: '+' },
            { label: 'Statements auto-linked',         end: 100,prefix: '',   suffix: '%' },
          ].map(({ label, end, prefix, suffix }, i) => (
            <div key={label} style={{
              padding: mob ? '14px 12px' : '10px 28px',
              borderRight: (!mob && i < 3) ? `1px solid ${P.border}` : 'none',
              borderBottom: mob ? `1px solid ${P.border}` : 'none',
              flex: mob ? '0 0 50%' : 1,
              minWidth: mob ? 0 : 130,
              boxSizing: 'border-box',
            }}>
              <div style={{ ...disp, fontSize: mob ? 28 : 36, fontWeight: 700, color: P.ink, letterSpacing: '-0.02em' }}>
                <CountUp end={end} prefix={prefix} suffix={suffix} />
              </div>
              <div style={{ ...body, fontSize: mob ? 12 : 13, color: P.muted, marginTop: 5 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" style={{ background: P.bgAlt, borderBottom: `1px solid ${P.border}` }}>
        <div style={{ ...maxW, padding: `${vp} ${sp}` }}>
          <Reveal style={{ textAlign: 'center', maxWidth: 640, margin: `0 auto ${mob ? '32px' : '52px'}` }}>
            <div style={{ ...body, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: P.accentText, marginBottom: 14 }}>Capabilities</div>
            <h2 style={{ ...disp, fontSize: 'clamp(22px, 3.8vw, 42px)', fontWeight: 700, color: P.ink, margin: '0 0 14px', letterSpacing: '-0.02em' }}>Everything the big tools do — plus the things they can't.</h2>
            <p style={{ ...body, fontSize: mob ? 14 : 16, lineHeight: 1.65, color: P.ink2 }}>Legacy reporting platforms work only after you have historical data. Koala lets you build, project, and stress-test from day one — then uses AI to do the heavy lifting.</p>
          </Reveal>
          <Reveal delay={120} style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3, 1fr)', gap: mob ? 12 : 16, alignItems: 'start' }}>
            {FEATURES.map((f) => <FeatureCard key={f.title} {...f} mob={mob} />)}
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ background: P.bg, borderBottom: `1px solid ${P.border}` }}>
        <div style={{ ...maxW, padding: `${vp} ${sp}` }}>
          <Reveal style={{ textAlign: 'center', marginBottom: mob ? 28 : 52 }}>
            <div style={{ ...body, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: P.accentText, marginBottom: 14 }}>Workflow</div>
            <h2 style={{ ...disp, fontSize: 'clamp(22px, 3.8vw, 42px)', fontWeight: 700, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>From a sentence to an investor-ready model.</h2>
          </Reveal>
          <Reveal delay={100} style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: mob ? 12 : 20 }}>
            {[
              { n: '01', title: 'Describe your business', icon: Sparkles, body: 'Type one sentence: "B2B SaaS, $30K MRR, targeting $5M ARR, 18-month runway." Koala reads your sector, stage, and scale automatically.' },
              { n: '02', title: 'Model builds itself',    icon: Zap,      body: 'A fully-linked Income Statement, Cash Flow, and Balance Sheet — seeded with sector-calibrated assumptions and three live scenarios — in under 60 seconds.' },
              { n: '03', title: 'Refine, share, raise',   icon: Share2,   body: 'Adjust any assumption, run what-if scenarios with the AI advisor, then share a live interactive report directly with your investors or board.' },
            ].map(({ n, title, icon: Icon, body: text }) => (
              <div key={n} style={{ padding: mob ? '20px 16px' : '28px 24px', background: P.bgAlt, borderRadius: 12, border: `1px solid ${P.border}` }}>
                <div style={{ ...body, fontSize: 11, fontWeight: 700, color: P.accentText, letterSpacing: '0.14em', marginBottom: 12 }}>STEP {n}</div>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: P.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Icon size={18} color={P.accent} />
                </div>
                <h3 style={{ ...disp, fontSize: mob ? 17 : 20, fontWeight: 700, color: P.ink, marginBottom: 8, letterSpacing: '-0.01em' }}>{title}</h3>
                <p style={{ ...body, fontSize: mob ? 13 : 14, lineHeight: 1.65, color: P.ink2 }}>{text}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* FREE FOR EVERYONE */}
      <section id="free" style={{ background: P.bgAlt, borderTop: `1px solid ${P.border}`, borderBottom: `1px solid ${P.border}` }}>
        <div style={{ ...maxW, padding: `${vp} ${sp}` }}>
          <Reveal style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: P.accentSoft, border: `1px solid rgba(16,185,129,0.25)`, borderRadius: 20, padding: '5px 14px', marginBottom: 18 }}>
              <Zap size={12} color={P.accent} />
              <span style={{ ...body, fontSize: 11, fontWeight: 600, color: P.accentText, letterSpacing: '0.14em', textTransform: 'uppercase' }}>100% Free</span>
            </div>
            <h2 style={{ ...disp, fontSize: 'clamp(27px, 3.8vw, 42px)', fontWeight: 700, color: P.ink, margin: '0 0 12px', letterSpacing: '-0.02em' }}>Free for everyone.</h2>
            <p style={{ ...body, fontSize: mob ? 14 : 16, color: P.ink2, lineHeight: 1.65 }}>
              No plans, no paywalls, no credit card. Every feature is unlocked from the start — build, model, and share as much as you want, completely free.
            </p>
          </Reveal>

          <Reveal delay={120} style={{ background: P.bg, border: `1px solid ${P.border}`, borderRadius: 12, display: 'flex', flexDirection: mob ? 'column' : 'row', marginTop: mob ? 28 : 44, maxWidth: 880, marginLeft: 'auto', marginRight: 'auto', overflow: 'hidden' }}>
            {[
              { n: '01', title: 'Every feature unlocked', body: 'AI model generation, multi-scenario analysis, industry benchmarks, and live investor reports — all included.' },
              { n: '02', title: 'Unlimited models',       body: 'Create, edit, and save as many financial models as you need. No project caps, no limits.' },
              { n: '03', title: 'No credit card',          body: 'Sign up with email or Google and start building in seconds. Nothing to pay, now or ever.' },
            ].map(({ n, title, body: text }, i) => (
              <div key={n} style={{ flex: 1, padding: mob ? '20px 22px' : '28px 26px', borderTop: (mob && i) ? `1px solid ${P.border}` : 'none', borderLeft: (!mob && i) ? `1px solid ${P.border}` : 'none' }}>
                <div style={{ ...disp, fontSize: 13, fontWeight: 800, color: P.accentText, letterSpacing: '0.05em', marginBottom: 10 }}>{n}</div>
                <h3 style={{ ...disp, fontSize: 16.5, fontWeight: 700, color: P.ink, marginBottom: 7, letterSpacing: '-0.01em' }}>{title}</h3>
                <p style={{ ...body, fontSize: 13.5, lineHeight: 1.6, color: P.ink2, margin: 0 }}>{text}</p>
              </div>
            ))}
          </Reveal>

          <Reveal delay={200} style={{ textAlign: 'center', marginTop: mob ? 28 : 40 }}>
            <Link to="/auth" onClick={() => capture('cta_click', { location: 'free_section' })} style={{ ...body, fontSize: mob ? 14 : 15, fontWeight: 700, color: P.bgDark, background: P.accent, padding: mob ? '12px 24px' : '14px 28px', borderRadius: 11, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Get started free <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: P.bgDark, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 350, borderRadius: '50%', background: `radial-gradient(ellipse, ${P.accentGlow} 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ ...maxW, padding: `${mob ? '60px' : '100px'} ${sp}`, textAlign: 'center', position: 'relative' }}>
          <img src="/koala-mascot.png" alt="" width={mob ? 84 : 120} height={mob ? 84 : 120} style={{ display: 'block', objectFit: 'contain', margin: `0 auto ${mob ? 18 : 26}px` }} />
          <h2 style={{ ...disp, fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, color: '#F8FAFC', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            Your investors expect<br />institutional quality.
          </h2>
          <p style={{ ...body, fontSize: mob ? 15 : 17, color: 'rgba(248,250,252,0.5)', maxWidth: 460, margin: '0 auto 32px', lineHeight: 1.65 }}>
            Build your first 3-statement model in under 60 seconds. No spreadsheet, no finance degree, no credit card.
          </p>
          <Link to="/auth" onClick={() => capture('cta_click', { location: 'final_cta' })} style={{ ...body, fontSize: mob ? 15 : 16, fontWeight: 700, color: P.bgDark, background: P.accent, padding: mob ? '13px 24px' : '15px 32px', borderRadius: 11, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 9 }}>
            Build your model free <ArrowRight size={18} />
          </Link>
          <div style={{ marginTop: 20, ...body, fontSize: 12.5, color: mob ? '#CBD5E1' : '#94A3B8' }}>
            No credit card · Free forever · Encrypted &amp; private
          </div>
        </div>
      </section>
      {/* CONTACT / FEEDBACK */}
      <section id="contact" style={{ background: P.bgDark, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ ...maxW, padding: `${vp} ${sp}`, display: 'grid', gridTemplateColumns: tab ? '1fr' : '1fr 1fr', gap: tab ? 28 : 56, alignItems: 'start' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: P.accentSoft, border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, padding: '5px 14px', marginBottom: 18 }}>
              <span style={{ ...body, fontSize: 11, fontWeight: 600, color: P.accentText, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Get in touch</span>
            </div>
            <h2 style={{ ...disp, fontSize: 'clamp(24px, 3.4vw, 38px)', fontWeight: 700, color: '#F8FAFC', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
              Questions or feedback?
            </h2>
            <p style={{ ...body, fontSize: mob ? 14.5 : 16, color: 'rgba(248,250,252,0.55)', lineHeight: 1.65, maxWidth: 420 }}>
              Tell us what you’re building, report a bug, or suggest a feature. We read every message and usually reply within a day.
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: mob ? '20px 18px' : '26px 24px' }}>
            <ContactForm theme="dark" source="landing" />
          </div>
        </div>
      </section>
      </main>

      {/* FOOTER */}
      <footer style={{ background: '#070D1A', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ ...maxW, padding: `28px ${sp}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/koala-mascot.png" alt="" width={40} height={40} style={{ display: 'block', objectFit: 'contain' }} />
            <span style={{ ...disp, fontSize: 16, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.015em' }}>Koala Statements</span>
          </div>
          <div style={{ ...body, fontSize: 12.5, color: mob ? '#CBD5E1' : '#94A3B8' }}>
            © {new Date().getFullYear()} Koala Statements · Not financial advice.
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link to="/privacy" style={{ ...body, fontSize: 12.5, color: mob ? '#CBD5E1' : '#94A3B8', textDecoration: 'none' }}>Privacy</Link>
            <Link to="/terms"   style={{ ...body, fontSize: 12.5, color: mob ? '#CBD5E1' : '#94A3B8', textDecoration: 'none' }}>Terms</Link>
            <a href="#contact" style={{ ...body, fontSize: 12.5, color: mob ? '#CBD5E1' : '#94A3B8', textDecoration: 'none' }}>Contact</a>
          </div>
        </div>
      </footer>

      <style>{`
        html, body, #root { overflow-x: hidden; max-width: 100vw; }
        * { box-sizing: border-box; }
        @media (max-width: 640px) {
          header a, header button { min-height: 44px; display: inline-flex; align-items: center; }
        }
      `}</style>
    </div>
  );
}
