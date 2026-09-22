# backend

X クローンの Rails 8.1 API です。フロントエンドとの組み合わせ方は[ルートの README](../README.md) を見てください。

- `schema.prisma` がデータモデルです。`pnpm generate` が hekireki で `app/models`・`../ER.png`・seed 用スキーマを
  書き出し、`pnpm db:push` / `pnpm db:push:test` が SQLite のテーブルを作り、`pnpm seed` が
  `hekireki.config.ts` の行を投入します。`app/models` は生成物なので手で編集しません。
- `spec/requests` は rswag の request spec で、そのまま OpenAPI の文書になります
  （`SWAGGER_DRY_RUN=0 bin/rails rswag:specs:swaggerize` → `swagger/v1/swagger.yaml`。Swagger UI は `/api-docs`）。
  データは `spec/fixtures` の Rails fixtures です。
- `bin/setup --seed` が上の全部を実行してサーバーを起動します。
