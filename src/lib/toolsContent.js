// Koala Tools — free standalone finance calculators.
//
// Each entry powers one /tools/:slug page: a fast, interactive calculator that
// ranks for high-intent searches ("startup runway calculator", "LTV CAC
// calculator") and funnels users into the full model builder. The interactive
// widget lives in src/components/tools/<component>; this file is just the copy
// and SEO metadata so the pages stay declarative and prerender cleanly.

export const TOOLS = [
  {
    slug: 'runway-calculator',
    name: 'Startup Runway Calculator',
    metaTitle: 'Startup Runway Calculator (Free) | How Many Months of Cash | Koala Statements',
    metaDescription:
      'Free startup runway calculator. Enter your cash balance and monthly burn to see how many months of runway you have left — and your zero-cash date. No signup.',
    component: 'RunwayCalculator',
    tagline: 'How many months of cash do you have left?',
    intro:
      'Runway is the number every founder should know cold: how long your cash lasts at the current burn. Enter your bank balance and net monthly burn to see your runway in months and the date you hit zero.',
    formula: 'Runway (months) = Cash on hand ÷ Net monthly burn',
    faqs: [
      {
        q: 'How do you calculate startup runway?',
        a: 'Divide your current cash balance by your net monthly burn (cash out minus cash in). The result is the number of months until you run out of money at the current rate.',
      },
      {
        q: 'How much runway should a startup have?',
        a: 'Most investors want to see 12–18 months of runway after a raise. Below 6 months, you should already be raising or cutting burn.',
      },
    ],
  },
  {
    slug: 'burn-rate-calculator',
    name: 'Burn Rate Calculator',
    metaTitle: 'Burn Rate Calculator (Free) | Gross & Net Monthly Burn | Koala Statements',
    metaDescription:
      'Free burn rate calculator. Enter starting and ending cash over a period to get gross and net monthly burn, plus your runway. Instant, no signup.',
    component: 'BurnRateCalculator',
    tagline: 'Turn a cash balance change into monthly burn.',
    intro:
      'Burn rate is how much cash you consume each month. Net burn nets out revenue; gross burn is total spend. Enter your cash at the start and end of a period and your monthly revenue to get both — and how much runway your current cash buys.',
    formula: 'Net burn = (Starting cash − Ending cash) ÷ Number of months',
    faqs: [
      {
        q: 'What is the difference between gross and net burn?',
        a: 'Gross burn is your total monthly cash spend. Net burn subtracts monthly revenue, so it reflects the cash you actually lose each month. Net burn is what determines runway.',
      },
      {
        q: 'What is a good burn rate?',
        a: 'There is no universal number — burn should be judged against runway and growth. The key test is whether the cash you burn is buying proportional progress toward the next milestone or raise.',
      },
    ],
  },
  {
    slug: 'ltv-cac-calculator',
    name: 'LTV : CAC Calculator',
    metaTitle: 'LTV to CAC Ratio Calculator (Free) | Unit Economics | Koala Statements',
    metaDescription:
      'Free LTV:CAC calculator. Enter ARPU, gross margin, churn, and CAC to get customer lifetime value, the LTV:CAC ratio, and CAC payback period. No signup.',
    component: 'LtvCacCalculator',
    tagline: 'Are your unit economics actually working?',
    intro:
      'LTV:CAC is the health check for any subscription or repeat-purchase business. Enter revenue per customer, gross margin, monthly churn, and your cost to acquire a customer to get lifetime value, the LTV:CAC ratio, and how long it takes to pay back acquisition.',
    formula: 'LTV = (ARPU × Gross margin) ÷ Monthly churn   ·   Ratio = LTV ÷ CAC',
    faqs: [
      {
        q: 'What is a good LTV:CAC ratio?',
        a: 'A ratio of 3:1 or higher is generally considered healthy — you earn at least three times what it costs to acquire a customer. Below 1:1 you lose money on every customer; far above 3:1 you may be under-investing in growth.',
      },
      {
        q: 'How is customer lifetime value (LTV) calculated?',
        a: 'A common formula is ARPU multiplied by gross margin, divided by your churn rate. That gives the gross-margin dollars a customer contributes over their expected lifetime.',
      },
    ],
  },
  {
    slug: 'automated-financial-statement-generator',
    name: 'Automated Financial Statement Generator',
    metaTitle: 'Automated Financial Statement Generator | Build in Minutes | Koala Statements',
    metaDescription:
      'Generate a full 3-statement financial forecast automatically — income statement, balance sheet, and cash flow — from a plain-English description. Free, no signup.',
    // No calculator widget: this is a feature/product page pointing straight
    // at the AI builder, not a standalone interactive tool like the others.
    component: null,
    tagline: 'Describe your business. AI builds the financial statement.',
    intro:
      'Building a financial statement by hand means wiring formulas across three linked tabs and hoping nothing breaks when an assumption changes. This generator does it automatically: describe your business in a sentence, and AI assembles a fully linked income statement, balance sheet, and cash flow — editable line by line from there.',
    faqs: [
      {
        q: 'How does an automated financial statement generator work?',
        a: 'You describe your business — what it sells, rough revenue and costs — in plain English. AI translates that into a linked income statement, balance sheet, and cash flow statement, using reasonable default assumptions you can then edit directly.',
      },
      {
        q: 'Is an automated financial statement accurate enough for investors or lenders?',
        a: 'The generated statements are fully editable and follow standard accounting structure, so once you refine the assumptions to match your actual numbers, they hold up for investor updates, loan applications, and internal planning.',
      },
      {
        q: 'Can I export the automated financial statement to Excel?',
        a: 'Yes — every generated statement can be exported to a formula-ready Excel file at any time.',
      },
    ],
    featureList: [
      'AI-generated 3-statement forecast from a plain-English description',
      'Linked income statement, balance sheet, and cash flow',
      'Editable assumptions',
      'Export to Excel',
    ],
    keywords: 'automated financial statement, automated financial statement generator, financial statement automation',
  },
  {
    slug: 'export-financial-statement-to-excel',
    name: 'Export Financial Statements to Excel',
    metaTitle: 'Export Financial Statements to Excel Instantly | Koala Statements',
    metaDescription:
      'Build your financial statements online, then export to Excel instantly — editable, formula-ready spreadsheets. No manual formatting required.',
    component: null,
    tagline: 'From on-screen model to editable spreadsheet in one click.',
    intro:
      'Most financial statement tools lock your numbers in a proprietary app. Here, every statement you build — income statement, balance sheet, or cash flow — exports to a real, formula-ready Excel file, so you can keep working offline, share it with an accountant, or drop it into a data room.',
    faqs: [
      {
        q: 'Can I export a financial statement to Excel for free?',
        a: 'Yes — build your financial statement online and export it to Excel at no cost, with formulas intact rather than pasted-in values.',
      },
      {
        q: 'Does the Excel export keep the formulas linked?',
        a: 'Yes, the exported file keeps the same formula relationships between the income statement, balance sheet, and cash flow, so changing an input still recalculates the rest of the sheet.',
      },
    ],
    featureList: [
      'One-click export to Excel',
      'Formula-ready spreadsheet, not flattened values',
      'Works for any generated income statement, balance sheet, or cash flow',
    ],
    keywords: 'export financial statement to excel, financial statement excel export, download financial statement excel',
  },
];

export const getTool = (slug) => TOOLS.find((t) => t.slug === slug) || null;
