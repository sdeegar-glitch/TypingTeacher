/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Playwright drives a real browser and owns everything under e2e/. Vitest
    // must not try to run those specs in jsdom.
    exclude: ['node_modules/**', 'dist/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Only the code that tests actually target. Reporting coverage across 50
      // untested legacy pages would produce a number nobody acts on.
      include: ['src/lib/**', 'src/components/ReferralCard.tsx', 'src/components/StreakCard.tsx'],
    },
  },
})
