// Plain-English glossary for the help tooltips shown next to financial statement
// rows. Keyed by the row id from TEMPLATES in FinancialModelBuilder.jsx (plus a
// few ratio keys used on the sector benchmark card). Every entry answers two
// questions on purpose: "what is this" and "why should a non-accountant care."
// wizardHint is optional — only set it when the row's starting value genuinely
// traces back to a choice made in the setup wizard or is auto-pulled from
// another statement; leave it out otherwise rather than stating the obvious.

const FINANCIAL_GLOSSARY = {
  // ---------- Income Statement ----------
  rev: {
    term: 'Revenue',
    what: "Every dollar that comes in from selling your product or service, before you subtract anything. It's the size of the pie before anyone takes a slice.",
    why: "Revenue is the lifeblood of the business — without it, nothing else on this page matters. Lenders and investors watch how fast it's growing to judge whether the business is gaining real traction.",
  },
  'rev-ops': {
    term: 'Operating Revenue',
    what: "The money you earn from your core, day-to-day business — the thing you actually sell. It leaves out one-off windfalls like selling old equipment.",
    why: "This is the number that proves your main idea actually works, not just that you had a lucky one-time payday. It's the figure most lenders and investors care about first.",
    wizardHint: "Pre-filled from the starting revenue and growth rate you chose for your business type in the setup wizard — tweak it any time.",
  },
  cogs: {
    term: 'Cost of Revenue (COGS)',
    what: "What it directly costs you to deliver what you sell — ingredients, materials, hosting, the labor that goes straight into the product. It does not include rent, marketing, or your own salary.",
    why: "If this creeps too close to revenue, every sale barely covers itself — you can be busy and still broke. Keeping it in check is what makes growth actually profitable instead of just bigger.",
  },
  'cogs-direct': {
    term: 'Direct Costs',
    what: "The raw cost of producing or delivering one unit of what you sell — coffee beans for a café, hosting for a SaaS app, materials for a product.",
    why: "Divide this into revenue and you get your gross margin — arguably the single most important health check for a small business. Too high, and there's no room left to cover rent, payroll, or profit.",
    wizardHint: "Set as a % of revenue using typical costs for your industry from the setup wizard — adjust it if you know your real supplier costs.",
  },
  gross: {
    term: 'Gross Profit',
    what: "Revenue minus the direct cost of making what you sold. It's what's left in your pocket before rent, marketing, salaries, or anything else behind the scenes.",
    why: "This shows whether your core product or service is fundamentally profitable, separate from how well you run the rest of the business. Healthy gross profit means growth problems are usually fixable; thin or negative, and scaling up just loses money faster.",
  },
  opex: {
    term: 'Operating Expenses (OpEx)',
    what: "All the costs of running the business day to day that aren't tied directly to making your product — salaries, marketing, software, rent, insurance.",
    why: "This is usually where small businesses lose control of spending. Watching this section closely is one of the highest-leverage things you can do to stay profitable.",
  },
  'opex-sm': {
    term: 'Sales & Marketing',
    what: "What you spend to get the word out and win customers — ads, sales commissions, content, promotions.",
    why: "This is your growth engine. Spend too little and nobody finds you; spend too much relative to what a customer is worth and you're funding growth that loses money. Compare it to your revenue growth to see if it's paying off.",
    wizardHint: "Defaults to a % of revenue based on typical spend for your sector — tune it to your real marketing budget.",
  },
  'opex-ga': {
    term: 'General & Administrative (G&A)',
    what: "The 'keeping the lights on' costs — office expenses, admin staff, legal, accounting, basic software. Not tied to sales or production.",
    why: "These costs tend to creep up quietly and rarely shrink on their own. Keeping G&A lean is one of the easiest ways to stretch your runway without touching anything that drives growth.",
    wizardHint: "Starts from the overhead figure you entered in the setup wizard, growing at the rate you chose.",
  },
  'opex-rd': {
    term: 'Research & Development (R&D)',
    what: "Money spent building, improving, or testing your product — engineering time, prototypes, experiments.",
    why: "It's an investment in your future, not a cost to slash on sight. The real question is whether this spend is turning into a better product and more revenue over time.",
  },
  'opex-da': {
    term: 'Depreciation & Amortization (D&A)',
    what: "A non-cash accounting entry that spreads the cost of big purchases (like equipment) over several years instead of all at once.",
    why: "It doesn't take cash out of your bank account today, so don't panic if it dents your profit on paper — but it's still a real cost of replacing equipment down the line, so don't ignore it either.",
  },
  'opex-other': {
    term: 'Other Operating Expense',
    what: "Any regular running cost that doesn't fit neatly into Sales & Marketing, G&A, or R&D — a catch-all bucket.",
    why: "Worth a glance if it grows large — that usually means something in here deserves its own line so you can actually manage it.",
  },
  'op-inc': {
    term: 'Operating Income (EBIT)',
    what: "What's left of revenue after paying for the product, running the business, and marketing — but before interest on loans or taxes. Often called 'EBIT.'",
    why: "This is the cleanest read on whether your actual operations make money, independent of how you financed the business or what tax bracket you're in. It's the number most worth showing a lender.",
  },
  'non-op': {
    term: 'Non-Operating Items',
    what: "Money in or out that has nothing to do with running your core business — loan interest, interest earned on cash, one-off gains or losses.",
    why: "Separating these out matters because they can make a struggling core business look fine (or a healthy one look bad) for a single quarter. Always sanity-check Operating Income too, not just the bottom line.",
  },
  'int-inc': {
    term: 'Interest Income',
    what: "Interest your business earns on cash sitting in savings or interest-bearing accounts.",
    why: "Usually small for an early-stage business, but it's free money for simply not letting cash sit idle in a zero-interest account.",
  },
  'int-exp': {
    term: 'Interest Expense',
    what: "The interest you pay on loans, credit lines, or financing — the cost of borrowed money. Recorded here as a negative number.",
    why: "If this grows faster than your Operating Income, debt is becoming a drag rather than a tool. Worth watching closely before taking on more financing.",
  },
  'other-no': {
    term: 'Other Income / (Expense)',
    what: "One-off items that don't recur regularly — a grant, a settlement, a one-time write-off.",
    why: "Useful to isolate so a single unusual event doesn't distort your read on how the business is really trending.",
  },
  pretax: {
    term: 'Pretax Income',
    what: "Your total profit before the tax office takes its share — operating profit plus or minus interest and other one-off items.",
    why: "This is the number tax is actually calculated on, so it's a useful checkpoint before you see your true bottom line.",
  },
  tax: {
    term: 'Tax Provision',
    what: "An estimate of the income tax your business owes on its profit for the period.",
    why: "Setting this aside — mentally and in cash — avoids the classic small-business trap: feeling flush all year, then getting hit with a tax bill you didn't save for.",
    wizardHint: "Defaults to the typical tax rate for the region you picked in the setup wizard — update it once you know your real rate.",
  },
  'net-inc': {
    term: 'Net Income',
    what: "Everything that's left after every single cost, including taxes. This is the true bottom line — what you actually keep.",
    why: "This is the headline number everyone uses to ask 'did the business make money?' But check Operating Income too — a single one-off item can make Net Income misleading on its own.",
  },

  // ---------- Balance Sheet ----------
  assets: {
    term: 'Total Assets',
    what: "Everything of value your business owns — cash, money owed to you, inventory, equipment, anything that could in theory be sold or used to generate value.",
    why: "This is half of the balance sheet's core promise: what you own should always equal what you owe plus what belongs to you. It's the total resources you have to work with.",
  },
  cash: {
    term: 'Cash & Equivalents',
    what: "The actual money in your bank accounts right now — the most real, spendable asset you have.",
    why: "Arguably the single most important number for a small business's survival. You can be 'profitable' on paper and still run out of cash to pay rent — track this number obsessively.",
  },
  ar: {
    term: 'Accounts Receivable',
    what: "Money customers owe you for things you've already delivered but haven't paid for yet — invoices sent, payment pending.",
    why: "Revenue you've 'earned' but haven't collected can't pay your bills. If this keeps growing faster than your cash, you may have a collections problem brewing.",
  },
  inv: {
    term: 'Inventory',
    what: "The value of products you've bought or made but haven't sold yet — sitting on a shelf or in a warehouse.",
    why: "Cash tied up in unsold inventory is cash you can't use elsewhere. Too much sitting around for too long is one of the quietest ways small businesses run into cash trouble.",
  },
  'other-ca': {
    term: 'Other Current Assets',
    what: "Smaller short-term assets that don't fit Cash, Receivables, or Inventory — like prepaid insurance or a deposit you'll get back soon.",
    why: "Usually minor, but worth a glance if it's growing — that can mean cash is getting tied up somewhere unexpected.",
  },
  ppe: {
    term: 'Property, Plant & Equipment (PP&E)',
    what: "The big physical things your business owns and uses for years — equipment, vehicles, computers, leasehold improvements.",
    why: "These are long-term investments in your ability to operate, not things you plan to sell quickly. Worth tracking closely if you're financing big purchases, since they tie up capital for the long haul.",
  },
  goodwill: {
    term: 'Goodwill & Intangibles',
    what: "The value of things you can't touch — a brand, a customer list, patents, or the extra amount paid when buying another company above its 'book' value.",
    why: "Mostly relevant if you've acquired a business or own valuable IP. For most early-stage companies this stays at zero, and that's completely normal.",
  },
  liab: {
    term: 'Total Liabilities',
    what: "Everything your business owes to someone else — suppliers, lenders, employees, the tax office.",
    why: "This is your total obligations. Compare it to Total Assets to get a feel for how much of what you own is actually 'free and clear' versus owed to someone.",
  },
  ap: {
    term: 'Accounts Payable',
    what: "Bills you've received from suppliers or vendors that you haven't paid yet.",
    why: "Using supplier payment terms wisely is a free, interest-free way to manage cash flow — but let it grow too large and you risk late fees or losing supplier trust.",
  },
  'st-debt': {
    term: 'Short-term Debt',
    what: "Loans or credit you need to repay within the next year — a credit line balance, a short-term loan.",
    why: "This is debt that will need real cash soon. Make sure your upcoming cash flow can actually cover it before it's due.",
  },
  'other-cl': {
    term: 'Other Current Liabilities',
    what: "Smaller short-term obligations that don't fit Accounts Payable or Short-term Debt — accrued payroll, unpaid utility bills.",
    why: "Individually small, but worth checking that nothing here is quietly piling up unpaid.",
  },
  'lt-debt': {
    term: 'Long-term Debt',
    what: "Loans you don't have to fully repay for more than a year — a business loan, an SBA loan, long-term financing.",
    why: "Long-term debt can fund growth without giving up ownership, but it adds a fixed cost — interest plus repayments — that has to be covered no matter how the business is doing that month.",
  },
  equity: {
    term: 'Total Equity',
    what: "What's left over for the owner once you subtract everything the business owes from everything it owns. Simply put: your stake in the business.",
    why: "This is your actual ownership value — it grows when the business is profitable and shrinks when it loses money or pays out more than it earns. It's the number that ultimately shows whether you're building wealth or eroding it.",
  },
  common: {
    term: 'Common Stock',
    what: "The value of ownership shares issued to founders and investors — money put into the business in exchange for a piece of ownership.",
    why: "This tracks how much outside capital came in for equity, as opposed to debt that has to be repaid.",
  },
  retained: {
    term: 'Retained Earnings',
    what: "All the profit the business has made since day one, minus anything paid out to owners — the running scoreboard of performance.",
    why: "A rising number here means the business has historically made more than it's paid out — a strong sign of sustainable, self-funded growth.",
  },
  apic: {
    term: 'Additional Paid-in Capital (APIC)',
    what: "The extra amount investors paid above the basic face value of their shares — common in formal fundraising rounds.",
    why: "Mostly an accounting technicality for businesses that have raised investment. Most early-stage companies can safely leave this at zero.",
  },
  'total-le': {
    term: 'Total Liabilities + Equity',
    what: "Everything you owe, plus everything that belongs to you as the owner, added together.",
    why: "This must always equal Total Assets — it's the fundamental rule of a balance sheet ('balance' isn't just a name). If these two don't match, something in the numbers needs fixing.",
  },

  // ---------- Cash Flow Statement ----------
  cfo: {
    term: 'Cash from Operations',
    what: "The actual cash your day-to-day business activities generated or used — different from accounting profit, which can include non-cash items.",
    why: "One of the clearest tests of a healthy business: are your operations actually generating cash, or just paper profit? Showing Net Income but bleeding cash here is a red flag worth catching early.",
  },
  'cf-ni': {
    term: 'Net Income',
    what: "The starting point for this section — the same Net Income from your Income Statement, carried over automatically.",
    why: "The Cash Flow Statement starts from profit, then adjusts for things that affected profit but didn't actually move cash, like depreciation, or vice versa.",
    wizardHint: "Pulled automatically from your Income Statement — you never enter it twice.",
  },
  'cf-da': {
    term: 'Depreciation & Amortization',
    what: "Added back here because it reduced your profit on paper but never actually left your bank account.",
    why: "A good reminder that profit and cash aren't the same thing — D&A is a real cost over time, but not a cash cost this period.",
  },
  'cf-sbc': {
    term: 'Stock-based Compensation',
    what: "Pay given to employees or founders in company shares instead of cash, added back because it reduced profit without using actual cash.",
    why: "It's a real cost — it dilutes ownership — even though no cash leaves the bank. Worth tracking separately if you're paying part of your team in equity to conserve cash.",
  },
  'cf-ar': {
    term: 'Change in Accounts Receivable',
    what: "How much more, or less, customers owe you compared to last period.",
    why: "If customers owe you more this period than last, that's revenue you've recognized but haven't collected — it reduces your actual cash even if profit looks fine.",
    wizardHint: "Calculated automatically from the Accounts Receivable balance on your Balance Sheet — you don't enter this directly.",
  },
  'cf-inv': {
    term: 'Change in Inventory',
    what: "How much your inventory level went up or down.",
    why: "Buying more inventory than you sell ties up cash on the shelf; selling it down frees cash up. This line shows you which direction it's moving.",
    wizardHint: "Calculated automatically from the Inventory balance on your Balance Sheet.",
  },
  'cf-ap': {
    term: 'Change in Accounts Payable',
    what: "How much more, or less, you owe suppliers compared to last period.",
    why: "Owing suppliers more frees up cash in the short term — you're effectively using their money for longer — but don't let that turn into a habit of paying late.",
    wizardHint: "Calculated automatically from the Accounts Payable balance on your Balance Sheet.",
  },
  cfi: {
    term: 'Cash from Investing',
    what: "Cash spent on or received from long-term investments — buying equipment, selling an asset, acquiring another business.",
    why: "Heavy spending here often means you're investing in future growth, which is good — but it also eats into cash reserves now, so make sure operating cash flow can support it.",
  },
  'cf-capex': {
    term: 'Capital Expenditures (CapEx)',
    what: "Cash spent buying equipment, tools, or other long-term assets that will be used for years, not consumed right away. Recorded here as a negative number.",
    why: "Necessary for growth, but it's a direct cash outflow today even though the benefit shows up over years — factor it into how much cash runway you actually have.",
  },
  'cf-acq': {
    term: 'Acquisitions',
    what: "Cash spent buying another company or business. Recorded here as a negative number.",
    why: "A major cash event — worth modeling carefully, since it can significantly shorten your runway if it isn't properly financed.",
  },
  cff: {
    term: 'Cash from Financing',
    what: "Cash raised from or paid out to investors and lenders — taking a loan, raising investment, paying back debt, paying dividends.",
    why: "This shows how your cash position is being supported, or drained, by financing decisions — separate from how the actual business is performing.",
  },
  'cf-debt': {
    term: 'Debt Issued / (Repaid)',
    what: "Cash coming in from a new loan, or cash going out to pay one down.",
    why: "Borrowing buys you time and cash today but commits you to future repayments — plan around it so a repayment doesn't blindside your cash position.",
  },
  'cf-equity': {
    term: 'Equity Issued',
    what: "Cash raised by selling ownership shares in your business to investors.",
    why: "Unlike a loan, you don't have to pay this back — but you do give up a piece of ownership and future profit. Worth tracking against how much of the company you're giving away for how much cash.",
  },
  'cf-div': {
    term: 'Dividends Paid',
    what: "Cash paid out to owners or shareholders from profits, rather than reinvested in the business. Recorded here as a negative number.",
    why: "Paying yourself or investors is fine once the business is healthy — just make sure it doesn't drain cash you'll need for next month's bills.",
  },
  'cf-net': {
    term: 'Net Change in Cash',
    what: "The total change in your cash balance for the period — operating, investing, and financing cash flows all added together.",
    why: "The real-world answer to 'did our bank balance go up or down this period?' Arguably the single number that determines whether you can keep paying bills.",
  },
  'cf-fcf': {
    term: 'Free Cash Flow (FCF)',
    what: "The cash left over from running the business after paying for the equipment and tools needed to keep it running (CapEx).",
    why: "This is the cash that's truly 'free' to reinvest, save, pay down debt, or pay yourself. It's one of the measures investors trust most for real financial health.",
  },

  // ---------- Sector benchmark ratios ----------
  'gross-margin': {
    term: 'Gross Margin',
    what: "Gross Profit shown as a percentage of revenue — how many cents of every sales dollar are left after covering the direct cost of making it.",
    why: "This is the ceiling on your profitability — rent, salaries, and marketing all get paid out of what's left below this line. A thin gross margin means there's very little room to be profitable no matter how well you manage everything else.",
    wizardHint: "Compared automatically against the typical range for the industry you chose in the setup wizard.",
  },
  'op-margin': {
    term: 'Operating Margin',
    what: "Operating Income as a percentage of revenue — how much profit your core business makes per sales dollar, before interest and taxes.",
    why: "The clearest read on whether the actual business, not your financing or tax situation, is fundamentally working. Comparing it to your sector's typical range shows if you're running lean or bloated.",
    wizardHint: "Compared automatically against the typical range for the industry you chose in the setup wizard.",
  },
  'net-margin': {
    term: 'Net Margin',
    what: "Net Income as a percentage of revenue — what you actually keep, after every single cost, from each dollar of sales.",
    why: "The ultimate 'are we actually making money' number. Watching how it trends over time shows whether growth is making the business healthier, or just bigger.",
    wizardHint: "Compared automatically against the typical range for the industry you chose in the setup wizard.",
  },
};

export function getGlossaryEntry(key) {
  return key ? FINANCIAL_GLOSSARY[key] || null : null;
}

export default FINANCIAL_GLOSSARY;
