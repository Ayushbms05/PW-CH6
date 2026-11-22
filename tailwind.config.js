/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
        },
        smog: {
          clear: '#10b981',
          moderate: '#f59e0b',
          unhealthy: '#f97316',
          veryUnhealthy: '#ef4444',
          severe: '#7c3aed',
          hazardous: '#881337',
        }
      },
      fontSize: {
        'xs': ['0.85rem', { lineHeight: '1.35rem' }],   // ~15.3px at 18px base
        'sm': ['0.95rem', { lineHeight: '1.5rem' }],    // ~17.1px at 18px base
        'base': ['1.075rem', { lineHeight: '1.65rem' }],// ~19.3px at 18px base
        'lg': ['1.225rem', { lineHeight: '1.8rem' }],   // ~22px at 18px base
        'xl': ['1.4rem', { lineHeight: '2rem' }],       // ~25.2px at 18px base
        '2xl': ['1.75rem', { lineHeight: '2.25rem' }],  // ~31.5px at 18px base
        '3xl': ['2.2rem', { lineHeight: '2.6rem' }],    // ~39.6px at 18px base
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};
