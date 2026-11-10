import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { chunkSizeWarningLimit: 600 },
  server: {
    proxy: {
      // Same-origin /api in development: keeps the session cookies first-party.
      '/api': {
        target: 'https://ts.idicorp.ir',
        changeOrigin: true,
        cookieDomainRewrite: '',
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
