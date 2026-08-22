/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Primary: Deep trustworthy green ─────────────────────────────────
        green: {
          950: '#0f2a07',
          900: '#1e4d10',
          800: '#255e13',
          700: '#2d6018',
          600: '#3a7a1f',
          500: '#4a8f28',
          400: '#6aab3e',
          300: '#8dc468',
          200: '#b8dda0',
          100: '#dff0d2',
          50:  '#f0f7eb',
          25:  '#f6faf2',
        },
        // ── Accent: Warm orange — CTAs only ─────────────────────────────────
        orange: {
          900: '#7c3200',
          800: '#a34200',
          700: '#c96a10',
          600: '#e87c1e',
          500: '#f09444',
          400: '#f5aa6a',
          300: '#f8c294',
          200: '#fbd9bb',
          100: '#fdeedd',
          50:  '#fef6ed',
        },
        // ── Neutrals: Warm charcoal and cream ───────────────────────────────
        ink: {
          DEFAULT: '#1a1a1a',
          90: '#2a2a2a',
          80: '#3a3a3a',
          70: '#4f4f4f',
          60: '#666666',
          50: '#808080',
          40: '#9a9a9a',
          30: '#b3b3b3',
          20: '#cccccc',
          10: '#e5e5e5',
          5:  '#f2f2f0',
        },
        cream: {
          DEFAULT: '#fafaf8',
          warm:    '#f5f4ef',
          ivory:   '#f0ede4',
          sand:    '#e8e3d8',
          mid:     '#d4cfc2',
        },
        // ── Status colors ────────────────────────────────────────────────────
        status: {
          success:  '#16a34a',  // Soft green — funded, released, active
          pending:  '#d97706',  // Amber — waiting, in review
          warning:  '#ea580c',  // Deep orange — attention needed
          danger:   '#dc2626',  // Red — failed, rejected, cancelled
          info:     '#0891b2',  // Teal-blue — informational
          neutral:  '#6b7280',  // Muted grey — draft, inactive
        },
        // ── Legacy aliases (backward compat) ─────────────────────────────────
        brand: {
          green: {
            DEFAULT: '#3a7a1f',
            dark:    '#2d6018',
            mid:     '#4a8f28',
            light:   '#6aab3e',
            pale:    '#eef6e8',
            faint:   '#f6faf2',
          },
          orange: {
            DEFAULT: '#e87c1e',
            dark:    '#c96a10',
            light:   '#f09444',
            pale:    '#fef3e8',
          },
          charcoal: '#1a1a1a',
          offwhite: '#fafaf8',
          ivory:    '#f5f4ef',
          warm:     '#f0ede4',
        },
      },
      fontFamily: {
        sans:    ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        // 8px base unit multiples
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        card:   '0 1px 3px rgba(26,26,26,0.06), 0 1px 2px rgba(26,26,26,0.04)',
        'card-hover': '0 4px 16px rgba(26,26,26,0.10), 0 1px 4px rgba(26,26,26,0.06)',
        panel:  '0 8px 40px rgba(26,26,26,0.10)',
        float:  '0 16px 56px rgba(26,26,26,0.14)',
      },
      animation: {
        'fade-up':    'fadeUp 0.8s ease both',
        'fade-in':    'fadeIn 0.6s ease both',
        'float':      'float 7s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow':  'spin 20s linear infinite',
        'scale-in':   'scaleIn 0.18s ease both',
        'shimmer':    'shimmer 1.6s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
