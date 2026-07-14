// Koala Statements — Personal Financial Statement model.
//
// This is the counterpart to the business 3-statement projection engine
// (FinancialModelBuilder). A personal statement is NOT a multi-year projection
// with scenarios — it is two point-in-time / periodic statements with their own
// line items:
//
//   1. Net Worth Statement (Statement of Financial Position):
//        total Assets − total Liabilities = Net Worth
//   2. Monthly Cash Flow (personal budget):
//        total Income − total Expenses = Net monthly cash flow (× 12 = annual)
//
// The model carries its full structure (categories + lines with their values)
// so custom lines the user adds persist verbatim through save/load. Values live
// on each line, which keeps add / remove / edit trivial.

// Reuse the same currency set the business builder offers.
export const CURRENCIES = {
  usd: { label: 'USD', symbol: '$',  name: 'US Dollar' },
  ils: { label: 'ILS', symbol: '₪',  name: 'Israeli Shekel' },
  eur: { label: 'EUR', symbol: '€',  name: 'Euro' },
  gbp: { label: 'GBP', symbol: '£',  name: 'British Pound' },
  cad: { label: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  aud: { label: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
};

// A short, unique id for user-added lines. Not security-sensitive.
export function genLineId() {
  return 'x' + Math.random().toString(36).slice(2, 8);
}

// ── Templates ────────────────────────────────────────────────────────────────
// Each statement is a list of categories; each category owns its lines.
// `hint` on a line seeds the input placeholder (worth 0 until the user types).

const NET_WORTH = {
  assets: [
    { id: 'liquid', label: 'Cash & Equivalents', lines: [
      { id: 'cash',        label: 'Cash on hand' },
      { id: 'checking',    label: 'Checking accounts' },
      { id: 'savings',     label: 'Savings accounts' },
      { id: 'money-market',label: 'Money market / CDs' },
    ]},
    { id: 'investments', label: 'Investments', lines: [
      { id: 'brokerage',   label: 'Brokerage / stocks & bonds' },
      { id: 'retirement',  label: 'Retirement (401k, IRA, pension)' },
      { id: 'crypto',      label: 'Crypto & alternative assets' },
      { id: 'education',   label: 'Education / 529 savings' },
    ]},
    { id: 'property', label: 'Property & Belongings', lines: [
      { id: 'residence',   label: 'Primary residence' },
      { id: 'realestate',  label: 'Other real estate' },
      { id: 'vehicles',    label: 'Vehicles' },
      { id: 'valuables',   label: 'Personal property & valuables' },
    ]},
    { id: 'other-assets', label: 'Business & Other', lines: [
      { id: 'business',    label: 'Business interests' },
      { id: 'receivables', label: 'Money owed to you' },
      { id: 'other-asset', label: 'Other assets' },
    ]},
  ],
  liabilities: [
    { id: 'short-term', label: 'Short-Term Debts', lines: [
      { id: 'credit-cards', label: 'Credit card balances' },
      { id: 'personal-loan',label: 'Personal loans' },
      { id: 'unpaid-bills', label: 'Unpaid bills & taxes' },
    ]},
    { id: 'long-term', label: 'Long-Term Debts', lines: [
      { id: 'mortgage',     label: 'Mortgage' },
      { id: 'auto-loan',    label: 'Auto loans' },
      { id: 'student-loan', label: 'Student loans' },
      { id: 'other-loan',   label: 'Other loans' },
    ]},
  ],
};

const CASH_FLOW = {
  income: [
    { id: 'earned', label: 'Earned Income', lines: [
      { id: 'salary',        label: 'Salary / wages (take-home)' },
      { id: 'bonus',         label: 'Bonus & commission' },
      { id: 'self-employed', label: 'Self-employment / freelance' },
    ]},
    { id: 'passive', label: 'Other Income', lines: [
      { id: 'investment-inc',label: 'Investment & dividend income' },
      { id: 'rental-inc',    label: 'Rental income' },
      { id: 'other-income',  label: 'Other income' },
    ]},
  ],
  expenses: [
    { id: 'housing', label: 'Housing', lines: [
      { id: 'rent-mortgage', label: 'Rent / mortgage payment' },
      { id: 'utilities',     label: 'Utilities' },
      { id: 'home-other',    label: 'Property tax, insurance & upkeep' },
    ]},
    { id: 'transport', label: 'Transportation', lines: [
      { id: 'car-payment',   label: 'Car payment' },
      { id: 'fuel-transit',  label: 'Fuel & transit' },
      { id: 'car-other',     label: 'Insurance & maintenance' },
    ]},
    { id: 'living', label: 'Living', lines: [
      { id: 'groceries',     label: 'Groceries' },
      { id: 'dining',        label: 'Dining & takeout' },
      { id: 'health',        label: 'Health & medical' },
      { id: 'personal',      label: 'Personal & clothing' },
    ]},
    { id: 'financial', label: 'Debt & Savings', lines: [
      { id: 'debt-payments', label: 'Debt payments (cards & loans)' },
      { id: 'savings-contrib',label: 'Savings & investing' },
      { id: 'insurance',     label: 'Insurance (life, health)' },
    ]},
    { id: 'lifestyle', label: 'Lifestyle', lines: [
      { id: 'entertainment', label: 'Entertainment & subscriptions' },
      { id: 'travel',        label: 'Travel' },
      { id: 'other-expense', label: 'Other spending' },
    ]},
  ],
};

// Deep-clone a template section, attaching a numeric `value: 0` to every line.
function seedSection(categories) {
  return categories.map((cat) => ({
    id: cat.id,
    label: cat.label,
    lines: cat.lines.map((l) => ({ id: l.id, label: l.label, value: 0 })),
  }));
}

// A fresh, all-zero personal model.
export function makeDefaultPersonalModel() {
  return {
    kind: 'personal',
    netWorth: {
      assets:      seedSection(NET_WORTH.assets),
      liabilities: seedSection(NET_WORTH.liabilities),
    },
    cashFlow: {
      income:   seedSection(CASH_FLOW.income),
      expenses: seedSection(CASH_FLOW.expenses),
    },
  };
}

// Reconcile a loaded model against the current shape so an older/partial save
// never crashes the builder (missing statement → seeded fresh).
export function normalizePersonalModel(model) {
  const base = makeDefaultPersonalModel();
  if (!model || typeof model !== 'object') return base;
  const okSection = (s) => Array.isArray(s) && s.every((c) => c && Array.isArray(c.lines));
  return {
    kind: 'personal',
    netWorth: {
      assets:      okSection(model.netWorth?.assets)      ? model.netWorth.assets      : base.netWorth.assets,
      liabilities: okSection(model.netWorth?.liabilities) ? model.netWorth.liabilities : base.netWorth.liabilities,
    },
    cashFlow: {
      income:   okSection(model.cashFlow?.income)   ? model.cashFlow.income   : base.cashFlow.income,
      expenses: okSection(model.cashFlow?.expenses) ? model.cashFlow.expenses : base.cashFlow.expenses,
    },
  };
}

// ── Math ─────────────────────────────────────────────────────────────────────
const num = (v) => (Number.isFinite(+v) ? +v : 0);

export function sumCategory(cat) {
  return (cat?.lines || []).reduce((t, l) => t + num(l.value), 0);
}
export function sumSection(categories) {
  return (categories || []).reduce((t, c) => t + sumCategory(c), 0);
}

// All the headline numbers a personal statement reports.
export function personalTotals(model) {
  const m = normalizePersonalModel(model);
  const assets      = sumSection(m.netWorth.assets);
  const liabilities = sumSection(m.netWorth.liabilities);
  const income      = sumSection(m.cashFlow.income);
  const expenses    = sumSection(m.cashFlow.expenses);
  const netCashFlow = income - expenses;
  return {
    assets,
    liabilities,
    netWorth: assets - liabilities,
    income,
    expenses,
    netCashFlow,                 // monthly
    annualCashFlow: netCashFlow * 12,
    // Savings rate: share of income kept. Guard divide-by-zero.
    savingsRate: income > 0 ? netCashFlow / income : 0,
  };
}

export function fmtMoney(value, currencyKey = 'usd') {
  const sym = CURRENCIES[currencyKey]?.symbol || '$';
  const n = num(value);
  const s = Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
  return n < 0 ? `(${sym}${s})` : `${sym}${s}`;
}
