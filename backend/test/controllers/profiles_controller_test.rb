require "test_helper"

class ProfilesControllerTest < ActionDispatch::IntegrationTest
  openapi!

  test "サインイン中ユーザー自身のプロフィール" do
    sign_in_as users(:alice)
    get "/api/profile"
    assert_response :ok
    assert_equal "alice@example.com", response.parsed_body["emailAddress"]
  end

  test "プロフィールにはプロフィール画像とカバー画像の URL が載る" do
    sign_in_as users(:bob)
    get "/api/profile"
    assert_response :ok
    assert_equal({ "profileImg" => "/api/media/avatars/fixture.png", "coverImg" => "/api/media/covers/fixture.png" },
                 response.parsed_body.slice("profileImg", "coverImg"))
  end

  test "プロフィールにはサインインが要る" do
    get "/api/profile"
    assert_response :unauthorized
  end

  test "表示名・自己紹介・リンク・プロフィール画像・パスワードを更新する" do
    sign_in_as users(:alice)
    patch "/api/profile", params: { fullName: "Alice B", bio: "hi", link: "https://example.com", profileImg: pixel,
                                    currentPassword: PASSWORD, newPassword: "secret456" }
    assert_response :ok
    assert_equal({ "fullName" => "Alice B", "bio" => "hi", "link" => "https://example.com" }, response.parsed_body.slice("fullName", "bio", "link"))
    assert_match %r{\A/api/media/avatars/[a-z0-9]+\.png\z}, response.parsed_body["profileImg"]
    assert users(:alice).reload.authenticate("secret456")
  end

  test "画像だけ更新する" do
    sign_in_as users(:alice)
    patch "/api/profile", params: { profileImg: pixel, coverImg: pixel }
    assert_response :ok
    assert_match %r{\A/api/media/covers/[a-z0-9]+\.png\z}, response.parsed_body["coverImg"]
  end

  test "パスワードだけ更新する" do
    sign_in_as users(:alice)
    patch "/api/profile", params: { currentPassword: PASSWORD, newPassword: "secret456" }
    assert_response :ok
    assert users(:alice).reload.authenticate("secret456")
  end

  test "表示名だけ更新する" do
    sign_in_as users(:alice)
    patch "/api/profile", params: { fullName: "Alice B" }
    assert_response :ok
    assert_equal "Alice B", response.parsed_body["fullName"]
  end

  test "パスワード変更には現在のパスワードが要る" do
    sign_in_as users(:alice)
    patch "/api/profile", params: { currentPassword: "wrong", newPassword: "secret456" }
    assert_response :unauthorized
  end

  test "不正な項目で更新すると項目ごとに列挙される" do
    sign_in_as users(:alice)
    patch "/api/profile", params: { link: "javascript:alert(1)", currentPassword: PASSWORD, newPassword: "x" * 73,
                                    coverImg: fixture_file_upload("not_an_image.txt", "text/plain") }
    assert_response :unprocessable_content
    assert_equal [
      [ "link", "Link must be a URL starting with http:// or https://" ],
      [ "coverImg", "Cover image must be PNG, JPEG, WebP, or GIF" ],
      [ "password", "Password must be 72 characters or fewer" ]
    ].sort, problem_errors.sort
  end

  test "アカウントを削除すると関連データも消え、セッションが終わる" do
    sign_in_as users(:alice)
    assert_difference [ "User.count", "Post.count" ], -1 do
      delete "/api/profile"
    end
    assert_response :no_content

    get "/api/profile"
    assert_response :unauthorized
  end

  test "アカウント削除にはサインインが要る" do
    delete "/api/profile"
    assert_response :unauthorized
  end
end
