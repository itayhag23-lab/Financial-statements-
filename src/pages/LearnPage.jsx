import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Scale, Droplets, AlertTriangle, Target, ArrowRight, Sparkles } from 'lucide-react';
import { C, FONTS } from '../brand/theme';
import TopNav from '../components/nav/TopNav';
import StatementViz from '../components/ui/StatementViz';

// Koala Learn — a free, punchy study hub on the three financial statements.
// Big, visual, and scannable on purpose: the animated explainer carries each
// idea, backed by short "watch out for" and "numbers that matter" cards. Built
// for founders, students, and teachers who want something engaging to share.

const STATEMENTS = [
  {
    key: 'income',
    accent: C.green,
    soft: C.greenSoft,
    icon: TrendingUp,
    question: 'Are you making money?',
    title: 'Income Statement',
    oneLiner: 'Everything you earned, minus everything you spent. Whatever survives at the bottom is your profit.',
    flags: [
      'Sales are up but profit is flat. Costs are growing faster than revenue.',
      'A one time gain is puffing up the profit. It won’t repeat next period.',
      'Margins shrink as the company grows. The model doesn’t scale.',
    ],
    metrics: [
      ['Gross margin', 'What’s left after the direct cost of each sale.'],
      ['Operating margin', 'Profit from the core business.'],
      ['Net margin', 'What you actually keep from every dollar.'],
    ],
  },
  {
    key: 'balance',
    accent: C.blue,
    soft: C.blueSoft,
    icon: Scale,
    question: 'What do you own vs. owe?',
    title: 'Balance Sheet',
    oneLiner: 'A snapshot on a single day of what you own and what you owe. Whatever is left over is truly yours.',
    flags: [
      'Debt is growing faster than what you own.',
      'Barely any cash next to short term bills that are due soon.',
      'Negative equity. You owe more than you own.',
    ],
    metrics: [
      ['Current ratio', 'Can you cover the next 12 months?'],
      ['Debt to equity', 'How risky the funding mix is.'],
      ['Working capital', 'Your short term cushion.'],
    ],
  },
  {
    key: 'cashflow',
    accent: C.gold,
    soft: C.goldSoft,
    icon: Droplets,
    question: 'Will you run out of cash?',
    title: 'Cash Flow Statement',
    oneLiner: 'The real money moving in and out of your bank account. Profit is an opinion. Cash is a fact.',
    flags: [
      'Profit is positive but cash from operations is negative.',
      'Growth is funded by raising money, not by the business itself.',
      'Cash drains every period with no path to break even.',
    ],
    metrics: [
      ['Free cash flow', 'Cash that’s truly free to use.'],
      ['Burn rate', 'How much cash you lose each period.'],
      ['Runway', 'How many months of cash you have left.'],
    ],
  },
];

const Wrap = ({ children, style }) => (
  <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', ...style }}>{children}</div>
);

