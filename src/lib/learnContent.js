// Koala Learn — content library.
//
// The Learn hub is organized like a small encyclopedia: a handful of
// CATEGORIES, each holding several ARTICLES. Every article is a structured
// document (key takeaways + titled sections) so the hub can render browsable
// cards and each article page can render a table of contents, a takeaways box,
// and "related reading" — without any of it being a single long scroll.
//
// Blocks inside a section are lightweight and declarative so the renderer stays
// dumb. Supported block shapes (see LearnArticlePage):
//   { t: 'p',  c: 'text with **bold** spans' }
//   { t: 'ul', items: ['...', '...'] }
//   { t: 'ol', items: ['...', '...'] }
//   { t: 'callout', tone: 'idea'|'warn'|'tip', title: '...', c: '...' }
//   { t: 'statement', title: '...', rows: [[label, value, opts], ...] }
//   { t: 'viz', viz: 'income'|'balance'|'cashflow' }
//   { t: 'stat', value: '60%', label: '...' }   // used in stat rows
//   { t: 'stats', items: [{value,label}, ...] }

export const CATEGORIES = [
  {
    id: 'foundations',
    label: 'Foundations',
    tagline: 'Start here',
    blurb: 'The big picture in plain English: what these reports are and why they decide who survives.',
  },
  {
    id: 'statements',
    label: 'The Three Statements',
    tagline: 'Core',
    blurb: 'A guided tour of each statement: how to read it line by line, with real examples.',
  },
  {
    id: 'metrics',
    label: 'Metrics & Ratios',
    tagline: 'Go deeper',
    blurb: 'The handful of numbers that turn raw dollars into a verdict on the business.',
  },
  {
    id: 'skills',
    label: 'Reading Like a Pro',
    tagline: 'Level up',
    blurb: 'Traps, habits, and mental models that separate skimming from actually understanding.',
  },
];

// ── Articles ────────────────────────────────────────────────────────────────

