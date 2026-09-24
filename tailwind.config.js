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
        aw: {
          bg: '#09090b',
          surface: '#0d0d10',
          card: '#131316',
          cardHover: '#18181c',
          subtle: '#1c1c21',
          border: 'rgba(255, 255, 255, 0.08)',
          borderLight: 'rgba(255, 255, 255, 0.14)',
          borderGlow: 'rgba(253, 54, 110, 0.4)',
          pink: '#fd366e',
          pinkHover: '#f02e65',
          orange: '#fe9567',
          amber: '#f99c00',
          emerald: '#10b981',
          blue: '#3080ff',
          purple: '#818cf8',
          textMuted: '#a1a1aa',
          textBright: '#f4f4f5'
        },
        primary: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#fd366e',
          600: '#f02e65',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Space Grotesk', 'monospace'],
        display: ['Space Grotesk', 'Inter', 'sans-serif']
      },
      boxShadow: {
        'aw-glow': '0 0 25px -4px rgba(253, 54, 110, 0.35)',
        'aw-glow-card': '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
        'aw-glow-amber': '0 0 20px -4px rgba(249, 156, 0, 0.35)',
        'aw-glow-emerald': '0 0 20px -4px rgba(16, 185, 129, 0.35)',
        'aw-button': '0 4px 20px rgba(253, 54, 110, 0.4)'
      },
      backgroundImage: {
        'aw-gradient': 'linear-gradient(135deg, #fd366e 0%, #fe9567 100%)',
        'aw-gradient-hover': 'linear-gradient(135deg, #f02e65 0%, #fd366e 100%)',
        'aw-mesh': 'radial-gradient(circle at 10% 20%, rgba(253, 54, 110, 0.12), transparent 40%), radial-gradient(circle at 90% 10%, rgba(254, 149, 103, 0.1), transparent 35%), radial-gradient(circle at 50% 80%, rgba(129, 140, 248, 0.08), transparent 45%)',
        'aw-grid': 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)'
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem'
      }
    },
  },
  plugins: [],
}
