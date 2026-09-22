import { defineConfig } from '@playwright/test'

// e2e 専用に Rails（:3001、storage/e2e.sqlite3）と Vite（:5174）を起動する。
// `make dev` の :3000 / :5173 とは別なので、開発中のデータベースを汚さない。
const API_PORT = 3001
const PORT = 5174
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  use: { baseURL },
  webServer: [
    {
      command: [
        'cd ../backend',
        'rm -f storage/e2e.sqlite3',
        'pnpm prisma db push --url file:./storage/e2e.sqlite3',
        `DATABASE_URL=sqlite3:storage/e2e.sqlite3 bin/rails server -p ${API_PORT}`,
      ].join(' && '),
      url: `http://localhost:${API_PORT}/up`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `API_URL=http://localhost:${API_PORT} vp dev --port ${PORT}`,
      url: baseURL,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})
