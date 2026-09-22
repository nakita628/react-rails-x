# backend

X クローンの Rails 8.1 API です。フロントエンドとの組み合わせ方は[ルートの README](../README.md) を見てください。

- `schema.prisma` がデータモデルです。`pnpm generate` が hekireki で `app/models`・`../ER.png`・seed 用スキーマを
  書き出し、`pnpm db:push` / `pnpm db:push:test` が SQLite のテーブルを作り、`pnpm seed` が
  `hekireki.config.ts` の行を投入します。`app/models` は生成物なので手で編集しません。
- `test/` は Rails 標準の Minitest と fixtures です。`test/controllers` の統合テストが実際に受け取ったレスポンスから、
  rspec-openapi が OpenAPI 文書を書き出します（`OPENAPI=1 bin/rails test` → `doc/openapi.yaml`。Swagger UI は `/api-docs`）。
- `bin/setup --seed` が上の全部を実行してサーバーを起動します。
