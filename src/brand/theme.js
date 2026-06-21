// Koala Statements — shared design tokens.
// Single source of truth for the clean, professional light UI used across the
// app (inline styles) and the marketing site / nav. Dark surfaces are reserved
// for the Home page sections only; everything else is light.
export const C = {
  bg: '#F8FAFC',          // slate-50 — page background
  bgWarm: '#F1F5F9',      // slate-100 — subtle alternate
  surface: '#FFFFFF',     // cards / tables
  surfaceAlt: '#F8FAFC',  // nested surface
  border: '#E2E8F0',      // slate-200
  borderSoft: 'rgba(226,232,240,0.65)',
  ink: '#0F172A',         // slate-900 — primary text
  ink2: '#334155',        // slate-700 — secondary text
  muted: '#64748B',       // slate-500
  faint: '#94A3B8',       // slate-400
  green: '#059669',       // emerald-600 — positive values
  greenSoft: '#ECFDF5',   // emerald-50
  rust: '#DC2626',        // red-600 — negative values
  rustSoft: '#FEF2F2',    // red-50
  gold: '#10B981',        // emerald-500 — primary brand accent
  goldSoft: 'rgba(16,185,129,0.10)',
  blue: '#2563EB',        // blue-600 — secondary accent (charts)
  blueSoft: 'rgba(37,99,235,0.10)',
};

export const FONTS = {
  display: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
  num: "'JetBrains Mono', monospace",
};

export default C;
