/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1C3F7A',
          navyDark: '#162F5F',
          gold: '#F5A800',
          goldDark: '#D4900A',
          teal: '#0891B2',
          tealLight: '#E0F2FE',
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          500: '#6B7280',
          700: '#374151',
          900: '#111827',
        },
        error: '#DC2626',
        success: '#16A34A',
        warning: '#D97706',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-l': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '700' }],
        'display-m': ['1.875rem', { lineHeight: '1.25', fontWeight: '700' }],
      },
      borderRadius: {
        blob: '40% 60% 60% 40% / 40% 40% 60% 60%',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        dropdown: '0 10px 15px -3px rgb(0 0 0 / 0.12), 0 4px 6px -4px rgb(0 0 0 / 0.08)',
        modal: '0 25px 50px -12px rgb(0 0 0 / 0.3)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-out-right': {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(100%)' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'navbar-drop': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-ring': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.85' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-out-right': 'slide-out-right 0.3s cubic-bezier(0.55, 0, 1, 0.45) both',
        'count-up': 'count-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'navbar-drop': 'navbar-drop 0.3s ease-out both',
        'spin-slow': 'spin-slow 1s linear infinite',
        'pulse-ring': 'pulse-ring 2s ease-in-out infinite',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
        'ease-in-strong': 'cubic-bezier(0.55, 0, 1, 0.45)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '450': '450ms',
      },
    },
  },
  plugins: [],
};