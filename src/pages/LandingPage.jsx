import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MessageSquare, GitBranch, BarChart3, Share2, FileText, ArrowRight, Check, TrendingUp } from 'lucide-react';
import { C, FONTS } from '../brand/theme';
import { Logo, KoalaMark } from '../brand/Logo';

const maxW = { maxWidth: 1180, marginLeft: 'auto', marginRight: 'auto' };
const serif = { fontFamily: FONTS.display };
const body = { fontFamily: FONTS.body };

function Eyebrow({ children, color = C.gold }) {
  return <div style={{ ...body, color, letterSpacing: '0.22em', textTransform: 'uppercase', fontSize: 11, fontWeight: 600 }}>{children}</div>;
}

// Stylised product preview — a faux statement card with a mini area chart.
function ProductMock() {
  const pts = [22, 30, 28, 44, 52, 70];
  const w = 260, h = 70, max = 80;
  const path = pts.map((v, i) => `${(i / (pts.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  const area = `0,${h} ${path} ${w},${h}`;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, boxShadow: '0 40px 80px -32px rgba(31,27,22,0.35)', padding: 22, transform: 'rotate(-1.2deg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <KoalaMark size={22} />
          <span style={{ ...serif, fontWeight: 600, fontSize: 16, color: C.ink }}>Coffee Shop — Base</span>
        </div>
        <span style={{ ...body, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.gold }}>FY25–29</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[['Revenue', '$1.42M', C.ink], ['Net margin', '11.4%', C.green], ['Runway', '28 mo', C.ink]].map(([l, v, col]) => (
          <div key={l} style={{ background: C.bg, border: `1px solid ${C.borderSoft}`, borderRadius: 10, padding: '9px 11px' }}>
            <div style={{ ...body, fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted }}>{l}</div>
            <div style={{ fontFamily: FONTS.num, fontSize: 16, fontWeight: 600, color: col, marginTop: 3 }}>{v}</div>
          </div>
        ))}
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="mockg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.gold} stopOpacity="0.35" />
            <stop offset="100%" stopColor={C.gold} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#mockg)" />
        <polyline points={path} fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

const FEATURES = [
  { icon: Sparkles, title: 'AI builds your model', body: 'Describe your business in one sentence. Koala drafts a full 3-statement model — revenue, costs, growth — in seconds. No spreadsheets, no accounting data required.', tag: 'Only on Koala' },
  { icon: MessageSquare, title: 'Conversational what-if', body: '“What if I hire 3 people?” Koala proposes the exact line-item changes and shows you a clean before/after diff to apply or discard.', tag: 'Only on Koala' },
  { icon: GitBranch, title: 'Base · Best · Worst', body: 'Every model carries three live scenarios at once. Stress-test downside and chase upside without rebuilding a thing.' },
  { icon: BarChart3, title: 'Sector benchmarks', body: 'Your margins, instantly compared against real peers and industry ranges — so your plan is grounded in reality, not optimism.' },
  { icon: Share2, title: 'Shareable live reports', body: 'Send a link to an interactive report, not a dead PDF. Investors and partners explore the numbers themselves.', tag: 'Only on Koala' },
  { icon: FileText, title: 'Investor one-pager', body: 'Generate a clean, print-ready pitch summary from your model with a single click. Walk into the room ready.' },
];

const STEPS = [
  { n: '01', title: 'Describe or pick', body: 'Tell Koala about your business in plain English, or start from a sector template.' },
  { n: '02', title: 'Koala drafts the model', body: 'A complete income statement, cash flow, and balance sheet — seeded with realistic assumptions.' },
  { n: '03', title: 'Refine & share', body: 'Tweak any number, ask the AI advisor, then export or share a live, interactive report.' },
];

function Feature({ icon: Icon, title, body: text, tag }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, position: 'relative' }}>
      {tag && <span style={{ position: 'absolute', top: 16, right: 16, ...body, fontSize: 9.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gold, background: C.goldSoft, padding: '3px 8px', borderRadius: 20 }}>{tag}</span>}
      <div style={{ width: 42, height: 42, borderRadius: 11, background: C.bgWarm, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Icon size={20} color={C.gold} />
      </div>
      <h3 style={{ ...serif, fontSize: 21, fontWeight: 600, color: C.ink, marginBottom: 8 }}>{title}</h3>
      <p style={{ ...body, fontSize: 14, lineHeight: 1.6, color: C.ink2 }}>{text}</p>
    </div>
  );
}

function PriceCard({ name, price, period, blurb, features, cta, highlight }) {
  return (
    <div style={{ background: highlight ? C.ink : C.surface, border: `1px solid ${highlight ? C.ink : C.border}`, borderRadius: 18, padding: 30, flex: 1, minWidth: 260, boxShadow: highlight ? '0 30px 60px -24px rgba(31,27,22,0.45)' : 'none' }}>
      <div style={{ ...body, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: highlight ? C.gold : C.muted, fontWeight: 600 }}>{name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 14 }}>
        <span style={{ ...serif, fontSize: 44, fontWeight: 600, color: highlight ? C.surface : C.ink }}>{price}</span>
        <span style={{ ...body, fontSize: 14, color: highlight ? C.faint : C.muted }}>{period}</span>
      </div>
      <p style={{ ...body, fontSize: 13.5, color: highlight ? '#D9D2C4' : C.ink2, marginTop: 8, marginBottom: 20 }}>{blurb}</p>
      <Link to="/app" style={{ display: 'block', textAlign: 'center', ...body, fontSize: 14, fontWeight: 600, padding: '11px 0', borderRadius: 10, textDecoration: 'none', background: highlight ? C.gold : C.ink, color: highlight ? C.ink : C.surface }}>{cta}</Link>
      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 11 }}>
        {features.map((f) => (
          <div key={f} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
            <Check size={16} color={highlight ? C.gold : C.green} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ ...body, fontSize: 13.5, color: highlight ? '#E8E2D4' : C.ink2 }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', ...body, color: C.ink }}>
      {/* NAV */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(244,241,233,0.85)', backdropFilter: 'blur(10px)', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ ...maxW, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo size={30} />
          <nav style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            <a href="#features" style={{ ...body, fontSize: 14, color: C.ink2, textDecoration: 'none' }} className="hidden sm:inline">Features</a>
            <a href="#how" style={{ ...body, fontSize: 14, color: C.ink2, textDecoration: 'none' }} className="hidden sm:inline">How it works</a>
            <a href="#pricing" style={{ ...body, fontSize: 14, color: C.ink2, textDecoration: 'none' }} className="hidden sm:inline">Pricing</a>
            <Link to="/app" style={{ ...body, fontSize: 14, fontWeight: 600, color: C.surface, background: C.ink, padding: '9px 18px', borderRadius: 9, textDecoration: 'none' }}>Open app</Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section style={{ ...maxW, padding: '72px 24px 56px', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 48, alignItems: 'center' }} className="koala-hero">
        <div>
          <Eyebrow>Financial modeling, reimagined</Eyebrow>
          <h1 style={{ ...serif, fontSize: 'clamp(40px, 5.6vw, 68px)', fontWeight: 600, lineHeight: 1.03, letterSpacing: '-0.02em', color: C.ink, margin: '18px 0 0' }}>
            The financial model that<br />builds <span style={{ color: C.gold, fontStyle: 'italic' }}>itself</span>.
          </h1>
          <p style={{ ...body, fontSize: 18, lineHeight: 1.6, color: C.ink2, marginTop: 22, maxWidth: 520 }}>
            Describe your business in a sentence. Koala drafts a complete, investor-ready 3-statement model — with scenarios, benchmarks, and an AI advisor that actually understands your numbers.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 30, flexWrap: 'wrap' }}>
            <Link to="/app" style={{ ...body, fontSize: 15, fontWeight: 600, color: C.surface, background: C.ink, padding: '14px 26px', borderRadius: 11, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Start free <ArrowRight size={17} />
            </Link>
            <a href="#how" style={{ ...body, fontSize: 15, fontWeight: 600, color: C.ink, background: C.surface, border: `1px solid ${C.border}`, padding: '14px 26px', borderRadius: 11, textDecoration: 'none' }}>See how it works</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 22, ...body, fontSize: 13, color: C.muted }}>
            <Check size={15} color={C.green} /> No credit card · No accounting data needed · Free to start
          </div>
        </div>
        <ProductMock />
      </section>

      {/* STATS STRIP */}
      <section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.bgWarm }}>
        <div style={{ ...maxW, padding: '26px 24px', display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'space-around', textAlign: 'center' }}>
          {[['3', 'statements, fully linked'], ['17+', 'industry benchmarks built in'], ['3', 'live scenarios per model'], ['< 30s', 'from idea to first draft']].map(([n, l]) => (
            <div key={l}>
              <div style={{ ...serif, fontSize: 34, fontWeight: 600, color: C.ink }}>{n}</div>
              <div style={{ ...body, fontSize: 13, color: C.muted, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ ...maxW, padding: '76px 24px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 48px' }}>
          <Eyebrow>The Koala difference</Eyebrow>
          <h2 style={{ ...serif, fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 600, color: C.ink, margin: '14px 0 12px', letterSpacing: '-0.01em' }}>Everything the big tools do — plus the things they don't.</h2>
          <p style={{ ...body, fontSize: 16, lineHeight: 1.6, color: C.ink2 }}>Fathom and the rest report on data you already have. Koala helps you build the plan from scratch — and uses AI to do the heavy lifting.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
          {FEATURES.map((f) => <Feature key={f.title} {...f} />)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ ...maxW, padding: '76px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Eyebrow>How it works</Eyebrow>
          <h2 style={{ ...serif, fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 600, color: C.ink, margin: '14px 0 0', letterSpacing: '-0.01em' }}>From a sentence to a strategy in three steps.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 22 }}>
          {STEPS.map((s) => (
            <div key={s.n} style={{ padding: '4px 8px' }}>
              <div style={{ ...serif, fontSize: 40, fontWeight: 600, color: C.gold, lineHeight: 1 }}>{s.n}</div>
              <div style={{ height: 1, background: C.border, margin: '16px 0' }} />
              <h3 style={{ ...serif, fontSize: 22, fontWeight: 600, color: C.ink, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ ...body, fontSize: 14.5, lineHeight: 1.6, color: C.ink2 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ background: C.bgWarm, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ ...maxW, padding: '76px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <Eyebrow>Pricing</Eyebrow>
            <h2 style={{ ...serif, fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 600, color: C.ink, margin: '14px 0 0', letterSpacing: '-0.01em' }}>Start free. Upgrade when you're ready.</h2>
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', maxWidth: 760, margin: '0 auto' }}>
            <PriceCard name="Free" price="$0" period="forever" blurb="Everything you need to build and pressure-test your first model." cta="Get started" features={['Unlimited models on this device', '3-statement engine + scenarios', 'Sector benchmarks', 'AI advisor (fair-use)']} />
            <PriceCard name="Pro" price="$19" period="/ month" blurb="For founders raising or running the numbers seriously." cta="Start free trial" highlight features={['Everything in Free', 'AI builds & edits your model', 'Shareable live reports', 'Investor one-pager export', 'Priority AI advisor']} />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ ...maxW, padding: '84px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', marginBottom: 22 }}><KoalaMark size={48} /></div>
        <h2 style={{ ...serif, fontSize: 'clamp(32px, 4.4vw, 50px)', fontWeight: 600, color: C.ink, margin: '0 0 16px', letterSpacing: '-0.01em' }}>Your numbers deserve a real plan.</h2>
        <p style={{ ...body, fontSize: 17, color: C.ink2, maxWidth: 520, margin: '0 auto 28px', lineHeight: 1.6 }}>Build your first model in under a minute. No spreadsheet, no finance degree, no credit card.</p>
        <Link to="/app" style={{ ...body, fontSize: 16, fontWeight: 600, color: C.surface, background: C.ink, padding: '15px 32px', borderRadius: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 9 }}>
          Open Koala Statements <ArrowRight size={18} />
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ ...maxW, padding: '32px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Logo size={26} />
          <div style={{ ...body, fontSize: 12.5, color: C.muted, display: 'flex', alignItems: 'center', gap: 7 }}>
            <TrendingUp size={14} color={C.gold} /> Built for founders, by Koala. Not financial advice.
          </div>
          <div style={{ ...body, fontSize: 12.5, color: C.faint }}>© {new Date().getFullYear()} Koala Statements</div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 860px){ .koala-hero{ grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
