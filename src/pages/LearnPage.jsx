import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Scale, Droplets, AlertTriangle, Lightbulb,
  CheckCircle2, ArrowRight, BookOpen, Gauge,
} from 'lucide-react';
import { C, FONTS } from '../brand/theme';
import { Logo } from '../brand/Logo';

// /learn — the long-form educational guide to the three financial statements.
// This is the deep-dive layer of the education stack: StatementsPrimer (30-sec
// concepts) → HelpTooltip (per-line "?") → this page (the full story). Eagerly
// imported and listed in scripts/prerender.js so it ships as static HTML for
// SEO, like /privacy and /terms. Main-bundle deps only — keep it that way.

const S = {
  page:   { minHeight: '100vh', background: C.bg, fontFamily: FONTS.body, color: C.ink },
  nav:    { background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 },
  wrap:   { maxWidth: 780, margin: '0 auto', padding: '52px 24px 96px' },
  badge:  { display: 'inline-block', background: C.goldSoft, color: C.goldText, border: '1px solid rgba(16,185,129,0.2)', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600, marginBottom: 24 },
  h1:     { fontFamily: FONTS.display, fontSize: 'clamp(30px, 6vw, 40px)', fontWeight: 800, color: C.ink, marginBottom: 14, letterSpacing: '-0.025em', lineHeight: 1.12 },
  lede:   { fontSize: 17, lineHeight: 1.7, color: C.ink2, marginBottom: 10 },
  meta:   { fontSize: 13.5, color: C.muted, marginBottom: 40 },
  h2:     { fontFamily: FONTS.display, fontSize: 24, fontWeight: 700, color: C.ink, margin: '52px 0 14px', letterSpacing: '-0.015em', lineHeight: 1.25, scrollMarginTop: 80 },
  h3:     { fontFamily: FONTS.display, fontSize: 17.5, fontWeight: 700, color: C.ink, margin: '30px 0 8px', letterSpacing: '-0.01em', scrollMarginTop: 80 },
  p:      { fontSize: 15, lineHeight: 1.75, color: C.ink2, marginBottom: 14 },
  ul:     { fontSize: 15, lineHeight: 1.75, color: C.ink2, paddingLeft: 24, marginBottom: 14 },
  ol:     { fontSize: 15, lineHeight: 1.75, color: C.ink2, paddingLeft: 24, marginBottom: 14 },
  li:     { marginBottom: 6 },
  hr:     { border: 'none', borderTop: `1px solid ${C.border}`, margin: '44px 0' },
};

// Big-question chip shown at the top of each statement section.
function QuestionBadge({ children }) {
  return (
    <div style={{ display: 'inline-block', fontSize: 12.5, fontWeight: 600, color: C.goldText, background: C.goldSoft, borderRadius: 999, padding: '5px 13px', marginBottom: 4 }}>
      {children}
    </div>
  );
}

// Soft callout card. tone: 'idea' (analogy / mental model), 'warn' (pitfall),
// 'tip' (practical pointer back into the product).
function Callout({ tone = 'idea', title, children }) {
  const tones = {
    idea: { border: 'rgba(16,185,129,0.35)', bg: 'rgba(16,185,129,0.06)', color: C.goldText, Icon: Lightbulb },
    warn: { border: 'rgba(220,38,38,0.3)',  bg: C.rustSoft,               color: C.rust,     Icon: AlertTriangle },
    tip:  { border: 'rgba(37,99,235,0.3)',  bg: C.blueSoft,               color: C.blue,     Icon: CheckCircle2 },
  };
  const t = tones[tone] || tones.idea;
  const { Icon } = t;
  return (
    <div style={{ border: `1px solid ${t.border}`, background: t.bg, borderRadius: 12, padding: '16px 18px', margin: '18px 0 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.color, marginBottom: 8 }}>
        <Icon size={14} /> {title}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: C.ink2 }}>{children}</div>
    </div>
  );
}

