import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite-plus'

// 生成物は fmt も lint もしない。
const generated = ['**/*.gen.ts', 'src/api/schema.d.ts']

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: { tsconfigPaths: true },
  server: {
    // 全インターフェースで待ち受ける（`vite --host` と同じ）。dev container の外のブラウザから
    // ポートに届くようにするため。
    host: true,
    port: 5173,
    // Rails API（bin/rails server）が :3000 で /api に応える。同一オリジンなのでセッション cookie がそのまま効く。
    // e2e は別ポートの Rails を API_URL で指す。
    proxy: { '/api': process.env.API_URL ?? 'http://localhost:3000' },
  },
  // `vp fmt`（oxfmt）と `vp lint`（oxlint）。`vp check` は両方と型検査をまとめて実行する。
  fmt: {
    ignorePatterns: generated,
    printWidth: 100,
    singleQuote: true,
    semi: false,
    sortPackageJson: true,
    sortImports: {},
    sortTailwindcss: { stylesheet: './src/style.css' },
  },
  lint: {
    ignorePatterns: generated,
    options: { typeAware: true, typeCheck: true },
  },
})
