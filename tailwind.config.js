/** @type {import('tailwindcss').Config} */
// Brand tokens here MUST mirror `src/brand/theme.js` (the `C` object), which is
// the canonical source of truth used by the app's inline styles and nav. The
// app's real brand is a clean emerald + slate system; the old warm beige/brown
// "koala" palette that previously lived here was stale and unused. Keep these
// two files in sync — if you change a brand color, change it in both places.
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        koala: {
          bg: '#F8FAFC',         // slate-50 — page background
          bgWarm: '#F1F5F9',     // slate-100 — subtle alternate
          surface: '#FFFFFF',    // cards / tables
          surfaceAlt: '#F8FAFC', // nested surface
          border: '#E2E8F0',     // slate-200
          ink: '#0F172A',        // slate-900 — primary text
          ink2: '#334155',       // slate-700 — secondary text
          muted: '#64748B',      // slate-500
          faint: '#94A3B8',      // slate-400
          green: '#059669',      // emerald-600 — positive values
          greenSoft: '#ECFDF5',  // emerald-50
          rust: '#DC2626',       // red-600 — negative values
          rustSoft: '#FEF2F2',   // red-50
          gold: '#10B981',       // emerald-500 — primary brand accent
          blue: '#2563EB',       // blue-600 — secondary accent (charts)
        },
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "'Inter'", 'system-ui', 'sans-serif'],
        body: ["'Inter'", 'system-ui', 'sans-serif'],
        num: ["'JetBrains Mono'", 'monospace'],
      },
    },
  },
  plugins: [],
};
