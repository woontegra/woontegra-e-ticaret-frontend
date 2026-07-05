/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'theme-bg': 'rgb(var(--color-background) / <alpha-value>)',
        'theme-surface': 'rgb(var(--color-surface) / <alpha-value>)',
        'theme-text': 'rgb(var(--color-text) / <alpha-value>)',
        'theme-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
        'theme-border': 'rgb(var(--color-border) / <alpha-value>)',
      },
      maxWidth: {
        theme: 'var(--theme-container-width)',
      },
      width: {
        sidebar: 'var(--sidebar-width)',
      },
      fontFamily: {
        theme: 'var(--theme-font-body)',
        'theme-heading': 'var(--theme-font-heading)',
      },
    },
  },
  plugins: [],
};