// The three-statements overview card used in "The Big Picture".
function StatementCard({ Icon, question, name, blurb }) {
  return (
    <div style={{ flex: '1 1 200px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '20px 18px' }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: C.goldSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.goldText, marginBottom: 12 }}>
        <Icon size={17} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.goldText, marginBottom: 5 }}>{question}</div>
      <div style={{ fontFamily: FONTS.display, fontSize: 16.5, fontWeight: 700, color: C.ink, marginBottom: 7 }}>{name}</div>
      <div style={{ fontSize: 13.5, lineHeight: 1.65, color: C.ink2 }}>{blurb}</div>
    </div>
  );
}

// A tiny worked-example statement. rows: [label, value, {bold, indent, note}]
function MiniStatement({ title, rows }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, margin: '18px 0 22px', overflow: 'hidden' }}>
      <div style={{ padding: '10px 18px', borderBottom: `1px solid ${C.border}`, fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.muted }}>
        {title}
      </div>
      <div style={{ padding: '8px 0' }}>
        {rows.map(([label, value, opts = {}], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, padding: `5px 18px 5px ${18 + (opts.indent ? 16 : 0)}px`, borderTop: opts.rule ? `1px solid ${C.border}` : 'none', marginTop: opts.rule ? 4 : 0, paddingTop: opts.rule ? 9 : 5 }}>
            <span style={{ fontSize: 13.5, color: opts.bold ? C.ink : C.ink2, fontWeight: opts.bold ? 700 : 400 }}>
              {label}
              {opts.note && <span style={{ color: C.faint, fontWeight: 400 }}> — {opts.note}</span>}
            </span>
            <span style={{ fontFamily: FONTS.num, fontSize: 13, fontWeight: opts.bold ? 700 : 400, color: opts.neg ? C.rust : (opts.bold ? C.ink : C.ink2), whiteSpace: 'nowrap' }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const TOC = [
  ['#big-picture',     'The big picture: three statements, three questions'],
  ['#income-statement','The Income Statement — are you making money?'],
  ['#balance-sheet',   'The Balance Sheet — what do you own vs. owe?'],
  ['#cash-flow',       'The Cash Flow Statement — will you run out of cash?'],
  ['#linked',          'How the three statements work as a team'],
  ['#ratios',          'The numbers worth watching'],
  ['#mistakes',        'Five classic mistakes (and how to dodge them)'],
  ['#takeaway',        'Your takeaway: a 60-second cheat sheet'],
];

export default function LearnPage() {
  return (
    <div className="koala-page" style={S.page}>
      <nav style={S.nav}>
        <Link to="/" style={{ textDecoration: 'none' }}><Logo size={26} /></Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Link to="/" className="hidden sm:inline" style={{ fontFamily: FONTS.body, fontSize: 13, color: C.muted, textDecoration: 'none' }}>← Back to home</Link>
          <Link to="/app" style={{ fontFamily: FONTS.body, fontSize: 13, fontWeight: 600, color: C.ink, background: C.gold, borderRadius: 999, padding: '7px 16px', textDecoration: 'none' }}>Open the builder</Link>
        </div>
      </nav>

      <main style={S.wrap}>
        <div style={S.badge}>Learn · Plain-English finance</div>
        <h1 style={S.h1}>Financial statements, finally explained like a human</h1>
        <p style={S.lede}>
          The complete founder&rsquo;s guide to the Income Statement, Balance Sheet, and Cash Flow
          Statement — what they are, why they matter, and how to read them without an accounting degree.
        </p>
        <p style={S.meta}>≈ 15 minute read · No jargon left undefined · Free forever, like the app</p>

        {/* ---------- INTRO ---------- */}
        <p style={S.p}>
          Here&rsquo;s an uncomfortable truth: <strong>most businesses don&rsquo;t fail because the idea was bad.</strong> They
          fail because the owner couldn&rsquo;t see trouble coming. The customers were there, the product worked — but the
          money side was a fog, and by the time the problem was obvious, it was too late to fix.
        </p>
        <p style={S.p}>
          Financial statements are how you clear that fog. Think of them as the <strong>dashboard of your business</strong>:
          one gauge for speed, one for fuel, one for engine temperature. You don&rsquo;t need to be a mechanic to drive a
          car — and you don&rsquo;t need to be an accountant to read these three reports.
        </p>
        <p style={S.p}>
          This guide walks through all three statements from zero. By the end, you&rsquo;ll be able to look at any set of
          numbers — yours or anyone else&rsquo;s — and answer the three questions every investor, lender, and smart founder
          asks. Let&rsquo;s go.
        </p>

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 22px', margin: '26px 0 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.muted, marginBottom: 10 }}>
            <BookOpen size={14} /> What&rsquo;s inside
          </div>
          <ol style={{ ...S.ol, marginBottom: 2, fontSize: 14 }}>
            {TOC.map(([href, label]) => (
              <li key={href} style={{ marginBottom: 4 }}>
                <a href={href} style={{ color: C.goldText, textDecoration: 'none' }}>{label}</a>
              </li>
            ))}
          </ol>
        </div>

        {/* ---------- BIG PICTURE ---------- */}
        <h2 id="big-picture" style={S.h2}>The big picture: three statements, three questions</h2>
        <p style={S.p}>
          Every financial statement ever produced — from a corner bakery to Apple — boils down to answering one of
          three questions. That&rsquo;s it. Three reports, three questions, one business.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, margin: '20px 0 22px' }}>
          <StatementCard Icon={TrendingUp} question="Are you making money?" name="Income Statement"
            blurb="A recap of everything you earned and spent over a period, ending in profit or loss. The scoreboard." />
          <StatementCard Icon={Scale} question="What do you own vs. owe?" name="Balance Sheet"
            blurb="A snapshot, frozen on one day, of everything the business owns and owes. The X-ray." />
          <StatementCard Icon={Droplets} question="Will you run out of cash?" name="Cash Flow Statement"
            blurb="A trace of real money moving in and out of the bank. The early-warning system." />
        </div>

        <p style={S.p}>
          Why three separate reports instead of one? Because each answers a question the others physically cannot.
          A business can be profitable but out of cash. It can be rich in assets but losing money every month. Only
          when you look at all three together do you see the whole animal.
        </p>

        <Callout tone="idea" title="A mental model to keep">
          Think of your business as a movie. The <strong>Income Statement</strong> is the plot summary — what happened
          over the whole film. The <strong>Balance Sheet</strong> is a single freeze-frame — pause the movie, describe
          exactly what you see. The <strong>Cash Flow Statement</strong> follows one character the entire time: cash,
          the only character who can end the movie early.
        </Callout>

        {/* ---------- INCOME STATEMENT ---------- */}
        <h2 id="income-statement" style={S.h2}>The Income Statement — are you actually making money?</h2>
        <QuestionBadge>Question #1 · Are you making money?</QuestionBadge>
        <p style={S.p}>
          The Income Statement (also called the <strong>Profit &amp; Loss</strong>, or <strong>P&amp;L</strong> — same
          thing, different name) covers a <em>period</em> of time: a month, a quarter, a year. It starts with every
          dollar you earned, subtracts every cost in a deliberate order, and ends at the famous
          <strong> bottom line</strong>.
        </p>
        <p style={S.p}>
          The order of subtraction is the whole trick. The statement is built like a staircase, and each step down
          tells you something different about the health of the business.
        </p>

        <h3 style={S.h3}>Step 1: Revenue — the top line</h3>
        <p style={S.p}>
          <strong>Revenue</strong> is every dollar that comes in from selling your product or service, before anything
          is subtracted. It&rsquo;s the size of the pie before anyone takes a slice. Growing revenue means the market
          wants what you sell — but on its own, it says nothing about whether you keep any of it.
        </p>

        <h3 style={S.h3}>Step 2: Cost of goods sold — what it costs to deliver</h3>
        <p style={S.p}>
          <strong>Cost of Goods Sold (COGS)</strong> — sometimes called <strong>Cost of Revenue</strong> — is what it
          directly costs to deliver what you sell. Not rent, not marketing: only the costs that scale with each sale.
        </p>
        <ul style={S.ul}>
          <li style={S.li}><strong>A café:</strong> coffee beans, milk, cups, the barista&rsquo;s hours.</li>
          <li style={S.li}><strong>A software app:</strong> server hosting, payment processing fees.</li>
          <li style={S.li}><strong>A furniture maker:</strong> wood, hardware, the carpenter&rsquo;s wages.</li>
        </ul>
        <p style={S.p}>
          Subtract COGS from revenue and you get <strong>Gross Profit</strong> — what&rsquo;s left in your pocket from
          selling, before running the business itself. This is the first big health check: if gross profit is thin,
          every sale barely covers itself, and you can be busy all day and still broke.
        </p>

        <h3 style={S.h3}>Step 3: Operating expenses — the cost of existing</h3>
        <p style={S.p}>
          <strong>Operating Expenses (OpEx)</strong> are the costs of running the business that don&rsquo;t attach to any
          single sale. They&rsquo;d show up even in a month where you sold nothing. The classic buckets:
        </p>
        <ul style={S.ul}>
          <li style={S.li}><strong>Sales &amp; Marketing</strong> — ads, promotions, commissions. Your growth engine.</li>
          <li style={S.li}><strong>General &amp; Administrative (G&amp;A)</strong> — rent, insurance, accounting, admin. The &ldquo;keeping the lights on&rdquo; bucket, and the one that creeps up quietly.</li>
          <li style={S.li}><strong>Research &amp; Development (R&amp;D)</strong> — building and improving the product. An investment in the future, not a cost to slash on sight.</li>
        </ul>
        <p style={S.p}>
          Gross profit minus operating expenses gives you <strong>Operating Income</strong>, also called
          <strong> EBIT</strong> (Earnings Before Interest and Taxes — literally just profit before loan interest and
          tax are counted). This is the purest read on whether your <em>actual business</em> works, separate from how
          you financed it. It&rsquo;s the number a lender studies first.
        </p>

        <h3 style={S.h3}>Step 4: Interest, taxes… and the bottom line</h3>
        <p style={S.p}>
          Below operating income come the costs that aren&rsquo;t really about the business itself:
          <strong> interest</strong> on any loans, and <strong>taxes</strong> on the profit. Subtract those and you
          arrive at <strong>Net Income</strong> — the true bottom line. Everything earned, minus every single cost.
          What you actually keep.
        </p>

        <MiniStatement
          title="Worked example · Sunny Bakery, one month"
          rows={[
            ['Revenue', '$20,000', { note: 'bread, cakes, coffee' }],
            ['Cost of goods sold', '−$8,000', { note: 'flour, butter, baker hours', neg: true }],
            ['Gross Profit', '$12,000', { bold: true, rule: true, note: '60% gross margin' }],
            ['Rent', '−$3,000', { indent: true, neg: true }],
            ['Marketing', '−$1,000', { indent: true, neg: true }],
            ['Admin & insurance', '−$2,000', { indent: true, neg: true }],
            ['Operating Income (EBIT)', '$6,000', { bold: true, rule: true }],
            ['Interest on the oven loan', '−$500', { neg: true }],
            ['Taxes (~25%)', '−$1,375', { neg: true }],
            ['Net Income', '$4,125', { bold: true, rule: true, note: 'the bottom line' }],
          ]}
        />

        <p style={S.p}>
          Read the staircase and the story writes itself: the bakery keeps <strong>60 cents of every sales dollar</strong> after
          ingredients, the core operation earns a healthy $6,000, and after financing and tax the owner truly nets
          $4,125. Three different &ldquo;profits,&rdquo; three different insights.
        </p>

        <Callout tone="warn" title="The #1 trap: profit is an opinion, cash is a fact">
          The Income Statement counts revenue when it&rsquo;s <em>earned</em>, not when the money arrives (accountants
          call this <strong>accrual accounting</strong> — recording things when they happen, not when cash moves). Sell
          $10,000 of catering on a 60-day invoice and your P&amp;L says &ldquo;profit!&rdquo; today, while your bank
          account says nothing for two months. This single gap is why the Cash Flow Statement exists.
        </Callout>

        {/* ---------- BALANCE SHEET ---------- */}
        <h2 id="balance-sheet" style={S.h2}>The Balance Sheet — what do you own vs. owe?</h2>
        <QuestionBadge>Question #2 · What do you own vs. owe?</QuestionBadge>
        <p style={S.p}>
          The Balance Sheet is the freeze-frame. While the Income Statement covers a stretch of time, the Balance
          Sheet describes <strong>one exact moment</strong> — usually the last day of a month, quarter, or year. Pause
          the movie: what does this business own, and who has a claim on it?
        </p>
        <p style={S.p}>It has exactly three parts, held together by one unbreakable equation:</p>

        <div style={{ background: C.ink, borderRadius: 14, padding: '22px 24px', margin: '18px 0 22px', textAlign: 'center' }}>
          <div style={{ fontFamily: FONTS.display, fontSize: 'clamp(16px, 3.4vw, 21px)', fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.01em' }}>
            Assets&nbsp;&nbsp;=&nbsp;&nbsp;Liabilities&nbsp;&nbsp;+&nbsp;&nbsp;Equity
          </div>
          <div style={{ fontSize: 13, color: 'rgba(248,250,252,0.55)', marginTop: 8 }}>
            What you own = what you owe + what&rsquo;s truly yours
          </div>
        </div>

        <Callout tone="idea" title="The house analogy (this makes it click)">
          You buy a <strong>$400,000 house</strong> with a <strong>$300,000 mortgage</strong> and
          <strong> $100,000</strong> of your own savings. The house is the <strong>asset</strong> ($400k). The mortgage
          is the <strong>liability</strong> ($300k). Your <strong>equity</strong> — the part that&rsquo;s genuinely
          yours — is $100k. Notice it&rsquo;s not a coincidence that 400 = 300 + 100. Equity is <em>defined</em> as
          whatever is left after debts. That&rsquo;s why a balance sheet always balances.
        </Callout>

        <h3 style={S.h3}>Assets: everything the business owns</h3>
        <p style={S.p}>
          Assets are listed in order of how fast they turn into cash (accountants call this <strong>liquidity</strong> —
          simply, how quickly something can become spendable money):
        </p>
        <ul style={S.ul}>
          <li style={S.li}><strong>Cash</strong> — money in the bank. The most honest number in your entire business.</li>
          <li style={S.li}><strong>Accounts Receivable</strong> — money customers owe you for work already delivered. Invoices sent, payment pending.</li>
          <li style={S.li}><strong>Inventory</strong> — products bought or made but not yet sold. Cash wearing a costume, sitting on a shelf.</li>
          <li style={S.li}><strong>Property, Plant &amp; Equipment (PP&amp;E)</strong> — the long-term physical stuff: ovens, laptops, vehicles, machinery.</li>
        </ul>

        <h3 style={S.h3}>Liabilities: everything the business owes</h3>
        <ul style={S.ul}>
          <li style={S.li}><strong>Accounts Payable</strong> — bills from suppliers you haven&rsquo;t paid yet. (The mirror image of receivables.)</li>
          <li style={S.li}><strong>Short-term debt</strong> — loans due within a year. This needs real cash soon.</li>
          <li style={S.li}><strong>Long-term debt</strong> — loans that run for years, like that oven loan or an SBA loan.</li>
        </ul>

        <h3 style={S.h3}>Equity: the part that&rsquo;s truly yours</h3>
        <p style={S.p}>
          Equity is the leftover — assets minus liabilities. It grows two ways: owners put money in
          (<strong>paid-in capital</strong>), or the business earns profit and keeps it
          (<strong>retained earnings</strong> — the running total of every profit ever made, minus anything paid out
          to owners). Retained earnings is the business&rsquo;s lifetime scoreboard.
        </p>
        <p style={S.p}>
          Why should you care about this report? Because it answers questions the P&amp;L can&rsquo;t touch:
        </p>
        <ul style={S.ul}>
          <li style={S.li}>Could you survive a slow quarter? (How much cash is on hand?)</li>
          <li style={S.li}>How much of the business does the bank effectively own? (Debt vs. equity.)</li>
          <li style={S.li}>Is your wealth actually growing? (Is equity rising year over year?)</li>
        </ul>

        {/* ---------- CASH FLOW ---------- */}
        <h2 id="cash-flow" style={S.h2}>The Cash Flow Statement — will you run out of cash?</h2>
        <QuestionBadge>Question #3 · Will you run out of cash?</QuestionBadge>
        <p style={S.p}>
          Here&rsquo;s the statement that saves businesses. Studies of small-business failures keep finding the same
          culprit — not lack of profit, but <strong>running out of cash</strong>. The Cash Flow Statement ignores
          accounting opinions entirely and tracks one thing: real money entering and leaving your bank account.
        </p>
        <p style={S.p}>
          It splits every cash movement into three buckets — think of them as
          <strong> three doors money can walk through</strong>:
        </p>

        <ol style={S.ol}>
          <li style={S.li}>
            <strong>Operating activities</strong> — cash from actually running the business: customers paying you,
            you paying suppliers, staff, and rent. Over time, this door <em>must</em> let in more than it lets out, or
            the business isn&rsquo;t self-sustaining.
          </li>
          <li style={S.li}>
            <strong>Investing activities</strong> — cash spent on (or received from) long-term assets: buying
            equipment, upgrading the kitchen, selling an old van. Money out here is often a <em>good</em> sign — it
            means you&rsquo;re investing in growth.
          </li>
          <li style={S.li}>
            <strong>Financing activities</strong> — cash from lenders and investors: taking a loan, raising
            investment, repaying debt, paying dividends. This door shows how the business is <em>funded</em>, separate
            from how it&rsquo;s performing.
          </li>
        </ol>

        <p style={S.p}>
          Add up all three doors and you get the <strong>Net Change in Cash</strong> — literally, &ldquo;did the bank
          balance go up or down this period, and why?&rdquo; The <em>why</em> is the insight. Cash up because customers
          paid you is health; cash up because you borrowed heavily is a countdown timer.
        </p>

        <h3 style={S.h3}>The profitable business that went broke</h3>
        <p style={S.p}>
          Imagine Sunny Bakery lands a huge corporate catering contract: $30,000 of orders, payable in 90 days. The
          Income Statement looks incredible — record profit! But the bakery must buy ingredients and pay bakers
          <em> now</em>, while the cash arrives in three months.
        </p>
        <p style={S.p}>
          If there isn&rsquo;t enough cash in the tank to bridge that gap, the bakery can miss rent — while technically
          being the most profitable it&rsquo;s ever been. This is the trap the Cash Flow Statement is built to catch,
          months before it happens. Growth <em>consumes</em> cash before it returns cash; the faster you grow, the
          more this statement matters.
        </p>

        <h3 style={S.h3}>Free Cash Flow: the investor&rsquo;s favorite number</h3>
        <p style={S.p}>
          One derived number deserves a mention: <strong>Free Cash Flow (FCF)</strong> — operating cash flow minus the
          equipment spending needed to keep the business running (<strong>CapEx</strong>, short for capital
          expenditures). It&rsquo;s the cash that&rsquo;s truly <em>free</em>: to reinvest, pay down debt, or pay
          yourself. Investors trust it because it&rsquo;s the hardest number to dress up.
        </p>

        <Callout tone="tip" title="A habit worth stealing">
          Once a month, look at just two numbers: <strong>cash in the bank</strong> and <strong>operating cash
          flow</strong>. If cash is falling, your monthly burn tells you your <strong>runway</strong> — how many months
          until the tank hits empty. Knowing your runway turns &ldquo;sudden&rdquo; crises into problems you saw coming
          two quarters away.
        </Callout>

        {/* ---------- LINKED ---------- */}
        <h2 id="linked" style={S.h2}>How the three statements work as a team</h2>
        <p style={S.p}>
          Here&rsquo;s the part most guides skip, and it&rsquo;s where finance goes from three separate reports to one
          elegant machine: <strong>the statements are plumbed into each other.</strong> Specific numbers flow from one
          to the next, always in the same pattern:
        </p>
        <ol style={S.ol}>
          <li style={S.li}>
            <strong>Net Income flows to the Balance Sheet.</strong> The profit at the bottom of the Income Statement
            gets added to <strong>retained earnings</strong> in equity. Profit literally becomes ownership value.
          </li>
          <li style={S.li}>
            <strong>Net Income also starts the Cash Flow Statement.</strong> Operating cash flow begins with net
            income, then adjusts for everything that affected profit without moving cash (like depreciation), and for
            cash that moved without touching profit (like customers paying old invoices).
          </li>
          <li style={S.li}>
            <strong>The Net Change in Cash lands back on the Balance Sheet.</strong> The final line of the Cash Flow
            Statement is exactly the change in the <strong>cash</strong> line between last period&rsquo;s balance sheet
            and this one. The loop closes.
          </li>
        </ol>
        <p style={S.p}>
          This is why analysts call it a <strong>three-statement model</strong>: change one assumption — say, revenue
          grows 20% instead of 10% — and the effect ripples through profit, into equity, and through cash,
          automatically and consistently. It&rsquo;s three gauges wired to one engine.
        </p>
        <Callout tone="tip" title="This is exactly what Koala automates">
          In the builder, the plumbing is pre-wired: edit any line and net income, retained earnings, and cash all
          update together, with the balance sheet kept in balance. And whenever you forget what a line means, hover
          the <strong>ⓘ</strong> next to it — every single row has a plain-English explainer.
        </Callout>

        {/* ---------- RATIOS ---------- */}
        <h2 id="ratios" style={S.h2}>The numbers worth watching</h2>
        <p style={S.p}>
          Raw dollars don&rsquo;t travel well — $50,000 of profit is spectacular for a food truck and alarming for an
          airline. <strong>Ratios</strong> turn dollars into percentages so you can compare against your industry, your
          competitors, and your own past self. Four earn a permanent spot on your dashboard:
        </p>
        <ul style={S.ul}>
          <li style={S.li}>
            <strong>Gross Margin</strong> = Gross Profit ÷ Revenue. How many cents of each sales dollar survive the
            direct cost of delivering it. This is the <em>ceiling</em> on your profitability — everything else gets
            paid out of what&rsquo;s left.
          </li>
          <li style={S.li}>
            <strong>Operating Margin</strong> = Operating Income ÷ Revenue. What the core business keeps per dollar,
            before financing and tax. The cleanest &ldquo;is this business fundamentally working?&rdquo; signal.
          </li>
          <li style={S.li}>
            <strong>Net Margin</strong> = Net Income ÷ Revenue. What you truly keep after every last cost. Watch the
            <em> trend</em>: is growth making the business healthier, or just bigger?
          </li>
          <li style={S.li}>
            <strong>Runway</strong> = Cash ÷ monthly burn. If you spend more than you earn, this is how many months you
            have to fix it. The single most important number for any early-stage business.
          </li>
        </ul>
        <p style={S.p}>
          What counts as a &ldquo;good&rdquo; margin varies wildly by industry — software gross margins run 70–90%,
          grocery stores live happily below 30%. That&rsquo;s why comparing against <em>your sector</em> matters more
          than any universal rule of thumb (Koala benchmarks your margins against your industry automatically).
        </p>

        {/* ---------- MISTAKES ---------- */}
        <h2 id="mistakes" style={S.h2}>Five classic mistakes (and how to dodge them)</h2>
        <p style={S.p}>
          Reading statements is a skill, and beginners tend to trip over the same five stones. Learn them here, skip
          the tuition fees:
        </p>
        <ol style={S.ol}>
          <li style={S.li}>
            <strong>Confusing profit with cash.</strong> The all-time classic. Profit is an accounting opinion; cash is
            a fact. Check both, every time — a &ldquo;record month&rdquo; on paper can coexist with a bank account
            heading for zero.
          </li>
          <li style={S.li}>
            <strong>Celebrating revenue instead of margin.</strong> Doubling revenue at a 5% gross margin mostly
            doubles your workload. Growth is only worth having if each sale carries healthy profit inside it.
          </li>
          <li style={S.li}>
            <strong>Ignoring receivables.</strong> If customers owe you more every month, you&rsquo;re quietly becoming
            their bank — for free. Rising receivables alongside flat cash is a collections problem announcing itself.
          </li>
          <li style={S.li}>
            <strong>Letting overhead creep.</strong> G&amp;A costs rarely shrink on their own; they accrete, one small
            subscription and &ldquo;essential&rdquo; hire at a time. Compare overhead growth to revenue growth every
            quarter — overhead should lose that race.
          </li>
          <li style={S.li}>
            <strong>Judging one number in isolation.</strong> Net income spiked? Could be a one-off gain. Cash jumped?
            Could be new debt. Every headline number has context living in the other two statements — read them
            together, always.
          </li>
        </ol>

        {/* ---------- TAKEAWAY ---------- */}
        <h2 id="takeaway" style={S.h2}>Your takeaway: a 60-second cheat sheet</h2>
        <p style={S.p}>
          You now know more about financial statements than most first-time founders. Here&rsquo;s the whole guide,
          compressed for keeps:
        </p>
        <ul style={S.ul}>
          <li style={S.li}><strong>Income Statement</strong> → &ldquo;Are we making money?&rdquo; A period of time. Revenue steps down to net income; each step (gross profit, operating income) is its own health check.</li>
          <li style={S.li}><strong>Balance Sheet</strong> → &ldquo;What do we own vs. owe?&rdquo; One frozen moment. Assets = Liabilities + Equity, always, like the house and its mortgage.</li>
          <li style={S.li}><strong>Cash Flow Statement</strong> → &ldquo;Will we run out of cash?&rdquo; Real money through three doors: operations, investing, financing. Profit is an opinion; cash is a fact.</li>
          <li style={S.li}><strong>They&rsquo;re wired together</strong> — profit flows into equity and cash, and the change in cash closes the loop back on the balance sheet.</li>
          <li style={S.li}><strong>Watch four numbers</strong>: gross margin, operating margin, net margin, and runway — against your industry, not a universal ideal.</li>
        </ul>
        <p style={S.p}>
          And your action item is simple: <strong>don&rsquo;t just read about statements — build a set.</strong> Nothing
          cements this faster than watching your own assumptions turn into linked statements, then nudging one number
          and seeing the ripple. That&rsquo;s the moment it stops being accounting and starts being your business.
        </p>

        <div style={{ background: C.ink, borderRadius: 16, padding: '30px 28px', marginTop: 30, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.gold, marginBottom: 12 }}>
            <Gauge size={14} /> Put it into practice
          </div>
          <div style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 700, color: '#F8FAFC', marginBottom: 8, letterSpacing: '-0.015em' }}>
            Build your first three-statement model
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.65, color: 'rgba(248,250,252,0.6)', maxWidth: 440, margin: '0 auto 20px' }}>
            Answer a few questions about your business and Koala drafts all three linked statements for you — free,
            no spreadsheet, no credit card.
          </div>
          <Link to="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: C.ink, background: C.gold, borderRadius: 999, padding: '11px 24px', textDecoration: 'none' }}>
            Start building free <ArrowRight size={15} />
          </Link>
        </div>

        <hr style={S.hr} />
        <p style={{ ...S.p, color: C.muted, fontSize: 13.5 }}>
          Educational content, not financial or accounting advice. For decisions with real stakes, talk to a
          professional. Questions or ideas for this guide? Reach us via the{' '}
          <Link to="/#contact" style={{ color: C.goldText }}>contact form</Link>.
        </p>
      </main>
    </div>
  );
}
