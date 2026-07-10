import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Scale, Droplets, AlertTriangle, Target, ArrowRight, Sparkles,
  Lightbulb, BookOpen, Link2, Gauge, CheckCircle2,
} from 'lucide-react';
import { C, FONTS } from '../brand/theme';
import TopNav from '../components/nav/TopNav';
import StatementViz from '../components/ui/StatementViz';

// Koala Learn — a free, comprehensive study hub on the three financial
// statements. Big, visual, and scannable on purpose: each statement gets an
// animated explainer, a plain-English deep dive with analogies and a worked
// example, plus "watch out for" and "numbers that matter" cards. Followed by
// how the three connect, classic mistakes, and a cheat-sheet recap. Built for
// founders, students, and teachers who want something engaging to share.

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

// ── Long-form building blocks ───────────────────────────────────────────────

const P = ({ children, style }) => (
  <p style={{ fontFamily: FONTS.body, fontSize: 15.5, lineHeight: 1.7, color: C.ink2, margin: '0 0 14px', maxWidth: 720, ...style }}>{children}</p>
);

const H3 = ({ children }) => (
  <h3 style={{ fontFamily: FONTS.display, fontSize: 19, fontWeight: 800, color: C.ink, margin: '26px 0 10px', letterSpacing: '-0.01em' }}>{children}</h3>
);

const UL = ({ children }) => (
  <ul style={{ fontFamily: FONTS.body, fontSize: 15, lineHeight: 1.65, color: C.ink2, margin: '0 0 14px', paddingLeft: 22, maxWidth: 720 }}>{children}</ul>
);

const LI = ({ children }) => <li style={{ marginBottom: 7 }}>{children}</li>;

// Soft callout card. tone: 'idea' (analogy), 'warn' (trap), 'tip' (practice).
function Callout({ tone = 'idea', title, children }) {
  const tones = {
    idea: { border: `${C.gold}55`, bg: C.goldSoft,  color: C.goldText, Icon: Lightbulb },
    warn: { border: `${C.rust}44`, bg: C.rustSoft,  color: C.rust,     Icon: AlertTriangle },
    tip:  { border: `${C.blue}44`, bg: C.blueSoft,  color: C.blue,     Icon: CheckCircle2 },
  };
  const t = tones[tone] || tones.idea;
  const { Icon } = t;
  return (
    <div style={{ border: `1px solid ${t.border}`, background: t.bg, borderRadius: 14, padding: '16px 20px', margin: '18px 0 20px', maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONTS.display, fontSize: 14.5, fontWeight: 700, color: t.color, marginBottom: 8 }}>
        <Icon size={16} /> {title}
      </div>
      <div style={{ fontFamily: FONTS.body, fontSize: 14.5, lineHeight: 1.65, color: C.ink }}>{children}</div>
    </div>
  );
}

