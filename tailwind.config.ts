import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        fighting: ['Bebas Neue', 'Impact', 'Arial Black', 'sans-serif'],
        condensed: ['Barlow Condensed', 'Arial Narrow', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
