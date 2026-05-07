import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'desmex-red':       '#B71C1C',
        'desmex-red-dark':  '#7F0000',
        'desmex-red-light': '#E53935',
        'desmex-bg':        '#FAF8F5',
        'desmex-border':    '#E8E2D9',
      },
    },
  },
  plugins: [],
};
export default config;