// Tiny worked-example statement. rows: [label, value, {bold, indent, neg, note, rule}]
function MiniStatement({ title, rows }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, margin: '18px 0 20px', maxWidth: 560, overflow: 'hidden' }}>
      <div style={{ padding: '10px 18px', borderBottom: `1px solid ${C.border}`, fontFamily: FONTS.body, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted }}>
        {title}
      </div>
      <div style={{ padding: '8px 0' }}>
        {rows.map(([label, value, opts = {}], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, padding: `5px 18px 5px ${18 + (opts.indent ? 16 : 0)}px`, borderTop: opts.rule ? `1px solid ${C.border}` : 'none', marginTop: opts.rule ? 4 : 0, paddingTop: opts.rule ? 9 : 5 }}>
            <span style={{ fontFamily: FONTS.body, fontSize: 13.5, color: opts.bold ? C.ink : C.ink2, fontWeight: opts.bold ? 700 : 400 }}>
              {label}
              {opts.note && <span style={{ color: C.faint, fontWeight: 400 }}> · {opts.note}</span>}
            </span>
            <span className="ff-num" style={{ fontSize: 13, fontWeight: opts.bold ? 700 : 500, color: opts.neg ? C.rust : (opts.bold ? C.ink : C.ink2), whiteSpace: 'nowrap' }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Per-statement deep dives (rendered inside each statement block) ─────────

function IncomeDeepDive() {
  return (
    <div style={{ marginBottom: 26 }}>
      <H3>Read it top to bottom, like a staircase</H3>
      <P>
        The order of the lines is the whole trick. The statement starts with every dollar you earned, then
        subtracts costs in a deliberate sequence. Each step down tells you something different about the health
        of the business.
      </P>
      <UL>
        <LI><strong>Revenue</strong> is the top line: every dollar from selling, before anything is taken out. The size of the pie before anyone takes a slice.</LI>
        <LI><strong>Cost of goods sold (COGS)</strong> is what it directly costs to deliver each sale. Beans and cups for a café, hosting for an app, materials for a workshop. Subtract it and you get <strong>Gross profit</strong>, your first health check: if this is thin, you can be busy all day and still broke.</LI>
        <LI><strong>Operating expenses</strong> are the costs of simply existing: rent, marketing, salaries, software. They show up even in a month where you sell nothing. What survives them is <strong>Operating income</strong>, proof the core business itself works.</LI>
        <LI><strong>Interest and tax</strong> come last, because they’re about how the business is financed and taxed, not how it runs. What’s left is <strong>Net income</strong>, the famous bottom line. What you actually keep.</LI>
      </UL>

      <P>Here’s the whole staircase with real numbers, for a small bakery in a decent month:</P>
      <MiniStatement
        title="Worked example · Sunny Bakery, one month"
        rows={[
          ['Revenue', '$20,000', { note: 'bread, cakes, coffee' }],
          ['Cost of goods sold', '−$8,000', { note: 'flour, butter, baker hours', neg: true }],
          ['Gross profit', '$12,000', { bold: true, rule: true, note: '60% gross margin' }],
          ['Rent', '−$3,000', { indent: true, neg: true }],
          ['Marketing', '−$1,000', { indent: true, neg: true }],
          ['Admin and insurance', '−$2,000', { indent: true, neg: true }],
          ['Operating income', '$6,000', { bold: true, rule: true }],
          ['Interest on the oven loan', '−$500', { neg: true }],
          ['Taxes (~25%)', '−$1,375', { neg: true }],
          ['Net income', '$4,125', { bold: true, rule: true, note: 'the bottom line' }],
        ]}
      />
      <P>
        Read the staircase and the story writes itself: the bakery keeps <strong>60 cents of every sales
        dollar</strong> after ingredients, the core operation earns a healthy $6,000, and after financing and tax
        the owner truly nets $4,125. Three different “profits,” three different insights.
      </P>

      <Callout tone="warn" title="The #1 trap: profit is an opinion, cash is a fact">
        The Income Statement counts revenue when it’s <em>earned</em>, not when the money arrives. Accountants
        call this <strong>accrual accounting</strong>: recording things when they happen, not when cash moves.
        Sell $10,000 of catering on a 60 day invoice and your statement says “profit!” today, while your bank
        account says nothing for two months. That gap is exactly why the Cash Flow Statement exists.
      </Callout>
    </div>
  );
}

function BalanceDeepDive() {
  return (
    <div style={{ marginBottom: 26 }}>
      <H3>One frozen moment, three ingredients</H3>
      <P>
        Think of your business as a movie. The Income Statement is the plot summary of the whole film. The
        Balance Sheet is a single freeze-frame: hit pause on one exact day and describe everything you see.
        What does this business own, and who has a claim on it?
      </P>
      <UL>
        <LI><strong>Assets</strong> are everything the business owns, listed by how fast each turns into spendable money (that speed is called <strong>liquidity</strong>). <strong>Cash</strong> first, then <strong>accounts receivable</strong> (money customers owe you for work already delivered), then <strong>inventory</strong> (products on the shelf, basically cash wearing a costume), then long term gear like ovens, laptops, and vehicles.</LI>
        <LI><strong>Liabilities</strong> are everything the business owes: unpaid supplier bills (<strong>accounts payable</strong>), loans due within a year, and long term debt like that oven loan.</LI>
        <LI><strong>Equity</strong> is the leftover, assets minus liabilities. It grows when owners put money in, or when the business earns profit and keeps it as <strong>retained earnings</strong>: the running total of every profit ever made, minus anything paid out. Your lifetime scoreboard.</LI>
      </UL>

      <Callout tone="idea" title="The house analogy (this makes it click)">
        You buy a <strong>$400,000 house</strong> with a <strong>$300,000 mortgage</strong> and
        <strong> $100,000</strong> of savings. The house is the <strong>asset</strong>. The mortgage is the
        <strong> liability</strong>. Your <strong>equity</strong> is the $100,000 that’s genuinely yours. Notice
        400 = 300 + 100 isn’t a coincidence: equity is <em>defined</em> as whatever is left after debts. That’s
        why a balance sheet always balances.
      </Callout>

      <P>
        Why care about a snapshot? Because it answers questions the profit report can’t touch: could you survive
        a slow quarter, how much of the business does the bank effectively own, and is your ownership stake
        actually growing year over year.
      </P>
    </div>
  );
}

function CashflowDeepDive() {
  return (
    <div style={{ marginBottom: 26 }}>
      <H3>Three doors money can walk through</H3>
      <P>
        This statement ignores accounting opinions entirely and tracks one thing: real money entering and leaving
        the bank account. Every movement goes through one of three doors, and the <em>door</em> matters as much
        as the amount.
      </P>
      <UL>
        <LI><strong>Operating activities</strong>: cash from actually running the business. Customers paying you, you paying suppliers, staff, and rent. Over time this door <em>must</em> let in more than it lets out, or the business isn’t self-sustaining.</LI>
        <LI><strong>Investing activities</strong>: cash spent on (or received from) long term assets. Buying equipment, upgrading the kitchen, selling the old van. Money out here is often a <em>good</em> sign: you’re investing in growth.</LI>
        <LI><strong>Financing activities</strong>: cash from lenders and investors. Taking a loan, raising investment, repaying debt, paying dividends. This door shows how the business is <em>funded</em>, separate from how it’s performing.</LI>
      </UL>
      <P>
        Add up all three doors and you get the <strong>net change in cash</strong>: did the bank balance go up or
        down this period, and why. The <em>why</em> is the insight. Cash up because customers paid you is health.
        Cash up because you borrowed heavily is a countdown timer.
      </P>

      <H3>The profitable bakery that went broke</H3>
      <P>
        Imagine Sunny Bakery lands a huge catering contract: $30,000 of orders, payable in 90 days. The Income
        Statement looks incredible. Record profit! But the ingredients and the bakers must be paid <em>now</em>,
        while the cash arrives in three months.
      </P>
      <P>
        If there isn’t enough cash in the tank to bridge that gap, the bakery can miss rent while being the most
        profitable it has ever been. This is the trap the Cash Flow Statement catches months in advance. Growth
        <em> consumes</em> cash before it returns cash, so the faster you grow, the more this page matters.
      </P>

      <Callout tone="tip" title="A habit worth stealing">
        Once a month, look at just two numbers: <strong>cash in the bank</strong> and <strong>cash from
        operations</strong>. If cash is falling, dividing it by your monthly burn gives your
        <strong> runway</strong>: how many months until the tank is empty. Knowing your runway turns “sudden”
        crises into problems you saw coming two quarters away.
      </Callout>
    </div>
  );
}

const DEEP_DIVES = { income: IncomeDeepDive, balance: BalanceDeepDive, cashflow: CashflowDeepDive };

function StatementBlock({ s, i }) {
  const Icon = s.icon;
  const DeepDive = DEEP_DIVES[s.key];
  return (
    <div id={s.key} style={{ marginBottom: 56, scrollMarginTop: 80 }}>
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

      {/* The deep dive: plain-English walkthrough with analogies and examples */}
      {DeepDive && <DeepDive />}

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

const MISTAKES = [
  ['Confusing profit with cash', 'The all-time classic. Profit is an accounting opinion; cash is a fact. A “record month” on paper can coexist with a bank account heading for zero. Check both, every time.'],
  ['Celebrating revenue instead of margin', 'Doubling revenue at a 5% gross margin mostly doubles your workload. Growth is only worth having if each sale carries healthy profit inside it.'],
  ['Ignoring receivables', 'If customers owe you more every month, you’re quietly becoming their bank, for free. Rising receivables next to flat cash is a collections problem announcing itself.'],
  ['Letting overhead creep', 'Admin costs rarely shrink on their own. They accrete, one small subscription and “essential” hire at a time. Overhead growth should always lose the race against revenue growth.'],
  ['Judging one number in isolation', 'Net income spiked? Could be a one time gain. Cash jumped? Could be new debt. Every headline number has context living in the other two statements. Read them together, always.'],
];

const CHEATSHEET = [
  ['Income Statement', '“Are we making money?” A period of time. Revenue steps down to net income, and each step (gross profit, operating income) is its own health check.'],
  ['Balance Sheet', '“What do we own vs. owe?” One frozen moment. Assets = liabilities + equity, always, like the house and its mortgage.'],
  ['Cash Flow Statement', '“Will we run out of cash?” Real money through three doors: operations, investing, financing. Profit is an opinion. Cash is a fact.'],
  ['They’re wired together', 'Profit flows into equity and cash, and the change in cash closes the loop back on the balance sheet.'],
  ['Watch four numbers', 'Gross margin, operating margin, net margin, and runway. Compare against your industry, not a universal ideal.'],
];

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
            The complete plain-English guide: what each statement really tells you, how to read it line by line,
            the traps to watch for, and the numbers that matter. Press play, watch it happen. Built for founders,
            students, and anyone teaching them.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 26 }}>
            {STATEMENTS.map((s) => (
              <a key={s.key} href={`#${s.key}`} style={{ fontFamily: FONTS.body, fontSize: 13.5, fontWeight: 600, color: C.surface, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 10, padding: '9px 14px', textDecoration: 'none' }}>{s.question}</a>
            ))}
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 12.5, color: 'rgba(255,255,255,0.45)', marginTop: 16 }}>
            ≈ 12 minute read · Every term defined in plain English · No accounting degree required
          </div>
        </Wrap>
      </div>

      {/* Why this matters: the hook */}
      <Wrap style={{ padding: '48px 24px 8px' }}>
        <div style={{ marginBottom: 44, maxWidth: 720 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FONTS.body, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.goldText, marginBottom: 10 }}>
            <BookOpen size={14} /> Start here
          </div>
          <h2 style={{ fontFamily: FONTS.display, fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: C.ink, margin: '0 0 14px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Why learn this at all?
          </h2>
          <P>
            Here’s an uncomfortable truth: <strong>most businesses don’t fail because the idea was bad.</strong> They
            fail because the owner couldn’t see trouble coming. The customers were there, the product worked, but
            the money side was a fog, and by the time the problem was obvious it was too late to fix.
          </P>
          <P>
            Financial statements are how you clear that fog. Think of them as the <strong>dashboard of your
            business</strong>: one gauge for speed, one for fuel, one for engine temperature. You don’t need to be
            a mechanic to drive a car, and you don’t need to be an accountant to read these three reports.
          </P>
          <P style={{ marginBottom: 0 }}>
            Each report answers one question the others physically can’t. A business can be profitable but out of
            cash. It can be rich in assets but losing money every month. Only all three together show the whole
            animal. Let’s take them one at a time.
          </P>
        </div>

        {/* Statement blocks */}
        {STATEMENTS.map((s, i) => <StatementBlock key={s.key} s={s} i={i} />)}
      </Wrap>

      {/* How they connect */}
      <Wrap style={{ padding: '8px 24px 44px' }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '28px 26px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FONTS.body, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.goldText, marginBottom: 8 }}>
            <Link2 size={14} /> The plumbing
          </div>
          <h2 style={{ fontFamily: FONTS.display, fontSize: 'clamp(22px, 3.5vw, 28px)', fontWeight: 800, color: C.ink, margin: '0 0 12px', letterSpacing: '-0.02em' }}>The three are one story</h2>
          <P>
            Here’s the part most guides skip, and it’s where finance goes from three separate reports to one
            elegant machine: <strong>the statements are plumbed into each other.</strong> Specific numbers flow
            from one to the next, always in the same pattern:
          </P>
          <ol style={{ fontFamily: FONTS.body, fontSize: 15, lineHeight: 1.65, color: C.ink2, margin: '0 0 14px', paddingLeft: 22, maxWidth: 720 }}>
            <LI><strong>Net income flows to the Balance Sheet.</strong> The profit at the bottom of the Income Statement gets added to retained earnings in equity. Profit literally becomes ownership value.</LI>
            <LI><strong>Net income also starts the Cash Flow Statement.</strong> Operating cash flow begins with profit, then adjusts for everything that affected profit without moving cash, and for cash that moved without touching profit.</LI>
            <LI><strong>The net change in cash lands back on the Balance Sheet.</strong> The last line of the Cash Flow Statement is exactly the change in the cash line between one balance sheet and the next. The loop closes.</LI>
          </ol>
          <P style={{ marginBottom: 0 }}>
            This is why analysts call it a <strong>three-statement model</strong>: change one assumption, say
            revenue grows 20% instead of 10%, and the effect ripples through profit, into equity, and through
            cash, automatically and consistently. Three gauges wired to one engine. That’s exactly what the
            builder does for you.
          </P>
        </div>
      </Wrap>

      {/* Classic mistakes */}
      <Wrap style={{ padding: '8px 24px 44px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FONTS.body, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.rust, marginBottom: 8 }}>
          <AlertTriangle size={14} /> Skip the tuition fees
        </div>
        <h2 style={{ fontFamily: FONTS.display, fontSize: 'clamp(22px, 3.5vw, 28px)', fontWeight: 800, color: C.ink, margin: '0 0 12px', letterSpacing: '-0.02em' }}>Five classic mistakes</h2>
        <P>
          Reading statements is a skill, and beginners trip over the same five stones. Learn them here instead of
          the hard way:
        </P>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {MISTAKES.map(([title, body], i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                <span className="ff-num" style={{ fontSize: 13, fontWeight: 700, color: C.rust }}>{i + 1}</span>
                <span style={{ fontFamily: FONTS.display, fontSize: 15.5, fontWeight: 700, color: C.ink }}>{title}</span>
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 14, lineHeight: 1.6, color: C.ink2 }}>{body}</div>
            </div>
          ))}
        </div>
      </Wrap>

      {/* Cheat sheet */}
      <Wrap style={{ padding: '8px 24px 44px' }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '28px 26px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FONTS.body, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.goldText, marginBottom: 8 }}>
            <Gauge size={14} /> Keep this
          </div>
          <h2 style={{ fontFamily: FONTS.display, fontSize: 'clamp(22px, 3.5vw, 28px)', fontWeight: 800, color: C.ink, margin: '0 0 12px', letterSpacing: '-0.02em' }}>The 60 second cheat sheet</h2>
          <P>You now know more about financial statements than most first-time founders. The whole page, compressed for keeps:</P>
          {CHEATSHEET.map(([term, body], i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < CHEATSHEET.length - 1 ? 12 : 0, maxWidth: 720 }}>
              <CheckCircle2 size={17} color={C.green} style={{ flexShrink: 0, marginTop: 3 }} />
              <div style={{ fontFamily: FONTS.body, fontSize: 14.5, lineHeight: 1.6, color: C.ink2 }}>
                <strong style={{ color: C.ink }}>{term}.</strong> {body}
              </div>
            </div>
          ))}
        </div>
      </Wrap>

      {/* CTA */}
      <Wrap style={{ padding: '8px 24px 72px' }}>
        <div style={{ background: C.gold, borderRadius: 18, padding: '32px 26px', textAlign: 'center' }}>
          <div style={{ fontFamily: FONTS.display, fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>The best way to get it? Build one.</div>
          <p style={{ fontFamily: FONTS.body, fontSize: 15.5, color: 'rgba(15,23,42,0.72)', maxWidth: 460, margin: '10px auto 20px' }}>
            Nothing cements this faster than watching your own assumptions turn into linked statements, then
            nudging one number and seeing the ripple. It clicks fast.
          </p>
          <Link to="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: FONTS.body, fontSize: 15, fontWeight: 700, color: C.surface, background: C.ink, textDecoration: 'none', padding: '13px 26px', borderRadius: 12 }}>
            Open the model builder <ArrowRight size={17} />
          </Link>
        </div>
      </Wrap>
    </div>
  );
}
