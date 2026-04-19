/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f6f7fb',
          100: '#eceef5',
          200: '#d6dae8',
          300: '#b2b9d0',
          400: '#7f89a8',
          500: '#515a7a',
          600: '#3a4260',
          700: '#2a3049',
          800: '#1b1f33',
          900: '#0f1122',
        },
      },
      boxShadow: {
        glow: '0 20px 60px -20px rgba(124, 58, 237, 0.45)',
        card: '0 10px 40px -12px rgba(15, 17, 34, 0.12)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
