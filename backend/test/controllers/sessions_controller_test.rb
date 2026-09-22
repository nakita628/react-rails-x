require "test_helper"

class SessionsControllerTest < ActionDispatch::IntegrationTest
  openapi!

  test "正しいパスワードでサインインするとセッション cookie が付く" do
    post "/api/session", params: { username: "alice", password: PASSWORD }, as: :json
    assert_response :ok
    assert_equal "alice", response.parsed_body["username"]
    assert cookies["session_id"].present?
  end

  test "プロフィール画像のあるユーザーでサインインする" do
    post "/api/session", params: { username: "bob", password: PASSWORD }, as: :json
    assert_response :ok
    assert_equal "/api/media/avatars/fixture.png", response.parsed_body["profileImg"]
  end

  test "間違ったパスワードでは 401" do
    post "/api/session", params: { username: "alice", password: "wrong" }, as: :json
    assert_response :unauthorized
    assert_equal "application/problem+json", response.media_type
  end

  test "サインアウトするとセッションが終わる" do
    sign_in_as users(:alice)
    delete "/api/session"
    assert_response :no_content

    get "/api/profile"
    assert_response :unauthorized
  end

  test "セッションなしのサインアウトは 401" do
    delete "/api/session"
    assert_response :unauthorized
  end
end
