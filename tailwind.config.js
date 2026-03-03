/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Inter var', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'Segoe UI', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        brand: '0 20px 45px rgba(15, 23, 42, 0.15)',
        card: '0 10px 35px rgba(15, 23, 42, 0.08)'
      },
      backgroundImage: {
        'mesh-primary': 'radial-gradient(circle at 20% 20%, rgba(14,165,233,0.35), transparent 45%), radial-gradient(circle at 80% 0%, rgba(129,140,248,0.25), transparent 40%), radial-gradient(circle at 0% 80%, rgba(16,185,129,0.25), transparent 40%)',
        'grid-slate': 'linear-gradient(transparent 24px, rgba(15,23,42,.04) 25px), linear-gradient(90deg, transparent 24px, rgba(15,23,42,.04) 25px)'
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.5rem'
      }
    },
  },
  plugins: [],
}
