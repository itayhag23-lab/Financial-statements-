import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Scale, Droplets, AlertTriangle, Target, ArrowRight, GraduationCap, Link2 } from 'lucide-react';
import { C, FONTS } from '../brand/theme';
import TopNav from '../components/nav/TopNav';
import StatementViz from '../components/ui/StatementViz';

// Koala Learn — a free, concise study hub on the three financial statements.
// Built for founders learning the numbers, students, and teachers who want a
// clean, engaging resource to point a class at. Content is written plainly;
// each statement has a video slot ready for a walkthrough to be dropped in.

const STATEMENTS = [
  {
    key: 'income',
    accent: C.green,
    soft: C.greenSoft,
    icon: TrendingUp,
    tag: 'Are you making money?',
    title: 'The Income Statement',
    what: 'A recap of everything you earned and everything you spent over a stretch of time — a month, a quarter, a year — ending in profit or loss. Read it top to bottom: revenue comes in, costs peel away line by line, and what survives at the bottom is net income.',
    read: [
      ['Revenue', 'Every sale, before any costs — the “top line”.'],
      ['− Cost of goods sold', 'What it directly costs to deliver what you sold.'],
      ['= Gross profit', 'What’s left to run the business with.'],
      ['− Operating expenses', 'Salaries, rent, marketing, R&D — running costs.'],
      ['= Operating income', 'Profit from the core business (EBIT).'],
      ['− Interest & tax', 'The cost of debt and the government’s share.'],
      ['= Net income', 'The real bottom line — what you actually kept.'],
    ],
    flags: [
      'Revenue is climbing but net income is flat or falling — costs are growing faster than sales.',
      'A big one-time gain (selling an asset, a legal win) is inflating profit that won’t repeat.',
      'Margins shrink as the company grows — a sign the model doesn’t scale.',
    ],
    metrics: [
      ['Gross margin', 'Gross profit ÷ revenue. How much each sale contributes before overhead.'],
      ['Operating margin', 'Operating income ÷ revenue. Efficiency of the core business.'],
      ['Net margin', 'Net income ÷ revenue. What you keep from every dollar of sales.'],
    ],
  },
  {
    key: 'balance',
    accent: C.blue,
    soft: C.blueSoft,
    icon: Scale,
    tag: 'What do you own vs. owe?',
    title: 'The Balance Sheet',
    what: 'A snapshot — frozen on a single day — of everything the business owns and everything it owes. It always balances on one rule: Assets = Liabilities + Equity. Whatever you own was paid for either with money you borrowed (liabilities) or money that’s truly yours (equity).',
    read: [
      ['Assets', 'What you own: cash, inventory, equipment, money owed to you.'],
      ['Liabilities', 'What you owe: loans, unpaid bills, obligations.'],
      ['Equity', 'The owners’ stake — assets minus liabilities.'],
      ['The identity', 'Assets = Liabilities + Equity. It must always balance.'],
    ],
    flags: [
      'Liabilities are growing faster than assets — the business is leaning more and more on debt.',
      'Very little cash compared with short-term debt due soon — a liquidity squeeze.',
      'Negative equity — liabilities exceed assets, meaning the business owes more than it owns.',
    ],
    metrics: [
      ['Current ratio', 'Current assets ÷ current liabilities. Can you cover the next 12 months?'],
      ['Debt-to-equity', 'Total debt ÷ equity. How leveraged (risky) the funding mix is.'],
      ['Working capital', 'Current assets − current liabilities. Short-term cushion.'],
    ],
  },
  {
    key: 'cashflow',
    accent: C.gold,
    soft: C.goldSoft,
    icon: Droplets,
    tag: 'Will you run out of cash?',
    title: 'The Cash Flow Statement',
    what: 'A trace of the real money moving in and out of the bank account, split into three buckets. Profit is an opinion; cash is a fact. This is the statement that tells you whether the lights stay on — you can be profitable on paper and still go broke.',
    read: [
      ['Operating activities', 'Cash from the day-to-day business — the healthiest source.'],
      ['Investing activities', 'Cash spent on or made from long-term assets and acquisitions.'],
      ['Financing activities', 'Cash from raising money, repaying debt, or paying owners.'],
      ['= Net change in cash', 'The three buckets summed — did the bank balance grow or shrink?'],
    ],
    flags: [
      'Net income is positive but operating cash flow is negative — profit isn’t turning into cash.',
      'Growth is funded almost entirely by financing (raising or borrowing), not operations.',
      'Cash is draining every period with no path to break even — check the runway.',
    ],
    metrics: [
      ['Free cash flow', 'Operating cash flow − capital spending. Cash truly free to use.'],
      ['Burn rate', 'How much cash you lose per period. Divide cash by it to get runway.'],
      ['Cash runway', 'Months of cash left at the current burn — your survival clock.'],
    ],
  },
];

const Section = ({ children, style }) => (
  <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', ...style }}>{children}</section>
);

