import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.js'],
    // Exclude Playwright E2E tests from Vitest - they use @playwright/test
    exclude: [
      'node_modules/**',
      '**/*.e2e.test.js',
      '**/*.e2e.test.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        'wailsjs/',
        '*.config.js'
      ]
    },
    testTimeout: 10000,
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@wailsjs': path.resolve(__dirname, './wailsjs')
    }
  }
})