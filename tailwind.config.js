/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '420px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0ebff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#0f172a',
          gold: '#c59b27',
          'gold-dark': '#9b7617',
          'gold-light': '#fdf6e2'
        },
        status: {
          available: {
            bg: '#ecfdf5',
            border: '#10b981',
            text: '#065f46',
            ribbon: '#059669'
          },
          occupied: {
            bg: '#fff1f2',
            border: '#f43f5e',
            text: '#9f1239',
            ribbon: '#e11d48'
          },
          reserved: {
            bg: '#fffbeb',
            border: '#f59e0b',
            text: '#92400e',
            ribbon: '#d97706'
          },
          cleaning: {
            bg: '#f8fafc',
            border: '#94a3b8',
            text: '#334155',
            ribbon: '#64748b'
          },
          maintenance: {
            bg: '#f4f4f5',
            border: '#71717a',
            text: '#27272a',
            ribbon: '#52525b'
          },
          checkoutdue: {
            bg: '#faf5ff',
            border: '#a855f7',
            text: '#6b21a8',
            ribbon: '#9333ea'
          }
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'luxury': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'luxury-hover': '0 20px 30px -10px rgba(15, 23, 42, 0.14), 0 10px 15px -5px rgba(15, 23, 42, 0.08)',
        'card-tile': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)'
      }
    },
  },
  plugins: [],
}