function StatementBlock({ s }) {
  const Icon = s.icon;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', marginBottom: 28 }}>
      <div style={{ padding: '22px 24px', borderBottom: `1px solid ${C.border}`, background: s.soft }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: C.surface, border: `1px solid ${s.accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={20} color={s.accent} />
          </div>
          <div>
            <div style={{ fontFamily: FONTS.body, fontSize: 12, fontWeight: 600, color: s.accent }}>{s.tag}</div>
            <h2 style={{ fontFamily: FONTS.display, fontSize: 24, fontWeight: 700, color: C.ink, margin: 0, letterSpacing: '-0.02em' }}>{s.title}</h2>
          </div>
        </div>
      </div>

      <div style={{ padding: '22px 24px' }}>
        <p style={{ fontFamily: FONTS.body, fontSize: 15, lineHeight: 1.65, color: C.ink2, marginTop: 0, marginBottom: 22 }}>{s.what}</p>

        {/* Interactive animated explainer — the "watch it happen" moment. */}
        <StatementViz type={s.key} accent={s.accent} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 22 }}>
          <div>
            <div style={{ fontFamily: FONTS.body, fontSize: 10, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: C.muted, marginBottom: 10 }}>How to read it</div>
            {s.read.map(([k, v]) => (
              <div key={k} style={{ marginBottom: 8 }}>
                <div style={{ fontFamily: FONTS.num, fontSize: 13, fontWeight: 600, color: C.ink }}>{k}</div>
                <div style={{ fontFamily: FONTS.body, fontSize: 12.5, lineHeight: 1.45, color: C.muted }}>{v}</div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONTS.body, fontSize: 10, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: C.rust, marginBottom: 10 }}>
              <AlertTriangle size={12} /> Red flags to spot
            </div>
            {s.flags.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <span style={{ color: C.rust, flexShrink: 0, lineHeight: 1.5 }}>•</span>
                <span style={{ fontFamily: FONTS.body, fontSize: 12.5, lineHeight: 1.5, color: C.ink2 }}>{f}</span>
              </div>
            ))}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONTS.body, fontSize: 10, fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: s.accent, marginBottom: 10 }}>
              <Target size={12} /> Key metrics
            </div>
            {s.metrics.map(([k, v]) => (
              <div key={k} style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: FONTS.body, fontSize: 12.5, fontWeight: 600, color: C.ink }}>{k}</div>
                <div style={{ fontFamily: FONTS.body, fontSize: 12, lineHeight: 1.45, color: C.muted }}>{v}</div>
              </div>
            ))}
          </div>
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
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <Section style={{ padding: '48px 24px 40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FONTS.body, fontSize: 12, fontWeight: 600, color: C.goldText, background: C.goldSoft, borderRadius: 999, padding: '5px 12px', marginBottom: 16 }}>
            <GraduationCap size={14} /> Free study hub
          </div>
          <h1 style={{ fontFamily: FONTS.display, fontSize: 'clamp(30px, 5vw, 44px)', fontWeight: 800, color: C.ink, margin: 0, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Understand the three financial statements
          </h1>
          <p style={{ fontFamily: FONTS.body, fontSize: 16, lineHeight: 1.6, color: C.ink2, maxWidth: 640, marginTop: 16 }}>
            What each statement really says, how to read it, the red flags to watch for, and the metrics that matter — in plain language. Made for founders learning the numbers, students, and teachers who want something clean to share with a class.
          </p>
        </Section>
      </div>

      {/* Statement blocks */}
      <Section style={{ padding: '40px 24px 8px' }}>
        {STATEMENTS.map((s) => <StatementBlock key={s.key} s={s} />)}
      </Section>

      {/* How they connect */}
      <Section style={{ padding: '8px 24px 40px' }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Link2 size={20} color={C.ink} />
            <h2 style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 700, color: C.ink, margin: 0, letterSpacing: '-0.02em' }}>How the three connect</h2>
          </div>
          <p style={{ fontFamily: FONTS.body, fontSize: 14.5, lineHeight: 1.65, color: C.ink2, margin: 0 }}>
            They’re three views of one business, not three separate reports. <strong>Net income</strong> from the Income Statement flows into <strong>retained earnings</strong> on the Balance Sheet — and it’s the starting line of the Cash Flow Statement. Changes in Balance Sheet items (inventory, receivables, payables) show up as cash moving in the Cash Flow Statement. And the ending cash on the Cash Flow Statement is the exact cash balance you see back on the Balance Sheet. Change one number and, done right, all three update together — which is exactly what the builder does for you.
          </p>
        </div>
      </Section>

      {/* CTA */}
      <Section style={{ padding: '8px 24px 64px' }}>
        <div style={{ background: C.ink, borderRadius: 16, padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 700, color: C.surface, letterSpacing: '-0.02em' }}>Learn by building one</div>
          <p style={{ fontFamily: FONTS.body, fontSize: 14, color: 'rgba(255,255,255,0.7)', maxWidth: 440, margin: '8px auto 18px' }}>
            The fastest way to understand the statements is to make your own and watch the numbers move.
          </p>
          <Link to="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: FONTS.body, fontSize: 14, fontWeight: 700, color: C.ink, background: C.gold, textDecoration: 'none', padding: '11px 22px', borderRadius: 10 }}>
            Open the model builder <ArrowRight size={16} />
          </Link>
        </div>
      </Section>
    </div>
  );
}