function StatementBlock({ s, i }) {
  const Icon = s.icon;
  return (
    <div style={{ marginBottom: 44 }}>
      {/* Big question header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
        <div style={{ width: 54, height: 54, borderRadius: 15, background: s.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={26} color={s.accent} />
        </div>
        <div>
          <div style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 700, letterSpacing: '0.02em', color: C.muted, textTransform: 'uppercase' }}>{s.title}</div>
          <h2 style={{ fontFamily: FONTS.display, fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, color: C.ink, margin: '2px 0 0', letterSpacing: '-0.02em', lineHeight: 1.05 }}>{s.question}</h2>
        </div>
      </div>

      <p style={{ fontFamily: FONTS.body, fontSize: 18, lineHeight: 1.55, color: C.ink2, margin: '0 0 22px', maxWidth: 720 }}>{s.oneLiner}</p>

      {/* The fun part: the animated explainer */}
      <StatementViz type={s.key} accent={s.accent} />

      {/* Watch out for + Numbers that matter, as bold cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 6 }}>
        <div style={{ background: C.rustSoft, border: `1px solid ${C.rust}33`, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertTriangle size={17} color={C.rust} />
            <span style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 700, color: C.rust }}>Watch out for</span>
          </div>
          {s.flags.map((f, k) => (
            <div key={k} style={{ display: 'flex', gap: 9, marginBottom: k < s.flags.length - 1 ? 12 : 0 }}>
              <span style={{ color: C.rust, fontWeight: 800, lineHeight: 1.4 }}>!</span>
              <span style={{ fontFamily: FONTS.body, fontSize: 14.5, lineHeight: 1.45, color: C.ink }}>{f}</span>
            </div>
          ))}
        </div>

        <div style={{ background: s.soft, border: `1px solid ${s.accent}33`, borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Target size={17} color={s.accent} />
            <span style={{ fontFamily: FONTS.display, fontSize: 16, fontWeight: 700, color: s.accent === C.gold ? C.goldText : s.accent }}>Numbers that matter</span>
          </div>
          {s.metrics.map(([k, v]) => (
            <div key={k} style={{ marginBottom: 11 }}>
              <div style={{ fontFamily: FONTS.body, fontSize: 14.5, fontWeight: 700, color: C.ink }}>{k}</div>
              <div style={{ fontFamily: FONTS.body, fontSize: 13.5, lineHeight: 1.4, color: C.ink2 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <TopNav />

      {/* Hero */}
      <div style={{ background: C.ink, color: C.surface }}>
        <Wrap style={{ padding: '52px 24px 48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FONTS.body, fontSize: 12.5, fontWeight: 700, color: C.ink, background: C.gold, borderRadius: 999, padding: '6px 13px', marginBottom: 20 }}>
            <Sparkles size={14} /> Free study hub
          </div>
          <h1 style={{ fontFamily: FONTS.display, fontSize: 'clamp(32px, 6vw, 54px)', fontWeight: 800, margin: 0, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            The three financial statements,<br />finally made simple.
          </h1>
          <p style={{ fontFamily: FONTS.body, fontSize: 18, lineHeight: 1.6, color: 'rgba(255,255,255,0.72)', maxWidth: 640, marginTop: 18 }}>
            What each one really tells you, the traps to watch for, and the numbers that matter. Press play, watch it happen. Built for founders, students, and anyone teaching them.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 26 }}>
            {['Are you making money?', 'What do you own vs. owe?', 'Will you run out of cash?'].map((q) => (
              <div key={q} style={{ fontFamily: FONTS.body, fontSize: 13.5, fontWeight: 600, color: C.surface, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 10, padding: '9px 14px' }}>{q}</div>
            ))}
          </div>
        </Wrap>
      </div>

      {/* Statement blocks */}
      <Wrap style={{ padding: '48px 24px 8px' }}>
        {STATEMENTS.map((s, i) => <StatementBlock key={s.key} s={s} i={i} />)}
      </Wrap>

      {/* How they connect */}
      <Wrap style={{ padding: '8px 24px 44px' }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '28px 26px' }}>
          <h2 style={{ fontFamily: FONTS.display, fontSize: 'clamp(22px, 3.5vw, 28px)', fontWeight: 800, color: C.ink, margin: '0 0 12px', letterSpacing: '-0.02em' }}>The three are one story</h2>
          <p style={{ fontFamily: FONTS.body, fontSize: 16.5, lineHeight: 1.65, color: C.ink2, margin: 0 }}>
            Net income from the Income Statement becomes retained earnings on the Balance Sheet, and it’s the starting line of the Cash Flow Statement. Changes on the Balance Sheet move real cash. The cash you end the period with is the exact cash sitting on the Balance Sheet. Change one number and, done right, all three move together. That’s exactly what the builder does for you.
          </p>
        </div>
      </Wrap>

      {/* CTA */}
      <Wrap style={{ padding: '8px 24px 72px' }}>
        <div style={{ background: C.gold, borderRadius: 18, padding: '32px 26px', textAlign: 'center' }}>
          <div style={{ fontFamily: FONTS.display, fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>The best way to get it? Build one.</div>
          <p style={{ fontFamily: FONTS.body, fontSize: 15.5, color: 'rgba(15,23,42,0.72)', maxWidth: 460, margin: '10px auto 20px' }}>
            Make your own model and watch the numbers move in real time. It clicks fast.
          </p>
          <Link to="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: FONTS.body, fontSize: 15, fontWeight: 700, color: C.surface, background: C.ink, textDecoration: 'none', padding: '13px 26px', borderRadius: 12 }}>
            Open the model builder <ArrowRight size={17} />
          </Link>
        </div>
      </Wrap>
    </div>
  );
}
