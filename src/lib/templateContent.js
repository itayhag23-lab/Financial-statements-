// Koala Templates — industry financial-model template library.
//
// Each entry powers one programmatic-SEO landing page (/templates/:slug) that
// ranks for high-intent searches like "SaaS financial model template" and drops
// the visitor straight into the AI builder with `aiSeed` pre-filled.
//
// Keep copy concrete and benchmark-driven — these pages earn their ranking by
// being genuinely useful references, not thin doorway pages.

export const TEMPLATES = [
  {
    slug: 'saas',
    industry: 'SaaS',
    title: 'SaaS Financial Model Template',
    metaTitle: 'SaaS Financial Model Template (Free, AI-Built) | Koala Statements',
    metaDescription:
      'A free SaaS financial model template: MRR/ARR build-up, churn, CAC payback, gross margin and a full 3-statement forecast. Describe your SaaS and AI builds it in 60 seconds.',
    tagline: 'Subscription revenue, churn, and CAC payback — modeled properly.',
    intro:
      'Subscription businesses live and die on retention and unit economics. This template builds recurring revenue from the bottom up — new logos, expansion, and churn — then flows it through gross margin, sales efficiency, and cash so you can see when the model actually turns cash-flow positive.',
    included: [
      'MRR / ARR build-up: new, expansion, contraction, and churned revenue',
      'Gross margin after hosting and support costs',
      'CAC, CAC payback period, and LTV:CAC',
      'Headcount-driven S&M, R&D, and G&A',
      'Fully linked income statement, balance sheet, and cash flow',
    ],
    drivers: [
      { label: 'Gross margin', typical: '75–85%', note: 'Healthy SaaS after hosting + support' },
      { label: 'Monthly logo churn', typical: '1–3%', note: 'Lower is better; enterprise < SMB' },
      { label: 'Net revenue retention', typical: '100–120%', note: 'Above 100% means you grow without new logos' },
      { label: 'CAC payback', typical: '< 12 months', note: 'Time to recover customer acquisition cost' },
      { label: 'Rule of 40', typical: '≥ 40%', note: 'Growth rate + profit margin' },
    ],
    aiSeed:
      'Build a 3-statement financial model for a B2B SaaS startup. We sell a monthly subscription at about $200/month per customer, currently around 150 customers, growing new signups ~10% per month with roughly 2% monthly churn. Gross margin around 80%. Include sales & marketing, R&D, and G&A operating expenses driven by headcount.',
    faqs: [
      {
        q: 'What should a SaaS financial model include?',
        a: 'A complete SaaS model builds recurring revenue from new, expansion, and churned MRR; applies a gross margin after hosting and support; models CAC and payback; and links everything into an income statement, balance sheet, and cash flow so you can see runway and profitability.',
      },
      {
        q: 'What is a good churn rate for SaaS?',
        a: 'Monthly logo churn of 1–3% is typical; best-in-class enterprise SaaS is often below 1%. What matters most is net revenue retention — above 100% means expansion outpaces churn.',
      },
    ],
  },
  {
    slug: 'ecommerce',
    industry: 'E-commerce',
    title: 'E-commerce Financial Model Template',
    metaTitle: 'E-commerce Financial Model Template (Free, AI-Built) | Koala Statements',
    metaDescription:
      'A free e-commerce financial model template: orders, AOV, contribution margin after COGS and shipping, ad spend/ROAS, and a full 3-statement forecast. Built by AI in 60 seconds.',
    tagline: 'Orders, AOV, and contribution margin after the true cost of a sale.',
    intro:
      'E-commerce margins hide in the details: product cost, shipping, payment fees, returns, and ad spend. This template builds revenue from orders and average order value, strips out the real cost to deliver a sale, and shows contribution margin before it flows into cash and inventory.',
    included: [
      'Revenue from orders × average order value (AOV)',
      'COGS, shipping, payment fees, and returns',
      'Contribution margin per order',
      'Marketing spend modeled against ROAS / blended CAC',
      'Inventory, cash, and the full 3-statement forecast',
    ],
    drivers: [
      { label: 'Gross margin', typical: '40–60%', note: 'After product cost and freight' },
      { label: 'Contribution margin', typical: '20–35%', note: 'After shipping, fees, and returns' },
      { label: 'Return rate', typical: '5–15%', note: 'Higher in apparel' },
      { label: 'Blended ROAS', typical: '2.5–4×', note: 'Revenue per ad dollar' },
      { label: 'Repeat purchase rate', typical: '20–40%', note: 'Drives LTV and payback' },
    ],
    aiSeed:
      'Build a 3-statement financial model for a direct-to-consumer e-commerce brand. We sell physical products with an average order value around $60, roughly 3,000 orders per month growing ~8% monthly. Product cost is about 35% of revenue, plus shipping and payment fees. We spend on paid ads at a blended ROAS around 3. Include inventory and operating expenses.',
    faqs: [
      {
        q: 'How do you build an e-commerce financial model?',
        a: 'Start with orders and average order value to get revenue, subtract product cost, shipping, payment fees, and returns to reach contribution margin, then model marketing spend against ROAS and flow everything into inventory, cash, and the three statements.',
      },
      {
        q: 'What is a good contribution margin for e-commerce?',
        a: 'After shipping, payment processing, and returns, a contribution margin of 20–35% is healthy. Below that, paid acquisition becomes hard to make profitable.',
      },
    ],
  },
  {
    slug: 'marketplace',
    industry: 'Marketplace',
    title: 'Marketplace Financial Model Template',
    metaTitle: 'Marketplace Financial Model Template (Free, AI-Built) | Koala Statements',
    metaDescription:
      'A free two-sided marketplace financial model template: GMV, take rate, net revenue, and a full 3-statement forecast. Describe your marketplace and AI builds it in 60 seconds.',
    tagline: 'GMV × take rate — the two numbers a marketplace runs on.',
    intro:
      'A marketplace earns a slice of the transactions it enables. This template models gross merchandise value (GMV) from buyers and orders, applies your take rate to get net revenue, and accounts for the payments and support costs of running both sides of the market.',
    included: [
      'GMV from active buyers × orders × order value',
      'Net revenue via take rate (commission + fees)',
      'Payment processing and support costs',
      'Buyer and seller acquisition spend',
      'Full 3-statement forecast with cash runway',
    ],
    drivers: [
      { label: 'Take rate', typical: '10–20%', note: 'Commission + fees as % of GMV' },
      { label: 'GMV growth', typical: '10–20%/mo early', note: 'Driven by both sides of the market' },
      { label: 'Buyer repeat rate', typical: '30–50%', note: 'Liquidity signal' },
      { label: 'Contribution margin', typical: '50–70% of net rev', note: 'After payments + support' },
    ],
    aiSeed:
      'Build a 3-statement financial model for a two-sided online marketplace. We enable about $500,000 of gross merchandise value (GMV) per month, growing ~12% monthly, and take a 15% commission. Subtract payment processing costs and customer support, and include marketing spend to acquire both buyers and sellers.',
    faqs: [
      {
        q: 'How do you model a marketplace business?',
        a: 'Model gross merchandise value (GMV) from active buyers, order frequency, and order value, then apply your take rate to get net revenue. Subtract payment processing and support costs, add acquisition spend for both sides, and link it into the three statements.',
      },
      {
        q: 'What is a typical marketplace take rate?',
        a: 'Most marketplaces take 10–20% of GMV through commission and fees. Higher take rates require delivering more value (trust, logistics, payments); lower ones need enormous volume.',
      },
    ],
  },
  {
    slug: 'agency',
    industry: 'Agency & Services',
    title: 'Agency Financial Model Template',
    metaTitle: 'Agency Financial Model Template (Free, AI-Built) | Koala Statements',
    metaDescription:
      'A free agency & professional-services financial model template: billable headcount, utilization, bill rates, and a full 3-statement forecast. Built by AI in 60 seconds.',
    tagline: 'Billable people × utilization × rate — the services engine.',
    intro:
      'A services business sells time. This template builds revenue from billable headcount, utilization, and bill rates, then subtracts fully-loaded delivery cost to reveal gross margin — the number that tells you whether each hire actually pays for itself.',
    included: [
      'Revenue from billable staff × utilization × bill rate',
      'Fully-loaded delivery cost (salaries + benefits)',
      'Gross margin per billable head',
      'Overhead: sales, admin, tools, and office',
      'Full 3-statement forecast with cash timing',
    ],
    drivers: [
      { label: 'Utilization', typical: '70–85%', note: 'Billable hours ÷ available hours' },
      { label: 'Gross margin', typical: '40–55%', note: 'After delivery salaries' },
      { label: 'Bill rate ÷ cost rate', typical: '2.5–3.5×', note: 'The services multiple' },
      { label: 'Revenue per head', typical: '$150–250K', note: 'Annualized, varies by discipline' },
    ],
    aiSeed:
      'Build a 3-statement financial model for a professional services agency. We have about 20 billable staff at roughly 75% utilization, billing around $150/hour, with fully-loaded delivery salaries. Add non-billable overhead for sales, admin, and tools. Model modest headcount growth over the forecast.',
    faqs: [
      {
        q: 'How do you model an agency or consulting business?',
        a: 'Build revenue from billable headcount multiplied by utilization and bill rate, subtract fully-loaded delivery salaries to get gross margin, then layer in non-billable overhead and flow it into the three statements.',
      },
      {
        q: 'What utilization rate should an agency target?',
        a: 'Most healthy agencies run billable utilization of 70–85%. Too low and margins erode; too high and delivery quality and retention suffer.',
      },
    ],
  },
  {
    slug: 'restaurant',
    industry: 'Restaurant',
    title: 'Restaurant Financial Model Template',
    metaTitle: 'Restaurant Financial Model Template (Free, AI-Built) | Koala Statements',
    metaDescription:
      'A free restaurant financial model template: covers, average check, food & labor cost (prime cost), and a full 3-statement forecast. Describe your concept and AI builds it.',
    tagline: 'Covers, average check, and prime cost — the restaurant math.',
    intro:
      'Restaurants win or lose on prime cost — food plus labor as a share of sales. This template builds revenue from covers and average check, tracks food and labor cost against industry benchmarks, and carries fixed costs like rent through to cash.',
    included: [
      'Revenue from covers × average check (dine-in + takeout)',
      'Food cost (COGS) as a percent of sales',
      'Labor cost and prime cost tracking',
      'Rent, utilities, and fixed operating costs',
      'Full 3-statement forecast with cash flow',
    ],
    drivers: [
      { label: 'Food cost', typical: '28–35%', note: 'COGS as % of sales' },
      { label: 'Labor cost', typical: '25–35%', note: 'Including management' },
      { label: 'Prime cost', typical: '≤ 60–65%', note: 'Food + labor combined' },
      { label: 'Occupancy (rent)', typical: '6–10%', note: 'Rent as % of sales' },
    ],
    aiSeed:
      'Build a 3-statement financial model for a full-service restaurant. We serve about 2,500 covers per month at an average check around $35, growing slowly as the concept ramps. Food cost is roughly 30% of sales and labor about 30%. Include rent, utilities, and other fixed operating costs.',
    faqs: [
      {
        q: 'What is prime cost in a restaurant model?',
        a: 'Prime cost is food cost plus labor cost as a share of sales — the single most important number in restaurant economics. Keeping it at or below 60–65% is the difference between a profitable venue and a struggling one.',
      },
      {
        q: 'How do you forecast restaurant revenue?',
        a: 'Forecast covers (guests served) multiplied by average check, split across dine-in and takeout if relevant, then ramp it as the concept matures and seasonality kicks in.',
      },
    ],
  },
  {
    slug: 'subscription-box',
    industry: 'Subscription / DTC',
    title: 'Subscription Box Financial Model Template',
    metaTitle: 'Subscription Box Financial Model Template (Free, AI-Built) | Koala Statements',
    metaDescription:
      'A free subscription-box financial model template: active subscribers, churn, cohort retention, fulfillment cost, and a full 3-statement forecast. Built by AI in 60 seconds.',
    tagline: 'Active subscribers, churn, and fulfillment cost per box.',
    intro:
      'A subscription box blends recurring revenue with physical fulfillment. This template tracks active subscribers with monthly churn, builds revenue per box, and subtracts product and shipping cost per shipment so you can see contribution margin and the cash cost of growth.',
    included: [
      'Active subscribers with new adds and monthly churn',
      'Revenue per box and recurring MRR',
      'Product + fulfillment + shipping cost per box',
      'Contribution margin and CAC payback',
      'Full 3-statement forecast with inventory and cash',
    ],
    drivers: [
      { label: 'Monthly churn', typical: '5–10%', note: 'Higher than software subscriptions' },
      { label: 'Contribution margin', typical: '25–40%', note: 'After product + shipping' },
      { label: 'CAC payback', typical: '3–6 boxes', note: 'Months to recover acquisition cost' },
      { label: 'Avg. subscriber life', typical: '6–12 months', note: 'Drives LTV' },
    ],
    aiSeed:
      'Build a 3-statement financial model for a subscription box business. We have about 4,000 active subscribers paying $40/month, adding new subscribers each month with roughly 7% monthly churn. Product plus fulfillment and shipping costs about $22 per box. Include marketing spend to acquire subscribers and model inventory.',
    faqs: [
      {
        q: 'How is a subscription box model different from SaaS?',
        a: 'It shares recurring revenue and churn mechanics with SaaS, but every shipment has real product, fulfillment, and shipping cost — so contribution margin is much lower and inventory and cash timing matter far more.',
      },
      {
        q: 'What churn rate is normal for a subscription box?',
        a: 'Physical subscription boxes typically see 5–10% monthly churn — higher than software — so acquisition efficiency and early-cohort retention are critical.',
      },
    ],
  },
];

export const getTemplate = (slug) => TEMPLATES.find((t) => t.slug === slug) || null;
