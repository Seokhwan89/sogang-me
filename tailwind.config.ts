import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './content/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sg: {
          red: 'var(--sg-red)',
          deep: 'var(--sg-red-deep)',
          ink: 'var(--sg-ink)',
          steel: 'var(--sg-steel)',
          line: 'var(--sg-line)',
          paper: 'var(--sg-paper)',
          mist: 'var(--sg-mist)',
        },
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: { site: '1240px' },
    },
  },
  plugins: [],
};
export default config;
