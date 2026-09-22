.PHONY: dev backend frontend setup test e2e format generate

# Rails API（:3000）と Vite の dev サーバー（:5173）を同時に起動する。Ctrl-C で両方止まる。
dev:
	$(MAKE) -j2 backend frontend

backend:
	cd backend && bin/dev

frontend:
	cd frontend && pnpm dev

# 初回セットアップ: gem、node modules、hekireki のモデル生成、SQLite のテーブル、seed。
setup:
	cd backend && bin/setup --seed --skip-server
	cd frontend && pnpm install

test:
	cd backend && bin/rails test && bin/rubocop
	cd frontend && pnpm check

# ブラウザで実際にサインイン / サインアウトする Playwright のテスト。e2e 専用の Rails（:3001）と Vite（:5174）を自動で起動する。
e2e:
	cd frontend && pnpm test:e2e

# 両側を標準のスタイルに整形する: RuboCop（rubocop-rails-omakase）と Vite+（oxfmt + oxlint）。
format:
	cd backend && bin/rubocop -a
	cd frontend && pnpm check --fix

# 生成物をすべて作り直す: app/models と ER.png、OpenAPI 文書、フロントの型。
generate:
	cd backend && pnpm generate && OPENAPI=1 bin/rails test
	cd frontend && pnpm generate
