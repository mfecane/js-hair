const path = require('path')

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/js-hair/',
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
      components: path.resolve(__dirname, 'src/components'),
      styles: path.resolve(__dirname, 'src/styles'),
      assets: path.resolve(__dirname, 'assets'),
      css: path.resolve(__dirname, 'src/css'),
    },
  },
  build: {
    chunkSizeWarningLimit: 10000
  }
})
