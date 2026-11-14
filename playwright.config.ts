import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/browser',
  use: { baseURL: 'http://127.0.0.1:4301', channel: 'msedge', headless: true },
  webServer: {
    command: 'npm run dev -- --strictPort',
    url: 'http://127.0.0.1:4301',
    reuseExistingServer: false,
  },
})
