import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Share2,
  ArrowRight, Check, Zap, Link2,
  FileSpreadsheet, Upload,
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
      transform: vis ? 'translateY(0)' : 'translateY(18px)',
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

// Brand lockup — mascot mark + wordmark.
function BrandLockup({ size = 30, textColor = '#0F172A', accent = '#047857' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <img src="/koala-mascot.png" alt="" width={size * 1.85} height={size * 1.85} style={{ display: 'block', objectFit: 'contain', flexShrink: 0 }} />
      <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: size * 0.62, color: textColor, letterSpacing: '-0.03em' }}>Koala</span>
        <span style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: size * 0.29, color: accent, letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 3 }}>Statements</span>
      </span>
    </span>
  );
}

// ── Palette — clean neutral base, one emerald accent. Dark is reserved for
// the product mock interior and the single closing block. ──────────────────
const P = {
  bg:         '#FFFFFF',
  bgSoft:     '#F7F8FA',   // warm-cool gray for alternate sections
  bgMint:     '#EFFBF5',   // very light emerald wash (free panel)
  border:     '#E5E7EB',
  borderFaint:'#EEF0F3',
  ink:        '#0F172A',
  ink2:       '#334155',
  muted:      '#64748B',
  faint:      '#94A3B8',
  accent:     '#10B981',   // bright emerald — only on dark surfaces
  accentMid:  '#059669',   // hover states
  accentDeep: '#047857',   // buttons / accent text on light (AA-safe)
  accentSoft: '#ECFDF5',
  dark:       '#0B101B',   // closing block
  bgDark:     '#070D1A',   // product mock chrome
  bgDarkCard: '#0F172A',
  bgDarkAlt:  '#1C2333',
  borderDark: 'rgba(255,255,255,0.08)',
  blue:       '#3B82F6',
  amber:      '#F59E0B',
  red:        '#EF4444',
};

const maxW = { maxWidth: 1240, marginLeft: 'auto', marginRight: 'auto' };
const disp = { fontFamily: FONTS.display };
const body = { fontFamily: FONTS.body };
const mono = { fontFamily: FONTS.num };

// Pill CTA used across the page. `tone`: 'primary' (emerald), 'ghost' (light
// outline on white), 'inverse' (white pill on the dark closing block).
function PillLink({ to, href, onClick, tone = 'primary', size = 'md', children }) {
  const [hov, hp] = useHover();
  const pad = size === 'lg' ? '16px 34px' : '13px 26px';
  const fs = size === 'lg' ? 16 : 15;
  const tones = {
    primary: {
      color: '#FFFFFF', background: hov ? P.accentMid : P.accentDeep,
      boxShadow: hov ? '0 10px 24px -8px rgba(4,120,87,0.45)' : '0 1px 2px rgba(15,23,42,0.08)',
    },
    ghost: {
      color: P.ink, background: hov ? P.bgSoft : P.bg,
      border: `1px solid ${P.border}`,
      boxShadow: hov ? '0 6px 16px -8px rgba(15,23,42,0.15)' : 'none',
    },
    inverse: {
      color: P.ink, background: hov ? '#F1F5F9' : '#FFFFFF',
      boxShadow: hov ? '0 12px 28px -10px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.2)',
    },
  };
  const style = {
    ...body, fontSize: fs, fontWeight: 600, padding: pad, borderRadius: 999,
    textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
    transform: hov ? 'translateY(-1px)' : 'translateY(0)',
    transition: 'transform 160ms ease, box-shadow 160ms ease, background 160ms ease',
    ...tones[tone],
  };
  if (to) return <Link to={to} onClick={onClick} {...hp} style={style}>{children}</Link>;
  return <a href={href} onClick={onClick} {...hp} style={style}>{children}</a>;
}

