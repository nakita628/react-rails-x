ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "minitest/mock"
require "rspec/openapi"
require "test_helpers/session_test_helper"

# OPENAPI=1 bin/rails test が、openapi! を宣言した統合テストの実際のリクエストとレスポンスから
# doc/openapi.yaml を書く。フロントの型はこの文書から生成する。
RSpec::OpenAPI.path = "doc/openapi.yaml"
RSpec::OpenAPI.title = "x API"
RSpec::OpenAPI.application_version = "1.0.0"
RSpec::OpenAPI.info = {
  description: "学習用の X（Twitter）クローン。サインインでセッション cookie が発行され、他の操作はそれを必要とする。"
}
RSpec::OpenAPI.servers = [ { url: "http://localhost:3000" } ]
RSpec::OpenAPI.openapi_version = "3.1.0"
# タグはテストクラス名から（PostsControllerTest → posts）
RSpec::OpenAPI.tags_builder = ->(example) { [ example.context.class.name.delete_suffix("ControllerTest").underscore ] }
# createdAt などの時刻は date-time として型付けする
RSpec::OpenAPI.formats_builder = ->(_example, key) { key.to_s.end_with?("At") ? "date-time" : nil }

module ActiveSupport
  class TestCase
    # テーブルは Prisma が作る（pnpm db:push:test）ので、並列実行用にデータベースを複製する
    # Rails の parallelize は使わない。

    # test/fixtures/*.yml をすべて読み込む
    fixtures :all
  end
end

# fixture のユーザーは全員このパスワード
PASSWORD = "secret123".freeze
