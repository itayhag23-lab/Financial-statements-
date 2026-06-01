/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        koala: {
          bg: '#F4F1E9',
          bgWarm: '#EFEAD9',
          surface: '#FBFAF6',
          surfaceAlt: '#EDE9DD',
          border: '#E0DAC8',
          ink: '#1F1B16',
          ink2: '#4A443A',
          muted: '#857E70',
          faint: '#B5AE9D',
          green: '#3F5C42',
          rust: '#A85332',
          gold: '#B8893E',
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
