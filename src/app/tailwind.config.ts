import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sora: ['var(--font-sora)', 'sans-serif'],
        nunito: ['var(--font-nunito)', 'sans-serif'],
        sans: ['var(--font-sora)', 'sans-serif'],
      },
      colors: {
        // Core dreamy palette
        lumina: {
          // Deep space backgrounds
          void:     '#080612',
          deep:     '#0e0a1f',
          night:    '#100d28',
          dusk:     '#1a1235',
          // Soft purples
          'purple-soft':   '#c4b5fd',
          'purple-dream':  '#a78bfa',
          'purple-glow':   '#8b5cf6',
          'purple-deep':   '#7c3aed',
          // Pinks
          'pink-soft':     '#fbcfe8',
          'pink-dream':    '#f9a8d4',
          'pink-glow':     '#ec4899',
          // Blues
          'blue-soft':     '#bae6fd',
          'blue-dream':    '#7dd3fc',
          'blue-ocean':    '#38bdf8',
          'blue-deep':     '#0284c7',
          // Clouds / whites
          'cloud-white':   'rgba(255,255,255,0.85)',
          'cloud-muted':   'rgba(255,255,255,0.45)',
          'cloud-faint':   'rgba(255,255,255,0.12)',
          'cloud-ghost':   'rgba(255,255,255,0.06)',
        },
        mood: {
          calm:      '#a78bfa',
          drift:     '#60a5fa',
          soft:      '#f9a8d4',
          alive:     '#34d399',
          heavy:     '#6366f1',
          anxious:   '#fb923c',
          joy:       '#fbbf24',
          healing:   '#86efac',
        }
      },
      backgroundImage: {
        // Core app gradients
        'dreamy-night':    'linear-gradient(135deg, #080612 0%, #0e0a1f 30%, #0d1535 65%, #0a0f20 100%)',
        'dreamy-dusk':     'linear-gradient(135deg, #1a0533 0%, #0f1a40 50%, #1a0f30 100%)',
        'aurora-soft':     'linear-gradient(135deg, #a78bfa 0%, #818cf8 40%, #60a5fa 80%, #f9a8d4 100%)',
        'glass-surface':   'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'music-card':      'linear-gradient(135deg, rgba(139,92,246,0.22) 0%, rgba(59,130,246,0.16) 100%)',
        'comfort-glow':    'linear-gradient(135deg, rgba(251,191,206,0.15) 0%, rgba(196,181,253,0.12) 100%)',
        'mood-active':     'linear-gradient(135deg, rgba(167,139,250,0.2) 0%, rgba(139,92,246,0.15) 100%)',
      },
      boxShadow: {
        'glow-purple':  '0 0 30px rgba(139,92,246,0.25), 0 0 60px rgba(139,92,246,0.1)',
        'glow-pink':    '0 0 30px rgba(236,72,153,0.2), 0 0 60px rgba(236,72,153,0.08)',
        'glow-blue':    '0 0 30px rgba(56,189,248,0.2), 0 0 60px rgba(56,189,248,0.08)',
        'glow-soft':    '0 8px 32px rgba(0,0,0,0.4)',
        'glass':        '0 4px 24px rgba(0,0,0,0.3), inset 0 0 0 0.5px rgba(255,255,255,0.1)',
        'glass-hover':  '0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 0.5px rgba(255,255,255,0.18)',
      },
      backdropBlur: {
        xs: '4px',
        '2xl': '24px',
        '3xl': '40px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'float':          'float 6s ease-in-out infinite',
        'float-slow':     'float 9s ease-in-out infinite',
        'pulse-soft':     'pulseSoft 3s ease-in-out infinite',
        'drift-right':    'driftRight 8s ease-in-out infinite',
        'drift-up':       'driftUp 5s linear infinite',
        'shimmer':        'shimmer 2s ease-in-out infinite',
        'breathe':        'breathe 4s ease-in-out infinite',
        'fade-in':        'fadeIn 0.8s ease-out forwards',
        'fade-up':        'fadeUp 0.7s ease-out forwards',
        'orb-drift':      'orbDrift 12s ease-in-out infinite',
        'visualizer':     'visualizer 0.8s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-12px)' },
        },
        pulseSoft: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%':     { opacity: '0.6', transform: 'scale(0.95)' },
        },
        driftRight: {
          '0%,100%': { transform: 'translateX(0px)' },
          '50%':     { transform: 'translateX(20px)' },
        },
        driftUp: {
          '0%':   { transform: 'translateY(0) translateX(0)', opacity: '0' },
          '20%':  { opacity: '1' },
          '80%':  { opacity: '0.6' },
          '100%': { transform: 'translateY(-100px) translateX(var(--dx,10px))', opacity: '0' },
        },
        shimmer: {
          '0%,100%': { opacity: '0.5' },
          '50%':     { opacity: '1' },
        },
        breathe: {
          '0%,100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%':     { transform: 'scale(1.08)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        orbDrift: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%':     { transform: 'translate(30px,-20px) scale(1.05)' },
          '66%':     { transform: 'translate(-20px,25px) scale(0.97)' },
        },
        visualizer: {
          from: { height: 'var(--h-min, 4px)' },
          to:   { height: 'var(--h-max, 20px)' },
        }
      },
      transitionTimingFunction: {
        'dream': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'soft':  'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
}

export default config
