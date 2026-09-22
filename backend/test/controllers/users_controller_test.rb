require "test_helper"

class UsersControllerTest < ActionDispatch::IntegrationTest
  openapi!

  test "サインアップするとユーザーが作られ、サインイン状態になる" do
    assert_difference "User.count" do
      post "/api/users", params: { username: "dave", fullName: "Dave", emailAddress: "Dave@Example.com", password: PASSWORD }, as: :json
    end
    assert_response :created
    assert_equal "dave@example.com", response.parsed_body["emailAddress"]
    assert cookies["session_id"].present?
  end

  test "使われているユーザー名やメールアドレスでのサインアップは 409" do
    post "/api/users", params: { username: "alice", fullName: "Alice", emailAddress: "new@example.com", password: PASSWORD }, as: :json
    assert_response :conflict
  end

  test "不正な項目でサインアップすると項目ごとに列挙される" do
    post "/api/users", params: { username: "bad name", fullName: "", emailAddress: "nope", password: "123" }, as: :json
    assert_response :unprocessable_content
    assert_equal [
      [ "username", "Username must be 15 characters or fewer and contain only letters, digits, and underscores" ],
      [ "fullName", "Full name can't be blank" ],
      [ "emailAddress", "Email address must be a valid email address" ],
      [ "password", "Password must be at least 6 characters" ]
    ], problem_errors
  end

  test "おすすめユーザーには自分とフォロー済みの人が含まれない" do
    sign_in_as users(:alice)
    get "/api/users/suggested"
    assert_response :ok
    assert_equal [ [ "carol", "/api/media/avatars/fixture.png" ] ], response.parsed_body.map { [ it["username"], it["profileImg"] ] }

    sign_in_as users(:carol)
    get "/api/users/suggested"
    assert_equal [ [ "alice", nil ], [ "bob", "/api/media/avatars/fixture.png" ] ], response.parsed_body.map { [ it["username"], it["profileImg"] ] }.sort
  end

  test "おすすめユーザーにはサインインが要る" do
    get "/api/users/suggested"
    assert_response :unauthorized
  end

  test "プロフィールにはフォロー数と、自分がフォローしているかが載る" do
    sign_in_as users(:alice)
    get "/api/users/bob"
    assert_response :ok
    assert_equal({ "followersCount" => 1, "followingCount" => 0, "isFollowing" => true }, response.parsed_body.slice("followersCount", "followingCount", "isFollowing"))
  end

  test "画像のないプロフィール" do
    sign_in_as users(:bob)
    get "/api/users/alice"
    assert_response :ok
    assert_equal({ "profileImg" => nil, "coverImg" => nil, "isFollowing" => false }, response.parsed_body.slice("profileImg", "coverImg", "isFollowing"))
  end

  test "存在しないユーザー名は 404" do
    sign_in_as users(:alice)
    get "/api/users/nobody"
    assert_response :not_found
  end
end
