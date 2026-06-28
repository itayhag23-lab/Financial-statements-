// AI ModelDraft contract + validation.
// Never apply raw AI output directly — always parse + validate first,
// then expand through the existing seed/compute path.

export const VALID_SECTOR_KEYS = [
  'coffeeshop','restaurant','foodtruck','ecommerce','retail',
  'carwash','vending','gym','consulting','saas','mobileapp',
  'contentcreator','agency','manufacturing','other',
];
export const VALID_REGION_KEYS  = ['us','il','uk','eu','ca','au','sg','ae','other'];
export const VALID_STMT_KEYS    = ['incomeOnly','incomeAndCF','full'];
export const VALID_MODES        = ['manual','flatGrowth','customGrowth','percentOfRevenue'];

// Strip markdown fences and extract the first JSON object from an LLM response.
export function parseModelDraftJSON(raw) {
  if (!raw || typeof raw !== 'string') throw new Error('Empty response from AI');
  const stripped = raw
    .replace(/^```json\s*/im, '').replace(/^```\s*/im, '').replace(/```\s*$/m, '').trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object found in AI response');
  return JSON.parse(match[0]);
}

// Validate and sanitize a ModelDraft from the AI.
// Returns { valid: true, draft } | { valid: false, error: string }.
// Numbers are clamped — never reject a structurally sound draft over range.
export function validateModelDraft(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    return { valid: false, error: 'Draft must be a JSON object' };

  const sectorKey = raw.sectorKey;
  if (!VALID_SECTOR_KEYS.includes(sectorKey))
    return { valid: false, error: `Unknown sectorKey "${sectorKey}"` };

  const regionKey  = VALID_REGION_KEYS.includes(raw.regionKey)  ? raw.regionKey  : 'us';
  const statements = VALID_STMT_KEYS.includes(raw.statements)   ? raw.statements : 'incomeOnly';
  const rationale  = typeof raw.rationale === 'string' ? raw.rationale.slice(0, 600) : '';

  const overrides = [];
  if (Array.isArray(raw.overrides)) {
    for (const ov of raw.overrides.slice(0, 30)) {
      if (typeof ov.rowId !== 'string' || !ov.rowId) continue;
      const c = { rowId: String(ov.rowId).slice(0, 40) };
      if (ov.mode && VALID_MODES.includes(ov.mode)) c.mode = ov.mode;
      if (ov.baseValue  !== undefined) c.baseValue  = Math.max(0,    Math.min(50_000_000, Number(ov.baseValue)  || 0));
      if (ov.flatRate   !== undefined) c.flatRate   = Math.max(-99,  Math.min(999,        Number(ov.flatRate)   || 0));
      if (ov.pctOfRev   !== undefined) c.pctOfRev   = Math.max(0,    Math.min(300,        Number(ov.pctOfRev)   || 0));
      if (Array.isArray(ov.manualValues))
        c.manualValues = ov.manualValues.slice(0, 20).map(v => Math.max(-50_000_000, Math.min(50_000_000, Number(v) || 0)));
      overrides.push(c);
    }
  }

  return { valid: true, draft: { sectorKey, regionKey, statements, rationale, overrides } };
}

// System prompt for the "describe your business → model" feature.
// The AI must respond with ONLY raw JSON — no prose, no fences.
export const MODEL_GEN_SYSTEM_PROMPT = `You are an expert financial modeler. Given a business description, respond with ONLY a JSON object — no prose, no markdown, no code fences. Raw JSON only.

Schema:
{
  "sectorKey": "coffeeshop|restaurant|foodtruck|ecommerce|retail|carwash|vending|gym|consulting|saas|mobileapp|contentcreator|agency|manufacturing|other",
  "regionKey": "us|il|uk|eu|ca|au|sg|ae|other",
  "statements": "incomeOnly|incomeAndCF|full",
  "rationale": "1-2 sentences: why this sector, and how you set the key numbers",
  "overrides": [
    {"rowId": "rev-ops",     "mode": "flatGrowth",       "baseValue": 600, "flatRate": 25},
    {"rowId": "cogs-direct", "mode": "percentOfRevenue",  "pctOfRev": 35},
    {"rowId": "opex-sm",     "mode": "percentOfRevenue",  "pctOfRev": 15},
    {"rowId": "opex-ga",     "mode": "flatGrowth",        "baseValue": 120, "flatRate": 12}
  ]
}

Rules:
- baseValue is in thousands of local currency (600 = $600K/yr, not $600)
- For MRR hints: annualise MRR × 12, convert to thousands (e.g. $30K MRR → $360K ARR → baseValue 360)
- flatRate is annual % growth (20 = 20 %/yr)
- pctOfRev is % of revenue (35 = 35 %)
- Valid override rowIds: rev-ops, cogs-direct, opex-sm, opex-ga, opex-rd, tax
- statements: "full" for mature, "incomeAndCF" for growth-stage, "incomeOnly" for early/idea
- regionKey: detect country from description; default "us"
- PROFITABILITY (important): the numbers describe the BASE (realistic) case, which must be
  profitable in year 1. Keep total first-year operating costs below gross profit. Concretely:
  cogs pctOfRev + opex-sm pctOfRev should leave a positive gross/operating margin, and the sum of
  ALL absolute opex baseValues (opex-ga + opex-rd) must be LESS than first-year gross profit
  (gross profit ≈ rev-ops.baseValue × (1 − cogs-direct.pctOfRev/100)). If unsure, size opex-ga at
  20–35% of first-year revenue and keep opex-rd modest so Net Income year 1 is clearly positive.
- Respond with ONLY the JSON object. Nothing else.`;

// System prompt addition for what-if patch suggestions (appended to advisor prompt).
export const WHATIF_PATCH_ADDENDUM = `
If the user asks "what if", "what would happen if", or proposes a specific operational change:
1. Analyse the impact concisely.
2. End your response with a patch block (MANDATORY for what-if questions):
\`\`\`patch
[{"rowId":"opex-ga","field":"baseValue","newValue":520},{"rowId":"opex-sm","field":"pctOfRev","newValue":22}]
\`\`\`
Valid rowIds: rev-ops, cogs-direct, opex-sm, opex-ga, opex-rd, tax
Valid fields: baseValue, flatRate, pctOfRev
The patch block will be shown as an Apply / Discard diff — do not explain it, just include it.`;
