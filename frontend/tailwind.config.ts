import type { Config } from 'tailwindcss'
import daisyui from 'daisyui'
import { addIconSelectors } from '@iconify/tailwind'
import aspectRatio from '@tailwindcss/aspect-ratio'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {},
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [addIconSelectors(['ph']), daisyui, aspectRatio],
} satisfies Config
