/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /** Plus Jakarta / Playfair weights: see Google Fonts link in `index.html`. */
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#FF5500',
          light: '#FF8833',
          dark: '#c73d00',
        },
        /** Warm neutrals for marketing home (stone-aligned, single family). */
        home: {
          paper: '#faf8f5',
          surface: '#FAFAF9',
          surfaceMuted: '#F5F5F4',
          ink: '#0c0a09',
          slab: '#0a0c12',
          slabElevated: '#0d1018',
        },
      },
      boxShadow: {
        /** Premium elevation system — thin lift + soft diffuse (avoid border+shadow clash). */
        'elevated-sm': '0 4px 24px -12px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        elevated:
          '0 20px 50px -28px rgba(15, 23, 42, 0.09), 0 4px 14px -6px rgba(15, 23, 42, 0.04)',
        'elevated-hover':
          '0 28px 60px -24px rgba(15, 23, 42, 0.11), 0 8px 20px -8px rgba(15, 23, 42, 0.05)',
        'elevated-bento':
          '0 12px 40px -28px rgba(15, 23, 42, 0.07), 0 2px 8px -4px rgba(15, 23, 42, 0.03)',
        'elevated-bento-hover':
          '0 24px 50px -22px rgba(255, 85, 0, 0.09), 0 8px 20px -10px rgba(15, 23, 42, 0.05)',
        'elevated-dark': '0 40px 100px -36px rgba(0, 0, 0, 0.82)',
        'elevated-glass': '0 32px 80px -28px rgba(0, 0, 0, 0.75)',
        'elevated-cta': '0 32px 80px -28px rgba(255, 85, 0, 0.38)',
        'elevated-faq': '0 4px 24px -12px rgba(15, 23, 42, 0.06)',
        'elevated-faq-open': '0 16px 40px -18px rgba(255, 85, 0, 0.09)',
      },
    },
  },
  plugins: [],
}
