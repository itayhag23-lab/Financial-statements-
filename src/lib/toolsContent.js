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
];

export const getTool = (slug) => TOOLS.find((t) => t.slug === slug) || null;
