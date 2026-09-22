require "test_helper"

# OpenAPI 文書には含めない（openapi! を付けない）。JSON でないボディに何が返るか。
class MalformedJsonTest < ActionDispatch::IntegrationTest
  test "JSON でない本文は 400 の problem document になる" do
    post "/api/session", params: '{"username": ', headers: { "Content-Type" => "application/json" }
    assert_response :bad_request
    assert_equal "application/problem+json", response.media_type
    assert_equal "The request body is not valid JSON", response.parsed_body["detail"]
  end
end
