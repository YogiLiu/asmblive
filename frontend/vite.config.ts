import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import path from 'path'

export default defineConfig({
  plugins: [solid()],
  css: {
    postcss: {
      plugins: [autoprefixer, tailwindcss],
    },
  },
  resolve: {
    alias: {
      wails: path.resolve(__dirname, 'wailsjs'),
    },
  },
})
