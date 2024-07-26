import type { Config } from 'tailwindcss'
import daisyui from 'daisyui'
import { addIconSelectors } from '@iconify/tailwind'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [addIconSelectors(['ph']), daisyui],
} satisfies Config
