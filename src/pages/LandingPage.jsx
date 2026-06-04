import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, MessageSquare, GitBranch, BarChart3, Share2, FileText,
  ArrowRight, Check, Shield, Lock, TrendingUp, Zap, Award,
} from 'lucide-react';
import { FONTS } from '../brand/theme';

// Detects viewport width for truly responsive inline styles.
function useIsMobile(bp = 640) {
  const [mob, setMob] = React.useState(() =>
    typeof window !== 'undefined' && window.innerWidth <= bp
  );
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

// Brand lockup — clean geometric K monogram mark + wordmark.
function BrandLockup({ size = 30, textColor = '#0F172A', accent = '#10B981' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 11 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size * 1.3, height: size * 1.3, borderRadius: size * 0.32, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', flexShrink: 0 }}>
        <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <line x1="20" y1="14" x2="20" y2="50" stroke={accent} strokeWidth="6" strokeLinecap="round"/>
          <line x1="20" y1="31" x2="43" y2="14" stroke={accent} strokeWidth="6" strokeLinecap="round"/>
          <line x1="20" y1="31" x2="43" y2="50" stroke={accent} strokeWidth="6" strokeLinecap="round"/>
        </svg>
      </span>
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
  faint:      '#94A3B8',
  accent:     '#10B981',
  accentDark: '#059669',
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
        <div style={{ ...body, fontSize: 11, color: 'rgba(255,255,255,0.28)', marginLeft: 6, flex: 1 }}>
          Acme Corp — Financial Model · FY 2025–2026
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {['Base', 'Optimistic', 'Stress'].map((s, i) => (
            <span key={s} style={{ ...body, fontSize: 9, padding: '2px 7px', borderRadius: 4, background: i === 0 ? P.accent : 'rgba(255,255,255,0.07)', color: i === 0 ? P.bgDark : 'rgba(255,255,255,0.35)', fontWeight: i === 0 ? 700 : 400, cursor: 'default' }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0 14px', display: 'flex', borderBottom: `1px solid ${P.borderDark}` }}>
        {['Income Statement', 'Cash Flow', 'Balance Sheet', 'Analytics'].map((t, i) => (
          <div key={t} style={{ ...body, fontSize: 10.5, padding: '8px 12px', color: i === 0 ? P.accent : 'rgba(255,255,255,0.3)', fontWeight: i === 0 ? 600 : 400, borderBottom: `2px solid ${i === 0 ? P.accent : 'transparent'}`, cursor: 'default', whiteSpace: 'nowrap' }}>{t}</div>
        ))}
      </div>

      {/* KPI tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: `1px solid ${P.borderDark}` }}>
        {kpis.map(({ label, value, change, spk, sc }, i) => (
          <div key={label} style={{ padding: '10px 12px', borderRight: i < 3 ? `1px solid ${P.borderDark}` : 'none' }}>
            <div style={{ ...body, fontSize: 8.5, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
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
          <div style={{ ...body, fontSize: 9.5, color: 'rgba(255,255,255,0.35)' }}>Revenue & Net Income — H1 2025</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[[P.accent, 'Revenue'], [P.blue, 'Net Income']].map(([c, l]) => (
              <span key={l} style={{ ...body, fontSize: 8.5, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}>
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
          {periods.map(p => <span key={p} style={{ ...body, fontSize: 8, color: 'rgba(255,255,255,0.18)' }}>{p}</span>)}
        </div>
      </div>

      {/* Data table */}
      <div>
        <div style={{ display: 'flex', padding: '5px 14px', background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${P.borderDark}` }}>
          <div style={{ flex: 1, ...body, fontSize: 8.5, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Line item</div>
          {['Q1 25', 'Q2 25', 'Q3 25', 'Q4 25'].map(q => <div key={q} style={{ width: 62, textAlign: 'right', ...body, fontSize: 8.5, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>{q}</div>)}
        </div>
        {rows.map(({ label, q, bold, neg, accent: rowAccent }) => (
          <div key={label} style={{ display: 'flex', padding: `${bold ? 6 : 4}px 14px`, background: bold ? 'rgba(255,255,255,0.02)' : 'transparent', borderBottom: `1px solid ${P.borderDark}` }}>
            <div style={{ flex: 1, ...body, fontSize: 9.5, color: bold ? (rowAccent === P.blue ? P.blue : rowAccent ? P.accent : 'rgba(255,255,255,0.75)') : 'rgba(255,255,255,0.38)', fontWeight: bold ? 600 : 400 }}>{label}</div>
            {q.map((v, vi) => (
              <div key={vi} style={{ width: 62, textAlign: 'right', ...mono, fontSize: 9.5, color: v.startsWith('(') ? P.red : bold ? (rowAccent === P.blue ? P.blue : rowAccent ? P.accent : '#F1F5F9') : 'rgba(255,255,255,0.4)', fontWeight: bold ? 600 : 400 }}>{v}</div>
            ))}
          </div>
        ))}
      </div>

      {/* AI bar */}
      <div style={{ padding: '9px 14px', background: 'rgba(16,185,129,0.06)', borderTop: `1px solid rgba(16,185,129,0.14)`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 18, height: 18, borderRadius: '50%', background: P.accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ ...body, fontSize: 9, fontWeight: 800, color: P.bgDark }}>AI</span>
        </span>
        <span style={{ ...body, fontSize: 9.5, color: 'rgba(255,255,255,0.38)', fontStyle: 'italic', flex: 1 }}>
          "What if headcount increases 30% in Q3?"
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

// ── Feature card ────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Sparkles,    title: 'AI-Driven Assumption Engine',      tag: 'Exclusive', body: 'Describe your business in plain English. Our AI generates a validated, sector-calibrated 3-statement model with realistic assumptions — no spreadsheet, no accounting data required.' },
  { icon: GitBranch,   title: 'Dynamic Multi-Scenario Architecture', tag: null,       body: 'Base, Optimistic, and Stress scenarios run simultaneously and stay fully linked. Pressure-test your downside without rebuilding — toggle and compare in real time.' },
  { icon: BarChart3,   title: 'Automated 3-Statement Integration',  tag: null,       body: 'Every assumption flows automatically through Income Statement → Cash Flow → Balance Sheet. No manual reconciliation, no broken links, no version chaos.' },
  { icon: TrendingUp,  title: 'Institutional Benchmarking',        tag: null,       body: 'Compare your margins, growth rates, and unit economics against sector data across 17+ industries. Anchor your plan in reality before walking into the boardroom.' },
  { icon: MessageSquare, title: 'Conversational What-If Analysis', tag: 'Exclusive', body: '"What if we expand headcount 30% in Q3?" The AI proposes exact line-item changes with a diff preview. Apply or discard — full undo history included.' },
  { icon: Share2,      title: 'Investor-Ready Live Reports',       tag: 'Exclusive', body: 'Share a live, interactive report — not a dead PDF. Your investors and board explore the numbers themselves, drilldown and all. One-click pitch one-pager included.' },
];

function FeatureCard({ icon: Icon, title, body: text, tag }) {
  return (
    <div style={{ background: P.bg, border: `1px solid ${P.border}`, borderRadius: 12, padding: '24px 22px', position: 'relative' }}>
      {tag && (
        <span style={{ position: 'absolute', top: 18, right: 18, ...body, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: P.accent, background: P.accentSoft, padding: '3px 8px', borderRadius: 20 }}>{tag}</span>
      )}
      <div style={{ width: 40, height: 40, borderRadius: 10, background: P.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Icon size={19} color={P.accent} />
      </div>
      <h3 style={{ ...disp, fontSize: 17, fontWeight: 700, color: P.ink, marginBottom: 8, letterSpacing: '-0.01em' }}>{title}</h3>
      <p style={{ ...body, fontSize: 13.5, lineHeight: 1.65, color: P.ink2 }}>{text}</p>
    </div>
  );
}

// ── Price card ──────────────────────────────────────────────────────────────
function PriceCard({ tier, price, period, blurb, features, cta, ctaHref, highlight, enterprise }) {
  const btn = {
    display: 'block', textAlign: 'center',
    ...body, fontSize: 14, fontWeight: 600,
    padding: '11px 0', borderRadius: 9, textDecoration: 'none',
    background: highlight ? P.accent : enterprise ? P.ink : 'transparent',
    color: highlight ? P.bgDark : '#fff',
    border: highlight ? 'none' : enterprise ? 'none' : `1.5px solid ${P.border}`,
  };
  return (
    <div style={{
      background: highlight ? P.bgDarkCard : P.bg,
      border: `1px solid ${highlight ? P.accentGlow : P.border}`,
      borderRadius: 14,
      padding: '28px 24px',
      flex: 1,
      minWidth: 250,
      boxShadow: highlight ? `0 0 0 1px ${P.accentSoft}, 0 30px 60px -20px rgba(0,0,0,0.5)` : 'none',
      position: 'relative',
    }}>
      {highlight && (
        <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: P.accent, ...body, fontSize: 10, fontWeight: 700, color: P.bgDark, padding: '3px 14px', borderRadius: 20, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Most Popular</div>
      )}
      <div style={{ ...body, fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: highlight ? P.accent : P.muted, fontWeight: 600 }}>{tier}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 12, marginBottom: 4 }}>
        {enterprise
          ? <span style={{ ...disp, fontSize: 30, fontWeight: 700, color: P.ink, letterSpacing: '-0.02em' }}>Contact us</span>
          : <>
              <span style={{ ...disp, fontSize: 40, fontWeight: 700, color: highlight ? '#F1F5F9' : P.ink, letterSpacing: '-0.025em' }}>{price}</span>
              <span style={{ ...body, fontSize: 13, color: highlight ? 'rgba(255,255,255,0.4)' : P.muted }}>{period}</span>
            </>
        }
      </div>
      <p style={{ ...body, fontSize: 13, color: highlight ? 'rgba(255,255,255,0.5)' : P.ink2, marginBottom: 20, lineHeight: 1.55 }}>{blurb}</p>
      <Link to={ctaHref} style={btn}>{cta}</Link>
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {features.map((f) => (
          <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Check size={14} color={P.accent} style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ ...body, fontSize: 13, color: highlight ? 'rgba(255,255,255,0.6)' : P.ink2 }}>{f}</span>
          </div>
        ))}
      </div>
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
    <div style={{ background: P.bg, minHeight: '100vh', ...body, color: P.ink, overflowX: 'hidden' }}>

      {/* NAV */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${P.border}` }}>
        <div style={{ ...maxW, padding: `12px ${sp}`, display: 'flex', alignItems: 'center', gap: mob ? 12 : 28 }}>
          <BrandLockup size={mob ? 24 : 30} />
          <nav style={{ display: mob ? 'none' : 'flex', alignItems: 'center', gap: 22, flex: 1 }}>
            <a href="#features" style={{ ...body, fontSize: 14, color: P.ink2, textDecoration: 'none' }}>Features</a>
            <a href="#how"      style={{ ...body, fontSize: 14, color: P.ink2, textDecoration: 'none' }}>How it works</a>
            <a href="#security" style={{ ...body, fontSize: 14, color: P.ink2, textDecoration: 'none' }}>Security</a>
            <a href="#pricing"  style={{ ...body, fontSize: 14, color: P.ink2, textDecoration: 'none' }}>Pricing</a>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: mob ? 6 : 10, marginLeft: 'auto' }}>
            {!mob && <Link to="/auth" style={{ ...body, fontSize: 14, color: P.muted, textDecoration: 'none', padding: '8px 12px' }}>Log in</Link>}
            <Link to="/auth" style={{ ...body, fontSize: mob ? 13 : 14, fontWeight: 600, color: '#fff', background: P.ink, padding: mob ? '10px 16px' : '9px 18px', borderRadius: 9, textDecoration: 'none' }}>Start free</Link>
          </div>
        </div>
      </header>

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
              Institutional-Grade<br />Financial Modeling.<br />
              <span style={{ color: P.accent }}>Powered by AI.</span>
            </h1>
            <p style={{ ...body, fontSize: mob ? 15 : 17, lineHeight: 1.65, color: 'rgba(248,250,252,0.55)', marginTop: mob ? 14 : 20, maxWidth: mob ? '100%' : 490 }}>
              Transform raw assumptions into investor-ready 3-statement financial architecture in minutes — not weeks. Built for founders, CFOs, and the analysts who support them.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: mob ? 20 : 28, flexWrap: 'wrap' }}>
              <Link to="/auth" style={{ ...body, fontSize: mob ? 14 : 15, fontWeight: 600, color: P.bgDark, background: P.accent, padding: mob ? '12px 20px' : '13px 24px', borderRadius: 10, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Build your model free <ArrowRight size={16} />
              </Link>
              {!mob && (
                <a href="#how" style={{ ...body, fontSize: 15, fontWeight: 500, color: 'rgba(248,250,252,0.7)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '13px 24px', borderRadius: 10, textDecoration: 'none' }}>
                  See how it works
                </a>
              )}
            </div>
            <div style={{ display: 'flex', gap: mob ? 12 : 20, marginTop: mob ? 16 : 22, flexWrap: 'wrap' }}>
              {['No credit card required', 'SOC 2 compliant', '< 60 sec to first model'].map((t) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, ...body, fontSize: mob ? 11.5 : 12.5, color: 'rgba(255,255,255,0.35)' }}>
                  <Check size={13} color={P.accent} />{t}
                </div>
              ))}
            </div>
          </div>
          {!tab && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <DashboardMock />
            </div>
          )}
        </div>
      </section>

      {/* INTEGRATION STRIP */}
      <div style={{ background: P.bgAlt, borderBottom: `1px solid ${P.border}` }}>
        <div style={{ ...maxW, padding: `16px ${sp}`, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ ...body, fontSize: 11.5, color: P.muted, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>Works with your stack:</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {INTEGRATIONS.map((ig) => <IntegrationBadge key={ig.name} {...ig} />)}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ background: P.bg, borderBottom: `1px solid ${P.border}` }}>
        <div style={{ ...maxW, padding: `${mob ? '28px' : '44px'} ${sp}`, display: 'flex', justifyContent: 'space-around', textAlign: 'center', flexWrap: 'wrap', gap: 0 }}>
          {[
            ['< 60s', 'From description to first model'],
            ['3', 'Live scenarios per model'],
            ['17+', 'Industry benchmarks built in'],
            ['100%', 'Statements auto-linked'],
          ].map(([n, l], i) => (
            <div key={l} style={{
              padding: mob ? '14px 12px' : '10px 28px',
              borderRight: (!mob && i < 3) ? `1px solid ${P.border}` : 'none',
              borderBottom: mob ? `1px solid ${P.border}` : 'none',
              flex: mob ? '0 0 50%' : 1,
              minWidth: mob ? 0 : 130,
              boxSizing: 'border-box',
            }}>
              <div style={{ ...disp, fontSize: mob ? 28 : 36, fontWeight: 700, color: P.ink, letterSpacing: '-0.02em' }}>{n}</div>
              <div style={{ ...body, fontSize: mob ? 12 : 13, color: P.muted, marginTop: 5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" style={{ background: P.bgAlt, borderBottom: `1px solid ${P.border}` }}>
        <div style={{ ...maxW, padding: `${vp} ${sp}` }}>
          <Reveal style={{ textAlign: 'center', maxWidth: 640, margin: `0 auto ${mob ? '32px' : '52px'}` }}>
            <div style={{ ...body, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: P.accent, marginBottom: 14 }}>Capabilities</div>
            <h2 style={{ ...disp, fontSize: 'clamp(22px, 3.8vw, 42px)', fontWeight: 700, color: P.ink, margin: '0 0 14px', letterSpacing: '-0.02em' }}>Everything the big tools do — plus the things they can't.</h2>
            <p style={{ ...body, fontSize: mob ? 14 : 16, lineHeight: 1.65, color: P.ink2 }}>Legacy reporting platforms work only after you have historical data. Koala lets you build, project, and stress-test from day one — then uses AI to do the heavy lifting.</p>
          </Reveal>
          <Reveal delay={120} style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: mob ? 12 : 16 }}>
            {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ background: P.bg, borderBottom: `1px solid ${P.border}` }}>
        <div style={{ ...maxW, padding: `${vp} ${sp}` }}>
          <Reveal style={{ textAlign: 'center', marginBottom: mob ? 28 : 52 }}>
            <div style={{ ...body, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: P.accent, marginBottom: 14 }}>Workflow</div>
            <h2 style={{ ...disp, fontSize: 'clamp(22px, 3.8vw, 42px)', fontWeight: 700, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>From a sentence to an investor-ready model.</h2>
          </Reveal>
          <Reveal delay={100} style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: mob ? 12 : 20 }}>
            {[
              { n: '01', title: 'Describe your business', icon: Sparkles, body: 'Type one sentence: "B2B SaaS, $30K MRR, targeting $5M ARR, 18-month runway." Koala reads your sector, stage, and scale automatically.' },
              { n: '02', title: 'Model builds itself',    icon: Zap,      body: 'A fully-linked Income Statement, Cash Flow, and Balance Sheet — seeded with sector-calibrated assumptions and three live scenarios — in under 60 seconds.' },
              { n: '03', title: 'Refine, share, raise',   icon: Share2,   body: 'Adjust any assumption, run what-if scenarios with the AI advisor, then share a live interactive report directly with your investors or board.' },
            ].map(({ n, title, icon: Icon, body: text }) => (
              <div key={n} style={{ padding: mob ? '20px 16px' : '28px 24px', background: P.bgAlt, borderRadius: 12, border: `1px solid ${P.border}` }}>
                <div style={{ ...body, fontSize: 11, fontWeight: 700, color: P.accent, letterSpacing: '0.14em', marginBottom: 12 }}>STEP {n}</div>
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

      {/* SECURITY */}
      <section id="security" style={{ background: P.bgDark }}>
        <div style={{ ...maxW, padding: `${vp} ${sp}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: tab ? '1fr' : '1fr 1fr', gap: tab ? 32 : 64, alignItems: 'center' }}>
            <div>
              <div style={{ ...body, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: P.accent, marginBottom: 14 }}>Security & Compliance</div>
              <h2 style={{ ...disp, fontSize: 'clamp(26px, 3.4vw, 38px)', fontWeight: 700, color: '#F8FAFC', margin: '0 0 16px', letterSpacing: '-0.02em' }}>Enterprise-ready from day one.</h2>
              <p style={{ ...body, fontSize: 16, lineHeight: 1.65, color: 'rgba(248,250,252,0.5)', marginBottom: 32 }}>
                Your financial data stays private and secure. We've built Koala to meet the standards that institutional buyers and investors expect.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {[
                  { icon: Shield,    label: 'SOC 2 Type II',             desc: 'Annual third-party audit of our security controls' },
                  { icon: Lock,      label: '256-bit AES Encryption',     desc: 'At rest and in transit, on every plan' },
                  { icon: Award,     label: 'GDPR & CCPA Compliant',      desc: 'Full data residency and deletion on request' },
                  { icon: FileText,  label: 'Role-Based Access Control',  desc: 'Granular permissions for team and board sharing' },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: P.accentSoft, border: `1px solid rgba(16,185,129,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color={P.accent} />
                    </div>
                    <div>
                      <div style={{ ...body, fontSize: 14, fontWeight: 600, color: '#F1F5F9', marginBottom: 2 }}>{label}</div>
                      <div style={{ ...body, fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {['SOC 2', 'GDPR', 'ISO 27001', 'CCPA'].map((badge) => (
                  <div key={badge} style={{ background: P.bgDarkAlt, border: `1px solid ${P.borderDark}`, borderRadius: 12, padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: P.accentSoft, border: `1px solid rgba(16,185,129,0.3)`, margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Shield size={16} color={P.accent} />
                    </div>
                    <div style={{ ...body, fontSize: 13, fontWeight: 700, color: '#F1F5F9' }}>{badge}</div>
                    <div style={{ ...body, fontSize: 10.5, color: 'rgba(255,255,255,0.28)', marginTop: 3 }}>Compliant</div>
                  </div>
                ))}
              </div>
              <div style={{ background: P.bgDarkAlt, border: `1px solid ${P.borderDark}`, borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ ...body, fontSize: 11, color: 'rgba(255,255,255,0.28)', marginBottom: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Data Residency</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {['🇺🇸 US East', '🇪🇺 EU West', '🌏 APAC'].map((r) => (
                    <div key={r} style={{ ...body, fontSize: 12, color: '#F1F5F9', padding: '5px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, border: `1px solid ${P.borderDark}` }}>{r}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ background: P.bgAlt, borderTop: `1px solid ${P.border}`, borderBottom: `1px solid ${P.border}` }}>
        <div style={{ ...maxW, padding: `${vp} ${sp}` }}>
          <Reveal style={{ textAlign: 'center', marginBottom: mob ? 32 : 52 }}>
            <div style={{ ...body, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: P.accent, marginBottom: 14 }}>Pricing</div>
            <h2 style={{ ...disp, fontSize: 'clamp(27px, 3.8vw, 42px)', fontWeight: 700, color: P.ink, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Transparent pricing. No surprises.</h2>
            <p style={{ ...body, fontSize: mob ? 14 : 16, color: P.ink2 }}>Start with a free trial. Upgrade when you need more power.</p>
          </Reveal>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start', flexDirection: mob ? 'column' : 'row' }}>
            <PriceCard
              tier="Growth"
              price="$79"
              period="/ month"
              blurb="For founders and analysts who need a serious modeling tool — not a spreadsheet."
              features={['Unlimited projects', '3-statement engine + all scenarios', '17+ industry benchmarks', 'AI advisor (fair use)', 'JSON export']}
              cta="Start free trial"
              ctaHref="/auth"
            />
            <PriceCard
              tier="Pro"
              price="$249"
              period="/ month"
              blurb="For finance teams that need AI-native automation, live sharing, and board-ready exports."
              features={['Everything in Growth', 'AI builds & edits your model', 'Conversational what-if analysis', 'Shareable live investor reports', 'Pitch one-pager export', 'Priority AI advisor', 'Team collaboration (up to 5)']}
              cta="Start free trial"
              ctaHref="/auth"
              highlight
            />
            <PriceCard
              tier="Enterprise"
              price=""
              period=""
              blurb="For organizations that need custom integrations, SSO, dedicated support, and SLAs."
              features={['Everything in Pro', 'QuickBooks / Xero / NetSuite sync', 'SAML SSO + SCIM provisioning', 'Custom data residency', 'Dedicated CSM + SLA', 'Audit logs + RBAC', 'Custom AI fine-tuning']}
              cta="Contact Sales"
              ctaHref="/auth"
              enterprise
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: P.bgDark, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 350, borderRadius: '50%', background: `radial-gradient(ellipse, ${P.accentGlow} 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ ...maxW, padding: `${mob ? '60px' : '100px'} ${sp}`, textAlign: 'center', position: 'relative' }}>
          <h2 style={{ ...disp, fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, color: '#F8FAFC', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            Your investors expect<br />institutional quality.
          </h2>
          <p style={{ ...body, fontSize: mob ? 15 : 17, color: 'rgba(248,250,252,0.5)', maxWidth: 460, margin: '0 auto 32px', lineHeight: 1.65 }}>
            Build your first 3-statement model in under 60 seconds. No spreadsheet, no finance degree, no credit card.
          </p>
          <Link to="/auth" style={{ ...body, fontSize: mob ? 15 : 16, fontWeight: 700, color: P.bgDark, background: P.accent, padding: mob ? '13px 24px' : '15px 32px', borderRadius: 11, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 9 }}>
            Build your model free <ArrowRight size={18} />
          </Link>
          <div style={{ marginTop: 20, ...body, fontSize: 12.5, color: 'rgba(255,255,255,0.25)' }}>
            No credit card · Cancel anytime · SOC 2 compliant
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#070D1A', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ ...maxW, padding: `28px ${sp}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="26" height="26" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <line x1="20" y1="14" x2="20" y2="50" stroke="#10B981" strokeWidth="6" strokeLinecap="round"/>
              <line x1="20" y1="31" x2="43" y2="14" stroke="#10B981" strokeWidth="6" strokeLinecap="round"/>
              <line x1="20" y1="31" x2="43" y2="50" stroke="#10B981" strokeWidth="6" strokeLinecap="round"/>
            </svg>
            <span style={{ ...disp, fontSize: 16, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.015em' }}>Koala Statements</span>
          </div>
          <div style={{ ...body, fontSize: 12.5, color: 'rgba(255,255,255,0.22)' }}>
            © {new Date().getFullYear()} Koala Statements · Not financial advice.
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'Security'].map((l) => (
              <a key={l} href="#" style={{ ...body, fontSize: 12.5, color: 'rgba(255,255,255,0.32)', textDecoration: 'none' }}>{l}</a>
            ))}
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
