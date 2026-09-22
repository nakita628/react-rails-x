require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "正しいユーザー名・表示名・メールアドレス・パスワードで登録できる" do
    user = User.new(username: "dave", full_name: "Dave", email_address: " Dave@Example.com ", password: PASSWORD)
    assert user.save
    assert_equal "dave@example.com", user.email_address
    assert user.authenticate(PASSWORD)
  end

  test "破った規則ごとにメッセージを返す" do
    user = User.new(username: "bad name", full_name: "", email_address: "nope", password: "123")
    assert_not user.valid?
    assert_equal [
      "Username must be 15 characters or fewer and contain only letters, digits, and underscores",
      "Full name can't be blank",
      "Email address must be a valid email address",
      "Password must be at least 6 characters"
    ], user.errors.full_messages
  end

  test "ユーザー名とメールアドレスは一意" do
    user = User.new(username: "alice", full_name: "A", email_address: "ALICE@example.com", password: PASSWORD)
    assert_not user.valid?
    assert user.errors.of_kind?(:username, :taken)
    assert user.errors.of_kind?(:email_address, :taken)
  end

  test "パスワードは 72 文字以内" do
    user = users(:alice)
    user.password = "x" * 73
    assert_not user.valid?
    assert_equal [ "Password must be 72 characters or fewer" ], user.errors.full_messages
  end

  test "リンクは 100 文字以内の http(s) URL か空" do
    user = users(:alice)
    user.link = "javascript:alert(1)"
    assert_not user.valid?
    assert_equal [ "Link must be a URL starting with http:// or https://" ], user.errors.full_messages

    user.link = "https://#{"a" * 100}"
    assert_not user.valid?
    assert_equal [ "Link must be 100 characters or fewer" ], user.errors.full_messages

    user.link = ""
    assert user.valid?
  end

  test "プロフィール画像とカバー画像は小さなラスター画像に限る" do
    user = users(:alice)
    user.cover_img = Rack::Test::UploadedFile.new(Rails.root.join("Gemfile"), "text/plain")
    assert_not user.valid?
    assert_equal [ "Cover image must be PNG, JPEG, WebP, or GIF" ], user.errors.full_messages
  end

  test "ユーザーを消すと投稿・セッション・フォロー・通知も消える" do
    alice = users(:alice)
    alice.sessions.create!
    assert_difference({ "Post.count" => -1, "Session.count" => -1, "Follow.count" => -1, "Notification.count" => -2 }) do
      alice.destroy!
    end
  end
end