// ── Sparkline ───────────────────────────────────────────────────────────────
function Spark({ data, color, w = 56, h = 24 }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── High-fidelity dashboard mock — dark app window presented as a product
// screenshot on the light hero (neutral shadow, no glow). ───────────────────
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
    { label: 'Revenue',              q: ['$840K','$920K','$1,050K','$1,180K'], bold: true,  accent: P.accent },
    { label: '  Cost of Revenue',    q: ['($336K)','($368K)','($420K)','($472K)'], bold: false, accent: null },
    { label: 'Gross Profit',         q: ['$504K','$552K','$630K','$708K'],   bold: true,  accent: P.accent },
    { label: '  Operating Expenses', q: ['($399K)','($414K)','($459K)','($498K)'], bold: false, accent: null },
    { label: 'EBITDA',               q: ['$105K','$138K','$171K','$210K'],   bold: true,  accent: P.accent },
    { label: 'Net Income',           q: ['$92K','$128K','$158K','$201K'],    bold: true,  accent: P.blue },
  ];

  return (
    <div style={{
      background: P.bgDarkCard,
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid rgba(15,23,42,0.1)',
      boxShadow: '0 40px 90px -28px rgba(15,23,42,0.35), 0 12px 32px -16px rgba(15,23,42,0.18)',
      width: 'min(920px, 92%)',
      textAlign: 'left',
    }}>
      {/* macOS title bar */}
      <div style={{ background: P.bgDark, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${P.borderDark}` }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF5F57' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#FEBC2E' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28C840' }} />
        </div>
        <div style={{ ...body, fontSize: 12, color: '#94A3B8', marginLeft: 8, flex: 1 }}>
          Acme Corp · Financial Model · FY 2025-2026
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['Base', 'Optimistic', 'Stress'].map((s, i) => (
            <span key={s} style={{ ...body, fontSize: 10, padding: '3px 9px', borderRadius: 5, background: i === 0 ? P.accent : 'rgba(255,255,255,0.07)', color: i === 0 ? P.bgDark : '#94A3B8', fontWeight: i === 0 ? 700 : 400, cursor: 'default' }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0 18px', display: 'flex', borderBottom: `1px solid ${P.borderDark}` }}>
        {['Income Statement', 'Cash Flow', 'Balance Sheet', 'Analytics'].map((t, i) => (
          <div key={t} style={{ ...body, fontSize: 12, padding: '10px 14px', color: i === 0 ? P.accent : '#94A3B8', fontWeight: i === 0 ? 600 : 400, borderBottom: `2px solid ${i === 0 ? P.accent : 'transparent'}`, cursor: 'default', whiteSpace: 'nowrap' }}>{t}</div>
        ))}
      </div>

      {/* KPI tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: `1px solid ${P.borderDark}` }}>
        {kpis.map(({ label, value, change, spk, sc }, i) => (
          <div key={label} style={{ padding: '13px 16px', borderRight: i < 3 ? `1px solid ${P.borderDark}` : 'none' }}>
            <div style={{ ...body, fontSize: 9.5, color: '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ ...mono, fontSize: 18, fontWeight: 600, color: '#F1F5F9', letterSpacing: '-0.02em' }}>{value}</div>
                <div style={{ ...body, fontSize: 10.5, color: sc, marginTop: 2 }}>{change}</div>
              </div>
              <Spark data={spk} color={sc} />
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ padding: '12px 18px 8px', borderBottom: `1px solid ${P.borderDark}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ ...body, fontSize: 11, color: '#94A3B8' }}>Revenue & Net Income · H1 2025</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[[P.accent, 'Revenue'], [P.blue, 'Net Income']].map(([c, l]) => (
              <span key={l} style={{ ...body, fontSize: 10, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 12, height: 2, background: c, display: 'inline-block', borderRadius: 1 }} />{l}
              </span>
            ))}
          </div>
        </div>
        <svg width="100%" viewBox={`0 0 ${cw} ${ch}`} preserveAspectRatio="none" style={{ display: 'block', height: 64 }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {periods.map(p => <span key={p} style={{ ...body, fontSize: 9.5, color: '#94A3B8' }}>{p}</span>)}
        </div>
      </div>

      {/* Data table */}
      <div>
        <div style={{ display: 'flex', padding: '7px 18px', background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${P.borderDark}` }}>
          <div style={{ flex: 1, ...body, fontSize: 9.5, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Line item</div>
          {['Q1 25', 'Q2 25', 'Q3 25', 'Q4 25'].map(q => <div key={q} style={{ width: 78, textAlign: 'right', ...body, fontSize: 9.5, color: '#94A3B8', letterSpacing: '0.05em' }}>{q}</div>)}
        </div>
        {rows.map(({ label, q, bold, accent: rowAccent }) => (
          <div key={label} style={{ display: 'flex', padding: `${bold ? 7 : 5}px 18px`, background: bold ? 'rgba(255,255,255,0.02)' : 'transparent', borderBottom: `1px solid ${P.borderDark}` }}>
            <div style={{ flex: 1, ...body, fontSize: 11, color: bold ? (rowAccent === P.blue ? P.blue : rowAccent ? P.accent : '#94A3B8') : '#94A3B8', fontWeight: bold ? 600 : 400 }}>{label}</div>
            {q.map((v, vi) => (
              <div key={vi} style={{ width: 78, textAlign: 'right', ...mono, fontSize: 11, color: v.startsWith('(') ? P.red : bold ? (rowAccent === P.blue ? P.blue : rowAccent ? P.accent : '#F1F5F9') : '#94A3B8', fontWeight: bold ? 600 : 400 }}>{v}</div>
            ))}
          </div>
        ))}
      </div>

      {/* AI bar */}
      <div style={{ padding: '11px 18px', background: 'rgba(16,185,129,0.06)', borderTop: `1px solid rgba(16,185,129,0.14)`, display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ width: 20, height: 20, borderRadius: '50%', background: P.accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ ...body, fontSize: 10, fontWeight: 800, color: P.bgDark }}>AI</span>
        </span>
        <span style={{ ...body, fontSize: 11, color: '#94A3B8', fontStyle: 'italic', flex: 1 }}>
          <TypingLine lines={[
            'What if headcount increases 30% in Q3?',
            'What if we raise prices 10%?',
            'What if CAC drops by 20%?',
          ]} />
        </span>
        <span style={{ ...body, fontSize: 11, color: P.accent, fontWeight: 600, cursor: 'default', whiteSpace: 'nowrap' }}>Ask AI →</span>
      </div>
    </div>
  );
}

// ── Interop — only capabilities the app actually ships: Excel export, CSV
// import, and a live shareable report link. No fabricated SaaS integrations. ──
const INTEROP = [
  { icon: FileSpreadsheet, title: 'Export to Excel',
    body: 'Download any model as a fully formatted spreadsheet: every statement and period, in one click.' },
  { icon: Upload, title: 'Import your numbers',
    body: 'Export a CSV from Excel, Google Sheets, or your accounting tool and Koala builds an editable model around it.' },
  { icon: Share2, title: 'Share a live link',
    body: 'Send investors an interactive report they can explore themselves, not a dead PDF or email attachment.' },
];

// Simple open column — no box, no border. Icon chip + title + text.
function InteropItem({ icon: Icon, title, body: text, mob }) {
  return (
    <div style={{ textAlign: mob ? 'center' : 'left' }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: P.accentSoft, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Icon size={20} color={P.accentDeep} />
      </div>
      <div style={{ ...disp, fontSize: 17, fontWeight: 700, color: P.ink, letterSpacing: '-0.01em', marginBottom: 8 }}>{title}</div>
      <div style={{ ...body, fontSize: 15, lineHeight: 1.6, color: P.muted }}>{text}</div>
    </div>
  );
}

// ── Feature visuals — each one illustrates its specific capability with real
// numbers/UI moments instead of a generic icon-in-a-square. ───────────────
function VisualFrame({ children }) {
  return (
    <div style={{ borderRadius: 12, background: P.bgSoft, padding: '16px 18px', marginBottom: 20, minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {children}
    </div>
  );
}

function AssumptionVisual() {
  const tags = [['Revenue growth', '8.5%/mo'], ['Gross margin', '72%'], ['Opex ratio', '41%']];
  return (
    <VisualFrame>
      <div style={{ ...mono, fontSize: 12, color: P.ink2, background: P.bg, border: `1px solid ${P.border}`, borderRadius: 8, padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
        <span>&ldquo;B2B SaaS, $30K MRR, 18mo runway&rdquo;</span>
        <span style={{ width: 1, height: 13, background: P.accentDeep, display: 'inline-block', animation: 'caretBlink 1s step-end infinite', flexShrink: 0 }} />
      </div>
      <div style={{ ...body, fontSize: 12, color: P.faint, textAlign: 'center', margin: '8px 0' }}>↓ AI extracts</div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {tags.map(([k, v]) => (
          <span key={k} style={{ ...body, fontSize: 11.5, color: P.accentDeep, background: P.accentSoft, borderRadius: 7, padding: '5px 10px' }}>
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
    { to: [w - 8, 12], color: P.blue,      dash: '4,3', label: 'Optimistic' },
    { to: [w - 8, 42], color: P.accentMid, dash: '0',   label: 'Base' },
    { to: [w - 8, 68], color: P.amber,     dash: '4,3', label: 'Stress' },
  ];
  return (
    <VisualFrame>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
        <circle cx={x0} cy={y0} r="2.5" fill={P.ink2} />
        {lines.map((l) => (
          <path key={l.label} d={`M ${x0} ${y0} Q ${w * 0.45} ${y0}, ${l.to[0]} ${l.to[1]}`} fill="none" stroke={l.color} strokeWidth="2" strokeDasharray={l.dash} strokeLinecap="round" />
        ))}
      </svg>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 4, flexWrap: 'wrap' }}>
        {lines.map((l) => (
          <span key={l.label} style={{ ...body, fontSize: 10.5, color: P.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: P.bg, border: `1px solid ${P.border}`, borderRadius: 8, padding: '7px 12px' }}>
            <span style={{ ...body, fontSize: 12, color: P.ink2 }}>{s}</span>
            <span style={{ ...mono, fontSize: 11.5, color: P.accentDeep, fontWeight: 700 }}>$201K</span>
          </div>
          {i < steps.length - 1 && <div style={{ width: 1, height: 9, background: P.accentMid, marginLeft: 16 }} />}
        </React.Fragment>
      ))}
    </VisualFrame>
  );
}

function BenchmarkVisual() {
  const rows = [
    { label: 'Your gross margin', value: 72, color: P.accentMid },
    { label: 'Industry median',   value: 64, color: '#CBD5E1' },
  ];
  return (
    <VisualFrame>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {rows.map((r) => (
          <div key={r.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ ...body, fontSize: 11.5, color: P.muted }}>{r.label}</span>
              <span style={{ ...mono, fontSize: 11.5, color: P.ink2, fontWeight: 700 }}>{r.value}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 4, background: '#E9EDF2', overflow: 'hidden' }}>
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
      <div style={{ ...body, fontSize: 12.5, color: P.ink2, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ ...body, fontSize: 10, fontWeight: 800, color: '#fff', background: P.ink, borderRadius: 5, padding: '2px 6px', fontStyle: 'normal', flexShrink: 0 }}>AI</span>
        &ldquo;What if headcount grows 30% in Q3?&rdquo;
      </div>
      <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
        {deltas.map(([k, v, bad]) => (
          <div key={k}>
            <div style={{ ...body, fontSize: 10.5, color: P.faint, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</div>
            <div style={{ ...mono, fontSize: 14, fontWeight: 700, color: bad ? P.red : P.accentDeep }}>{v}</div>
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}

function LiveReportVisual() {
  return (
    <VisualFrame>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: P.bg, border: `1px solid ${P.border}`, borderRadius: 8, padding: '9px 12px' }}>
        <Link2 size={13} color={P.muted} style={{ flexShrink: 0 }} />
        <span style={{ ...mono, fontSize: 11.5, color: P.ink2, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>koala.app/r/acme-fy26</span>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: P.accentMid, animation: 'livePulse 1.6s ease-in-out infinite', flexShrink: 0 }} />
      </div>
    </VisualFrame>
  );
}

// ── Feature card — uniform grid, one card per capability. No two cards
// share a visual idiom. ──────────────────────────────────────────────────
const FEATURES = [
  { title: 'AI-Driven Assumption Engine', tag: 'Exclusive', visual: <AssumptionVisual />,
    body: 'Describe your business in plain English. Our AI generates a validated, sector-calibrated 3-statement model with realistic assumptions. No spreadsheet, no accounting data required.' },
  { title: 'Dynamic Multi-Scenario Architecture', tag: null, visual: <ScenarioFanVisual />,
    body: 'Base, Optimistic, and Stress scenarios run simultaneously and stay fully linked. Pressure-test your downside without rebuilding: toggle and compare in real time.' },
  { title: 'Conversational What-If Analysis', tag: 'Exclusive', visual: <WhatIfDiffVisual />,
    body: '"What if we expand headcount 30% in Q3?" The AI proposes exact line-item changes with a diff preview. Apply or discard, with full undo history included.' },
  { title: 'Automated 3-Statement Integration', tag: null, visual: <LinkageFlowVisual />,
    body: 'Every assumption flows automatically through Income Statement → Cash Flow → Balance Sheet. No manual reconciliation, no broken links, no version chaos.' },
  { title: 'Investor-Ready Live Reports', tag: 'Exclusive', visual: <LiveReportVisual />,
    body: 'Share a live, interactive report, not a dead PDF. Your investors and board explore the numbers themselves, drilldown and all. One-click pitch one-pager included.' },
  { title: 'Institutional Benchmarking', tag: null, visual: <BenchmarkVisual />,
    body: 'Compare your margins, growth rates, and unit economics against sector data across 17+ industries. Anchor your plan in reality before walking into the boardroom.' },
];

function FeatureCard({ title, body: text, tag, visual, mob }) {
  const [hov, hp] = useHover();
  return (
    <div {...hp} style={{
      display: 'flex', flexDirection: 'column',
      background: P.bg, borderRadius: 16, padding: '26px 26px 28px', position: 'relative',
      border: `1px solid ${hov ? P.border : P.borderFaint}`,
      boxShadow: hov ? '0 16px 36px -20px rgba(15,23,42,0.18)' : '0 1px 2px rgba(15,23,42,0.04)',
      transition: 'box-shadow 200ms, border-color 200ms',
    }}>
      {tag && (
        <span style={{ position: 'absolute', top: 20, right: 20, ...body, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: P.accentDeep, background: P.accentSoft, padding: '4px 10px', borderRadius: 20, zIndex: 1 }}>{tag}</span>
      )}
      {visual}
      <h3 style={{ ...disp, fontSize: 18, fontWeight: 700, color: P.ink, marginBottom: 8, letterSpacing: '-0.015em' }}>{title}</h3>
      <p style={{ ...body, fontSize: 15, lineHeight: 1.65, color: P.muted, margin: 0 }}>{text}</p>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const mob = useIsMobile(640);   // phone
  const tab = useIsMobile(860);   // tablet/collapse-2col

  const sp = mob ? '20px' : '40px';          // side padding
  const vp = mob ? '72px' : '140px';         // vertical rhythm between sections

  // Scrolls to the section named by the URL hash on landing (e.g. arriving
  // from /privacy via "/#contact") — React Router doesn't do this natively.
  React.useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className="koala-page" style={{ background: P.bg, minHeight: '100vh', ...body, color: P.ink, overflowX: 'hidden' }}>
      <style>{`
        @keyframes caretBlink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes livePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(5,150,105,0.4); }
          60%      { box-shadow: 0 0 0 5px rgba(5,150,105,0); }
        }
      `}</style>

      {/* NAV */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${P.borderFaint}` }}>
        <div style={{ ...maxW, padding: `${mob ? 10 : 14}px ${sp}`, display: 'flex', alignItems: 'center', gap: mob ? 12 : 36 }}>
          <BrandLockup size={mob ? 28 : 36} />
          <nav style={{ display: mob ? 'none' : 'flex', alignItems: 'center', gap: 28, flex: 1 }}>
            <a href="#features" style={{ ...body, fontSize: 15, fontWeight: 500, color: P.ink2, textDecoration: 'none' }}>Features</a>
            <a href="#how"      style={{ ...body, fontSize: 15, fontWeight: 500, color: P.ink2, textDecoration: 'none' }}>How it works</a>
            <a href="#free"     style={{ ...body, fontSize: 15, fontWeight: 600, color: P.accentDeep, textDecoration: 'none' }}>Free</a>
            <a href="#contact"  style={{ ...body, fontSize: 15, fontWeight: 500, color: P.ink2, textDecoration: 'none' }}>Contact</a>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: mob ? 8 : 14, marginLeft: 'auto' }}>
            {!mob && <Link to="/auth" style={{ ...body, fontSize: 15, fontWeight: 500, color: P.ink2, textDecoration: 'none', padding: '8px 12px' }}>Log in</Link>}
            <Link to="/auth" style={{ ...body, fontSize: mob ? 13.5 : 15, fontWeight: 600, color: '#fff', background: P.ink, padding: mob ? '10px 18px' : '10px 22px', borderRadius: 999, textDecoration: 'none' }}>Get started</Link>
          </div>
        </div>
      </header>

      <main id="main-content">

      {/* HERO — light, centered, product screenshot below. */}
      <section style={{ background: 'linear-gradient(180deg, #F0FBF6 0%, #FFFFFF 42%)', position: 'relative' }}>
        <div style={{ ...maxW, padding: `${mob ? '72px' : '132px'} ${sp} 0`, textAlign: 'center' }}>
          <h1 style={{ ...disp, fontSize: mob ? 'clamp(34px, 9.5vw, 44px)' : 'clamp(42px, 4.9vw, 70px)', fontWeight: 800, lineHeight: 1.06, letterSpacing: '-0.035em', color: P.ink, margin: '0 auto', maxWidth: 1000 }}>
            Finally understand your<br />
            <span style={{ color: P.accentDeep }}>financial statements.</span>
          </h1>
          <p style={{ ...body, fontSize: mob ? 16 : 19, lineHeight: 1.65, color: P.muted, margin: `${mob ? 18 : 26}px auto 0`, maxWidth: 620 }}>
            Koala builds a fully-linked income statement, balance sheet, and cash flow in under 60 seconds. Then it explains every line in plain English.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: mob ? 26 : 36, justifyContent: 'center', flexWrap: 'wrap' }}>
            <PillLink to="/auth" size={mob ? 'md' : 'lg'} onClick={() => capture('cta_click', { location: 'hero_primary' })}>
              Build your model free <ArrowRight size={17} />
            </PillLink>
            {!mob && (
              <PillLink href="#how" tone="ghost" size="lg" onClick={() => capture('cta_click', { location: 'hero_secondary' })}>
                See how it works
              </PillLink>
            )}
          </div>
          <div style={{ display: 'flex', gap: mob ? 14 : 26, marginTop: mob ? 20 : 26, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Under 60 seconds to first model', 'Every line explained', 'No credit card'].map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, ...body, fontSize: mob ? 12.5 : 14, color: P.muted }}>
                <Check size={14} color={P.accentDeep} />{t}
              </div>
            ))}
          </div>

          {!mob && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: tab ? 48 : 72, paddingBottom: 8 }}>
              <DashboardMock />
            </div>
          )}
        </div>
      </section>

      {/* STATS — quiet numeric strip, dividers only. */}
      <div style={{ ...maxW, padding: `${mob ? '56px' : '96px'} ${sp} 0` }}>
        <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center', flexWrap: 'wrap', maxWidth: 1000, margin: '0 auto' }}>
          {[
            { label: 'From description to first model', end: 60, prefix: '< ', suffix: 's' },
            { label: 'Live scenarios per model',        end: 3,  prefix: '',   suffix: '' },
            { label: 'Industry benchmarks built in',   end: 17, prefix: '',   suffix: '+' },
            { label: 'Statements auto-linked',         end: 100,prefix: '',   suffix: '%' },
          ].map(({ label, end, prefix, suffix }, i) => (
            <div key={label} style={{
              padding: mob ? '14px 16px' : '0 44px',
              borderLeft: (!mob && i > 0) ? `1px solid ${P.border}` : 'none',
              flex: mob ? '0 0 50%' : '1 1 0',
              boxSizing: 'border-box',
            }}>
              <div style={{ ...disp, fontSize: mob ? 30 : 44, fontWeight: 800, color: P.ink, letterSpacing: '-0.03em' }}>
                <CountUp end={end} prefix={prefix} suffix={suffix} />
              </div>
              <div style={{ ...body, fontSize: mob ? 12.5 : 14, color: P.muted, marginTop: 6 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* INTEROP — open three-column row, no boxes. */}
      <div style={{ ...maxW, padding: `${vp} ${sp} 0` }}>
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3, 1fr)', gap: mob ? 36 : 56, maxWidth: 1040, margin: '0 auto' }}>
          {INTEROP.map((it) => (
            <InteropItem key={it.title} {...it} mob={mob} />
          ))}
        </div>
      </div>

      {/* FEATURES — soft gray canvas, white cards. Light-on-light shift needs
          no border or gradient; spacing does the separating. */}
      <section id="features" style={{ background: P.bgSoft, marginTop: mob ? 72 : 140, padding: `${vp} 0` }}>
        <div style={{ ...maxW, padding: `0 ${sp}` }}>
          <Reveal style={{ maxWidth: 820, margin: `0 auto ${mob ? '40px' : '72px'}`, textAlign: 'center' }}>
            <h2 style={{ ...disp, fontSize: mob ? 'clamp(26px, 7vw, 32px)' : 'clamp(30px, 3.2vw, 44px)', fontWeight: 800, color: P.ink, margin: '0 0 18px', letterSpacing: '-0.03em', lineHeight: 1.12 }}>
              Everything the big tools do,{mob ? ' ' : <br />}plus the things they can't.
            </h2>
            <p style={{ ...body, fontSize: mob ? 15 : 17, lineHeight: 1.65, color: P.muted, margin: 0 }}>
              Legacy reporting platforms work only after you have historical data. Koala lets you build, project, and stress-test from day one.
            </p>
          </Reveal>
          <Reveal delay={120} style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3, 1fr)', gap: mob ? 16 : 24, alignItems: 'start' }}>
            {FEATURES.map((f) => <FeatureCard key={f.title} {...f} mob={mob} />)}
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS — light, numbered columns. */}
      <section id="how" style={{ padding: `${vp} 0 0` }}>
        <div style={{ ...maxW, padding: `0 ${sp}` }}>
          <Reveal style={{ maxWidth: 680, margin: `0 auto ${mob ? '40px' : '72px'}`, textAlign: 'center' }}>
            <h2 style={{ ...disp, fontSize: mob ? 'clamp(26px, 7vw, 32px)' : 'clamp(32px, 3.6vw, 48px)', fontWeight: 800, color: P.ink, margin: 0, letterSpacing: '-0.03em', lineHeight: 1.12 }}>
              From a sentence to an investor-ready model.
            </h2>
          </Reveal>
          <Reveal delay={100} style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3, 1fr)', gap: mob ? 36 : 56, maxWidth: 1080, margin: '0 auto' }}>
            {[
              { n: '1', title: 'Describe your business', icon: Sparkles, body: 'Type one sentence: "B2B SaaS, $30K MRR, targeting $5M ARR, 18-month runway." Koala reads your sector, stage, and scale automatically.' },
              { n: '2', title: 'Model builds itself',    icon: Zap,      body: 'A fully-linked Income Statement, Cash Flow, and Balance Sheet, seeded with sector-calibrated assumptions and three live scenarios, in under 60 seconds.' },
              { n: '3', title: 'Refine, share, raise',   icon: Share2,   body: 'Adjust any assumption, run what-if scenarios with the AI advisor, then share a live interactive report directly with your investors or board.' },
            ].map(({ n, title, icon: Icon, body: text }) => (
              <div key={n} style={{ textAlign: mob ? 'center' : 'left' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <span style={{ width: 44, height: 44, borderRadius: 12, background: P.ink, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...disp, fontSize: 18, fontWeight: 700 }}>{n}</span>
                  <Icon size={20} color={P.accentDeep} />
                </div>
                <h3 style={{ ...disp, fontSize: mob ? 18 : 20, fontWeight: 700, color: P.ink, marginBottom: 10, letterSpacing: '-0.015em' }}>{title}</h3>
                <p style={{ ...body, fontSize: 15, lineHeight: 1.65, color: P.muted, margin: 0 }}>{text}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* FREE — tinted rounded panel, the page's single color moment. */}
      <section id="free" style={{ padding: `${vp} ${sp}` }}>
        <Reveal style={{
          ...maxW, background: P.bgMint, borderRadius: mob ? 24 : 32,
          padding: mob ? '48px 24px' : '88px 64px', textAlign: 'center',
        }}>
          <div style={{ ...body, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: P.accentDeep, marginBottom: 16 }}>100% free</div>
          <h2 style={{ ...disp, fontSize: mob ? 'clamp(28px, 7.5vw, 34px)' : 'clamp(34px, 3.8vw, 52px)', fontWeight: 800, color: P.ink, margin: '0 0 16px', letterSpacing: '-0.03em' }}>Free for everyone.</h2>
          <p style={{ ...body, fontSize: mob ? 15 : 17, color: P.ink2, lineHeight: 1.65, maxWidth: 560, margin: '0 auto' }}>
            No plans, no paywalls, no credit card. Every feature is unlocked from the start.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3, 1fr)', gap: mob ? 28 : 48, maxWidth: 920, margin: `${mob ? 36 : 56}px auto 0`, textAlign: mob ? 'center' : 'left' }}>
            {[
              { title: 'Every feature unlocked', body: 'AI model generation, multi-scenario analysis, industry benchmarks, and live investor reports, all included.' },
              { title: 'Unlimited models',       body: 'Create, edit, and save as many financial models as you need. No project caps, no limits.' },
              { title: 'No credit card',          body: 'Sign up with email or Google and start building in seconds. Nothing to pay, now or ever.' },
            ].map(({ title, body: text }) => (
              <div key={title}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: P.accentDeep, marginBottom: 14 }}>
                  <Check size={16} color="#fff" />
                </div>
                <h3 style={{ ...disp, fontSize: 17, fontWeight: 700, color: P.ink, marginBottom: 8, letterSpacing: '-0.01em' }}>{title}</h3>
                <p style={{ ...body, fontSize: 14.5, lineHeight: 1.6, color: P.ink2, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: mob ? 36 : 52 }}>
            <PillLink to="/auth" size={mob ? 'md' : 'lg'} onClick={() => capture('cta_click', { location: 'free_section' })}>
              Get started free <ArrowRight size={17} />
            </PillLink>
          </div>
        </Reveal>
      </section>

      {/* CLOSING — the page's one dark statement: final CTA, contact, footer
          on a single surface with large rounded shoulders. */}
      <section style={{ background: P.dark, borderRadius: mob ? '28px 28px 0 0' : '48px 48px 0 0' }}>
        <div style={{ ...maxW, padding: `${mob ? '72px' : '132px'} ${sp} 0`, textAlign: 'center' }}>
          <h2 style={{ ...disp, fontSize: mob ? 'clamp(28px, 8vw, 36px)' : 'clamp(36px, 4.2vw, 56px)', fontWeight: 800, color: '#F8FAFC', margin: '0 0 18px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Your investors expect<br />institutional quality.
          </h2>
          <p style={{ ...body, fontSize: mob ? 15 : 18, color: 'rgba(248,250,252,0.55)', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.65 }}>
            Build your first 3-statement model in under 60 seconds. No spreadsheet, no finance degree, no credit card.
          </p>
          <PillLink to="/auth" tone="inverse" size={mob ? 'md' : 'lg'} onClick={() => capture('cta_click', { location: 'final_cta' })}>
            Build your model free <ArrowRight size={17} />
          </PillLink>
          <div style={{ marginTop: 22, ...body, fontSize: 13.5, color: 'rgba(248,250,252,0.4)' }}>
            No credit card · Free forever · Encrypted &amp; private
          </div>
        </div>

        {/* CONTACT / FEEDBACK */}
        <div id="contact" style={{ ...maxW, padding: `${mob ? '80px' : '140px'} ${sp} ${mob ? '56px' : '88px'}`, display: 'grid', gridTemplateColumns: tab ? '1fr' : '1fr 1fr', gap: tab ? 36 : 72, alignItems: 'start' }}>
          <div>
            <div style={{ ...body, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: P.accent, marginBottom: 16 }}>Get in touch</div>
            <h2 style={{ ...disp, fontSize: mob ? 'clamp(24px, 7vw, 30px)' : 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: '#F8FAFC', margin: '0 0 14px', letterSpacing: '-0.025em' }}>
              Questions or feedback?
            </h2>
            <p style={{ ...body, fontSize: mob ? 15 : 16.5, color: 'rgba(248,250,252,0.55)', lineHeight: 1.65, maxWidth: 420 }}>
              Tell us what you’re building, report a bug, or suggest a feature. We read every message and usually reply within a day.
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: mob ? '24px 20px' : '32px 30px' }}>
            <ContactForm theme="dark" source="landing" />
          </div>
        </div>

        {/* FOOTER */}
        <footer>
          <div style={{ ...maxW, padding: `28px ${sp} 36px`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/koala-mascot.png" alt="" width={44} height={44} style={{ display: 'block', objectFit: 'contain' }} />
              <span style={{ ...disp, fontSize: 16, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.015em' }}>Koala Statements</span>
            </div>
            <div style={{ ...body, fontSize: 13, color: 'rgba(248,250,252,0.4)' }}>
              © {new Date().getFullYear()} Koala Statements · Not financial advice.
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <Link to="/privacy" style={{ ...body, fontSize: 13, color: 'rgba(248,250,252,0.55)', textDecoration: 'none' }}>Privacy</Link>
              <Link to="/terms"   style={{ ...body, fontSize: 13, color: 'rgba(248,250,252,0.55)', textDecoration: 'none' }}>Terms</Link>
            </div>
          </div>
        </footer>
      </section>
      </main>

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