export const ARTICLES = [
  // ---------------------------------------------------------------- foundations
  {
    slug: 'financial-statements-explained',
    category: 'foundations',
    icon: 'Compass',
    featured: true,
    title: 'Financial Statements, Explained Like a Human',
    dek: 'The 5-minute foundation. Three reports, three questions, one business, and why founders who read them survive.',
    readTime: 5,
    level: 'Beginner',
    updated: 'July 2026',
    takeaways: [
      'Every financial statement answers one of three questions: are you making money, what do you own vs. owe, and will you run out of cash.',
      'You read all three together because each reveals something the other two physically cannot.',
      'Think of them as your business dashboard: a gauge for speed, one for fuel, one for engine temperature.',
    ],
    sections: [
      {
        id: 'why',
        title: 'Why this matters',
        blocks: [
          { t: 'p', c: "Here's an uncomfortable truth: **most businesses don't fail because the idea was bad.** They fail because the owner couldn't see trouble coming. The customers were there, the product worked, but the money side was a fog, and by the time the problem was obvious it was too late to fix." },
          { t: 'p', c: 'Financial statements are how you clear that fog. Think of them as the **dashboard of your business**: one gauge for speed, one for fuel, one for engine temperature. You don’t need to be a mechanic to drive a car, and you don’t need to be an accountant to read these three reports.' },
        ],
      },
      {
        id: 'three-questions',
        title: 'Three reports, three questions',
        blocks: [
          { t: 'p', c: 'Every financial statement ever produced, from a corner bakery to Apple, boils down to answering one of three questions. That’s it.' },
          { t: 'ul', items: [
            '**Income Statement**: are you making money? A recap of everything you earned and spent over a period, ending in profit or loss.',
            '**Balance Sheet**: what do you own vs. owe? A snapshot, frozen on one day, of everything the business owns and owes.',
            '**Cash Flow Statement**: will you run out of cash? A trace of real money moving in and out of the bank each period.',
          ] },
          { t: 'p', c: 'Why three separate reports instead of one? Because each answers a question the others can’t. A business can be profitable but out of cash. It can be rich in assets but losing money every month. Only all three together show the whole animal.' },
        ],
      },
      {
        id: 'mental-model',
        title: 'A mental model to keep',
        blocks: [
          { t: 'callout', tone: 'idea', title: 'The movie analogy', c: 'Think of your business as a movie. The **Income Statement** is the plot summary of the whole film. The **Balance Sheet** is a single freeze-frame: pause the movie and describe exactly what you see. The **Cash Flow Statement** follows one character the entire time: cash, the only character who can end the movie early.' },
          { t: 'p', c: 'Keep that picture in mind and the rest of this library is just detail. Ready? Pick a statement and dig in.' },
        ],
      },
    ],
    related: ['income-statement', 'balance-sheet', 'cash-flow-statement'],
  },
  {
    slug: 'profit-vs-cash',
    category: 'foundations',
    icon: 'Coins',
    title: 'Profit vs. Cash: The Difference That Sinks Businesses',
    dek: 'Why a company can post record profits and still miss payroll. The single most important idea in this whole library.',
    readTime: 4,
    level: 'Beginner',
    updated: 'July 2026',
    takeaways: [
      'Profit is an accounting opinion; cash is a fact in your bank account.',
      'Accrual accounting records revenue when it is earned, not when the money actually arrives.',
      'Fast growth consumes cash before it returns cash, which is why profitable businesses can still go broke.',
    ],
    sections: [
      {
        id: 'the-gap',
        title: 'The gap between the two',
        blocks: [
          { t: 'p', c: 'The Income Statement counts revenue when it’s **earned**, not when the money arrives. Accountants call this **accrual accounting**: recording things when they happen, not when cash moves.' },
          { t: 'p', c: 'Sell $10,000 of catering on a 60-day invoice and your statement says “profit!” today, while your bank account says nothing for two months. That gap is the whole reason the Cash Flow Statement exists.' },
          { t: 'callout', tone: 'warn', title: 'The line to remember', c: '**Profit is an opinion. Cash is a fact.** You can influence profit with accounting choices. You cannot fake the balance in your bank account.' },
        ],
      },
      {
        id: 'broke',
        title: 'The profitable business that went broke',
        blocks: [
          { t: 'p', c: 'Imagine a bakery lands a huge catering contract: $30,000 of orders, payable in 90 days. The Income Statement looks incredible. Record profit! But the ingredients and the bakers must be paid **now**, while the cash arrives in three months.' },
          { t: 'p', c: 'If there isn’t enough cash in the tank to bridge that gap, the bakery can miss rent while being the most profitable it has ever been. Growth **consumes** cash before it returns cash, so the faster you grow, the more this matters.' },
        ],
      },
      {
        id: 'habit',
        title: 'The habit that protects you',
        blocks: [
          { t: 'callout', tone: 'tip', title: 'Check two numbers monthly', c: 'Once a month, look at just **cash in the bank** and **cash from operations**. If cash is falling, dividing it by your monthly burn gives your **runway**: how many months until the tank is empty. That turns “sudden” crises into problems you saw coming two quarters away.' },
        ],
      },
    ],
    related: ['cash-flow-statement', 'liquidity-and-runway', 'income-statement'],
  },

  // ----------------------------------------------------------------- statements
  {
    slug: 'income-statement',
    category: 'statements',
    icon: 'TrendingUp',
    title: 'The Income Statement: Are You Making Money?',
    dek: 'Read it top to bottom like a staircase. Each step down, gross profit then operating income then net income, is its own health check.',
    readTime: 7,
    level: 'Beginner',
    updated: 'July 2026',
    takeaways: [
      'The Income Statement covers a period of time and ends in the "bottom line": net income.',
      'The order of the lines is the trick: revenue steps down through costs in a deliberate sequence.',
      'Gross profit, operating income, and net income are three different profits, each with a different meaning.',
    ],
    sections: [
      {
        id: 'watch',
        title: 'See it happen',
        blocks: [
          { t: 'p', c: 'Before the words, watch the shape. Revenue comes in at the top and each cost peels a slice away until net income is what’s left.' },
          { t: 'viz', viz: 'income' },
        ],
      },
      {
        id: 'staircase',
        title: 'The staircase, one step at a time',
        blocks: [
          { t: 'p', c: 'The statement starts with every dollar you earned, then subtracts costs in a deliberate order. Each step down tells you something different about the health of the business.' },
          { t: 'ul', items: [
            '**Revenue** is the top line: every dollar from selling, before anything is taken out. The size of the pie before anyone takes a slice.',
            '**Cost of goods sold (COGS)** is what it directly costs to deliver each sale. Beans and cups for a café, hosting for an app, materials for a workshop. Subtract it and you get **gross profit**.',
            '**Operating expenses** are the costs of simply existing: rent, marketing, salaries, software. They show up even in a month where you sell nothing. What survives them is **operating income**.',
            '**Interest and tax** come last, because they’re about how the business is financed and taxed, not how it runs. What’s left is **net income**, the famous bottom line.',
          ] },
        ],
      },
      {
        id: 'example',
        title: 'A worked example',
        blocks: [
          { t: 'p', c: 'Here’s the whole staircase with real numbers, for a small bakery in a decent month:' },
          { t: 'statement', title: 'Sunny Bakery · one month', rows: [
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
          ] },
          { t: 'p', c: 'Read the staircase and the story writes itself: the bakery keeps **60 cents of every sales dollar** after ingredients, the core operation earns a healthy $6,000, and after financing and tax the owner truly nets $4,125. Three different profits, three different insights.' },
        ],
      },
      {
        id: 'trap',
        title: 'The trap to watch for',
        blocks: [
          { t: 'callout', tone: 'warn', title: 'Profit is an opinion, cash is a fact', c: 'This statement counts revenue when it’s **earned**, not when the money lands. A record month on paper can sit right next to a bank account heading for zero. Always read the Cash Flow Statement alongside it.' },
        ],
      },
    ],
    related: ['profit-margins', 'profit-vs-cash', 'how-statements-connect'],
  },
  {
    slug: 'balance-sheet',
    category: 'statements',
    icon: 'Scale',
    title: 'The Balance Sheet: What Do You Own vs. Owe?',
    dek: 'One frozen moment in time, held together by an equation that can never break: assets equal liabilities plus equity.',
    readTime: 6,
    level: 'Beginner',
    updated: 'July 2026',
    takeaways: [
      'The Balance Sheet is a snapshot of a single day, not a period of time.',
      'Assets = Liabilities + Equity, always. Equity is defined as whatever is left after debts.',
      'It answers questions the profit report cannot: can you survive a slow quarter, and is your ownership stake growing.',
    ],
    sections: [
      {
        id: 'watch',
        title: 'See it balance',
        blocks: [
          { t: 'p', c: 'Everything you own sits on one side. What you borrowed plus what’s truly yours sits on the other. The two always match.' },
          { t: 'viz', viz: 'balance' },
        ],
      },
      {
        id: 'equation',
        title: 'The equation that never breaks',
        blocks: [
          { t: 'callout', tone: 'idea', title: 'The house analogy', c: 'You buy a **$400,000 house** with a **$300,000 mortgage** and **$100,000** of savings. The house is the **asset**. The mortgage is the **liability**. Your **equity** is the $100,000 that’s genuinely yours. Notice 400 = 300 + 100 isn’t a coincidence: equity is *defined* as whatever is left after debts. That’s why a balance sheet always balances.' },
        ],
      },
      {
        id: 'three-parts',
        title: 'The three ingredients',
        blocks: [
          { t: 'p', c: 'Think of your business as a movie. The Income Statement is the plot summary of the whole film. The Balance Sheet is a single freeze-frame: hit pause on one exact day and describe everything you see.' },
          { t: 'ul', items: [
            '**Assets** are everything the business owns, listed by how fast each turns into spendable money (that speed is called **liquidity**). Cash first, then **accounts receivable** (money customers owe you), then **inventory** (products on the shelf, basically cash wearing a costume), then long-term gear like ovens, laptops, and vehicles.',
            '**Liabilities** are everything the business owes: unpaid supplier bills (**accounts payable**), loans due within a year, and long-term debt.',
            '**Equity** is the leftover, assets minus liabilities. It grows when owners put money in, or when the business earns profit and keeps it as **retained earnings**: the running total of every profit ever made, minus anything paid out.',
          ] },
        ],
      },
      {
        id: 'why-care',
        title: 'Why a snapshot is worth so much',
        blocks: [
          { t: 'p', c: 'Because it answers questions the profit report can’t touch: could you survive a slow quarter, how much of the business does the bank effectively own, and is your ownership stake actually growing year over year.' },
        ],
      },
    ],
    related: ['liquidity-and-runway', 'how-statements-connect', 'income-statement'],
  },
  {
    slug: 'cash-flow-statement',
    category: 'statements',
    icon: 'Droplets',
    title: 'The Cash Flow Statement: Will You Run Out of Cash?',
    dek: 'The statement that saves businesses. It ignores accounting opinions and tracks one thing: real money through three doors.',
    readTime: 6,
    level: 'Beginner',
    updated: 'July 2026',
    takeaways: [
      'This statement tracks real money entering and leaving the bank, not accounting profit.',
      'Every cash movement goes through one of three doors: operating, investing, or financing.',
      'Free cash flow and runway are the numbers that tell you how long you can keep going.',
    ],
    sections: [
      {
        id: 'watch',
        title: 'See the buckets add up',
        blocks: [
          { t: 'p', c: 'Three buckets of real cash add up to the change in your bank balance for the period.' },
          { t: 'viz', viz: 'cashflow' },
        ],
      },
      {
        id: 'three-doors',
        title: 'Three doors money can walk through',
        blocks: [
          { t: 'p', c: 'This statement tracks real money entering and leaving the bank. Every movement goes through one of three doors, and the **door** matters as much as the amount.' },
          { t: 'ol', items: [
            '**Operating activities**: cash from actually running the business. Customers paying you, you paying suppliers, staff, and rent. Over time this door *must* let in more than it lets out, or the business isn’t self-sustaining.',
            '**Investing activities**: cash spent on or received from long-term assets. Buying equipment, upgrading the kitchen, selling the old van. Money out here is often a *good* sign: you’re investing in growth.',
            '**Financing activities**: cash from lenders and investors. Taking a loan, raising investment, repaying debt, paying dividends. This shows how the business is *funded*, separate from how it’s performing.',
          ] },
          { t: 'p', c: 'Add up all three doors and you get the **net change in cash**: did the bank balance go up or down, and why. Cash up because customers paid you is health. Cash up because you borrowed heavily is a countdown timer.' },
        ],
      },
      {
        id: 'fcf',
        title: 'Free cash flow: the investor’s favorite',
        blocks: [
          { t: 'p', c: 'One derived number deserves a mention: **free cash flow (FCF)**, operating cash flow minus the equipment spending needed to keep the business running (**CapEx**, short for capital expenditures). It’s the cash that’s truly free to reinvest, pay down debt, or pay yourself. Investors trust it because it’s the hardest number to dress up.' },
          { t: 'callout', tone: 'tip', title: 'Know your runway', c: 'If you spend more than you earn, **runway** = cash ÷ monthly burn. It’s how many months you have to turn things around, and the single most important number for any early-stage business.' },
        ],
      },
    ],
    related: ['profit-vs-cash', 'liquidity-and-runway', 'how-statements-connect'],
  },
  {
    slug: 'how-statements-connect',
    category: 'statements',
    icon: 'Link2',
    title: 'How the Three Statements Connect',
    dek: 'The part most guides skip. The statements are plumbed into each other, so changing one number ripples through all three.',
    readTime: 4,
    level: 'Intermediate',
    updated: 'July 2026',
    takeaways: [
      'Net income flows from the Income Statement into equity on the Balance Sheet.',
      'Net income also starts the Cash Flow Statement, which ends in the change to the cash line.',
      'This linkage is why analysts build a single "three-statement model".',
    ],
    sections: [
      {
        id: 'plumbing',
        title: 'The plumbing',
        blocks: [
          { t: 'p', c: 'Here’s where finance goes from three separate reports to one elegant machine: **the statements are plumbed into each other.** Specific numbers flow from one to the next, always in the same pattern:' },
          { t: 'ol', items: [
            '**Net income flows to the Balance Sheet.** The profit at the bottom of the Income Statement gets added to retained earnings in equity. Profit literally becomes ownership value.',
            '**Net income also starts the Cash Flow Statement.** Operating cash flow begins with profit, then adjusts for everything that affected profit without moving cash, and cash that moved without touching profit.',
            '**The net change in cash lands back on the Balance Sheet.** The last line of the Cash Flow Statement is exactly the change in the cash line between one balance sheet and the next. The loop closes.',
          ] },
        ],
      },
      {
        id: 'model',
        title: 'Why it’s called a three-statement model',
        blocks: [
          { t: 'p', c: 'Change one assumption, say revenue grows 20% instead of 10%, and the effect ripples through profit, into equity, and through cash, automatically and consistently. Three gauges wired to one engine.' },
          { t: 'callout', tone: 'tip', title: 'This is what the builder does', c: 'In Koala’s builder the plumbing is pre-wired: edit any line and net income, retained earnings, and cash all update together, with the balance sheet kept in balance.' },
        ],
      },
    ],
    related: ['income-statement', 'balance-sheet', 'cash-flow-statement'],
  },

  // -------------------------------------------------------------------- metrics
  {
    slug: 'profit-margins',
    category: 'metrics',
    icon: 'Percent',
    title: 'Profit Margins: Gross, Operating & Net',
    dek: 'Raw dollars don’t travel. Margins turn them into percentages you can compare against your industry and your past self.',
    readTime: 5,
    level: 'Intermediate',
    updated: 'July 2026',
    takeaways: [
      'Gross margin is the ceiling on profitability: everything else is paid out of what is left below it.',
      'Operating margin isolates whether the core business works, before financing and tax.',
      'Net margin is what you truly keep. Watch its trend, not just its level.',
    ],
    sections: [
      {
        id: 'why-percent',
        title: 'Why percentages beat dollars',
        blocks: [
          { t: 'p', c: '$50,000 of profit is spectacular for a food truck and alarming for an airline. **Margins** turn dollars into percentages so you can compare against your industry, your competitors, and your own past self.' },
        ],
      },
      {
        id: 'the-three',
        title: 'The three margins',
        blocks: [
          { t: 'ul', items: [
            '**Gross margin** = gross profit ÷ revenue. How many cents of each sales dollar survive the direct cost of delivering it. This is the *ceiling* on profitability: everything else gets paid out of what’s left.',
            '**Operating margin** = operating income ÷ revenue. What the core business keeps per dollar, before financing and tax. The cleanest “is this business fundamentally working?” signal.',
            '**Net margin** = net income ÷ revenue. What you truly keep after every last cost. Watch the *trend*: is growth making the business healthier, or just bigger?',
          ] },
        ],
      },
      {
        id: 'benchmarks',
        title: 'Good depends on the industry',
        blocks: [
          { t: 'p', c: 'What counts as a “good” margin varies wildly. Software gross margins run 70–90%; grocery stores live happily below 30%. Comparing against **your sector** matters more than any universal rule of thumb.' },
          { t: 'callout', tone: 'tip', title: 'Built-in benchmarks', c: 'Koala compares your margins against the typical range for your industry automatically, so you can see at a glance whether you’re running lean or bloated.' },
        ],
      },
    ],
    related: ['income-statement', 'common-mistakes', 'liquidity-and-runway'],
  },
  {
    slug: 'liquidity-and-runway',
    category: 'metrics',
    icon: 'Gauge',
    title: 'Liquidity & Runway: Can You Survive?',
    dek: 'Profit is about the year. Liquidity is about next month. These are the numbers that decide whether you make it that far.',
    readTime: 5,
    level: 'Intermediate',
    updated: 'July 2026',
    takeaways: [
      'Liquidity measures how easily you can cover short-term bills as they come due.',
      'Burn rate is how much cash you lose each period; runway is how many months of it you have left.',
      'The current ratio compares what you can turn into cash soon against what you owe soon.',
    ],
    sections: [
      {
        id: 'liquidity',
        title: 'What liquidity actually means',
        blocks: [
          { t: 'p', c: '**Liquidity** is simply how quickly something can become spendable cash, and by extension, how easily the business can pay bills that are due soon. Cash is perfectly liquid. A delivery van is not.' },
          { t: 'p', c: 'The classic quick check is the **current ratio**: everything you can turn into cash within a year, divided by everything you owe within a year. Above 1 means you can cover the next twelve months on paper.' },
        ],
      },
      {
        id: 'burn-runway',
        title: 'Burn rate and runway',
        blocks: [
          { t: 'ul', items: [
            '**Burn rate** is how much cash you lose in a period. If you start the month with $50,000 and end with $40,000, you burned $10,000.',
            '**Runway** is cash ÷ burn rate: the number of months before the tank hits empty at the current pace. $40,000 in the bank and a $10,000 monthly burn is four months of runway.',
          ] },
          { t: 'callout', tone: 'warn', title: 'Runway is a countdown, not a cushion', c: 'A four-month runway means every plan you have needs to change the trajectory *before* month four: raising money, cutting burn, or growing revenue. Knowing the number early is what gives you time to act.' },
        ],
      },
    ],
    related: ['cash-flow-statement', 'profit-vs-cash', 'balance-sheet'],
  },

  // --------------------------------------------------------------------- skills
  {
    slug: 'common-mistakes',
    category: 'skills',
    icon: 'AlertTriangle',
    title: 'Five Classic Mistakes (and How to Dodge Them)',
    dek: 'Reading statements is a skill, and beginners trip over the same five stones. Learn them here instead of the hard way.',
    readTime: 4,
    level: 'Beginner',
    updated: 'July 2026',
    takeaways: [
      'Never confuse profit with cash, or celebrate revenue without checking margin.',
      'Rising receivables and creeping overhead are quiet problems that compound.',
      'No single number means anything without the context in the other two statements.',
    ],
    sections: [
      {
        id: 'the-five',
        title: 'The five stones',
        blocks: [
          { t: 'ol', items: [
            '**Confusing profit with cash.** The all-time classic. Profit is an accounting opinion; cash is a fact. A record month on paper can coexist with a bank account heading for zero.',
            '**Celebrating revenue instead of margin.** Doubling revenue at a 5% gross margin mostly doubles your workload. Growth is only worth having if each sale carries healthy profit inside it.',
            '**Ignoring receivables.** If customers owe you more every month, you’re quietly becoming their bank, for free. Rising receivables next to flat cash is a collections problem announcing itself.',
            '**Letting overhead creep.** Admin costs rarely shrink on their own. They accrete, one small subscription and “essential” hire at a time. Overhead growth should always lose the race against revenue growth.',
            '**Judging one number in isolation.** Net income spiked? Could be a one-time gain. Cash jumped? Could be new debt. Every headline number has context living in the other two statements.',
          ] },
        ],
      },
      {
        id: 'the-fix',
        title: 'The habit that beats all five',
        blocks: [
          { t: 'callout', tone: 'tip', title: 'Read them as a set', c: 'Every time a number surprises you, good or bad, go find its reflection in the other two statements before you react. That one habit prevents most of the mistakes above.' },
        ],
      },
    ],
    related: ['profit-vs-cash', 'profit-margins', 'financial-statements-explained'],
  },
  {
    slug: 'cheat-sheet',
    category: 'skills',
    icon: 'BookOpen',
    title: 'The 60-Second Cheat Sheet',
    dek: 'The whole library, compressed for keeps. Read this before a board meeting, an investor call, or a big decision.',
    readTime: 2,
    level: 'All levels',
    updated: 'July 2026',
    takeaways: [
      'Three statements, three questions, all wired together.',
      'Watch four numbers: gross margin, operating margin, net margin, and runway.',
      'Compare everything against your industry, not a universal ideal.',
    ],
    sections: [
      {
        id: 'recap',
        title: 'Everything, in one screen',
        blocks: [
          { t: 'ul', items: [
            '**Income Statement**: “Are we making money?” A period of time. Revenue steps down to net income, and each step (gross profit, operating income) is its own health check.',
            '**Balance Sheet**: “What do we own vs. owe?” One frozen moment. Assets = liabilities + equity, always, like the house and its mortgage.',
            '**Cash Flow Statement**: “Will we run out of cash?” Real money through three doors: operations, investing, financing. Profit is an opinion. Cash is a fact.',
            '**They’re wired together**: profit flows into equity and cash, and the change in cash closes the loop back on the balance sheet.',
            '**Watch four numbers**: gross margin, operating margin, net margin, and runway. Compare against your industry, not a universal ideal.',
          ] },
          { t: 'callout', tone: 'idea', title: 'The best way to learn it? Build one.', c: 'Nothing cements this faster than watching your own assumptions turn into linked statements, then nudging one number and seeing the ripple. That’s the moment it stops being accounting and starts being your business.' },
        ],
      },
    ],
    related: ['financial-statements-explained', 'common-mistakes', 'how-statements-connect'],
  },
];

// ── Lookups ─────────────────────────────────────────────────────────────────

export const ARTICLES_BY_SLUG = ARTICLES.reduce((m, a) => { m[a.slug] = a; return m; }, {});

export function articlesInCategory(catId) {
  return ARTICLES.filter((a) => a.category === catId);
}

export function getArticle(slug) {
  return ARTICLES_BY_SLUG[slug] || null;
}

export function categoryLabel(catId) {
  return (CATEGORIES.find((c) => c.id === catId) || {}).label || '';
}
