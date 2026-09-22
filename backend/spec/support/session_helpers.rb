# fixture のユーザーは全員このパスワード
PASSWORD = "secret123".freeze

# request spec で API 経由でサインインし、続くリクエストに署名付き session_id cookie を付ける。
module SessionHelpers
  def sign_in_as(user)
    post "/api/session", params: { username: user.username, password: PASSWORD }, as: :json
  end

  # 画像アップロード用の 1x1 PNG
  def pixel
    fixture_file_upload("pixel.png", "image/png")
  end

  # problem document の errors を [field, message] の組で読む
  def problem_errors
    response.parsed_body["errors"].map { [ it["field"], it["message"] ] }
  end
end

RSpec.configure do |config|
  config.include SessionHelpers, type: :request
end
