import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'

export default defineConfig({
  plugins: [solid()],
  css: {
    postcss: {
      plugins: [autoprefixer, tailwindcss],
    },
  },
})
