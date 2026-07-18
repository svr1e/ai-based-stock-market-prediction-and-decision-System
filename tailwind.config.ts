/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        neon: {
          blue: '#00E5FF',
          purple: '#7B2FFF',
          green: '#00FF88',
          pink: '#FF0080',
          orange: '#FF6B35',
        },
        dark: {
          900: '#050816',
          800: '#0A0F1E',
          700: '#0D1528',
          600: '#111827',
          500: '#1a2035',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cyber-grid': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300E5FF' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'ticker': 'ticker 30s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-right': 'slideRight 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px #00E5FF, 0 0 40px #00E5FF' },
          '50%': { opacity: '0.7', boxShadow: '0 0 10px #00E5FF' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px #00E5FF, 0 0 20px #00E5FF, 0 0 40px #00E5FF' },
          '50%': { boxShadow: '0 0 10px #00E5FF, 0 0 30px #00E5FF, 0 0 60px #00E5FF' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        ticker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        neon: '0 0 20px rgba(0, 229, 255, 0.5)',
        'neon-lg': '0 0 40px rgba(0, 229, 255, 0.4), 0 0 80px rgba(0, 229, 255, 0.2)',
        'neon-purple': '0 0 20px rgba(123, 47, 255, 0.5)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.5)',
        'neon-pink': '0 0 20px rgba(255, 0, 128, 0.5)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        card: '0 4px 24px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}
