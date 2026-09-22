require "test_helper"

class FollowsControllerTest < ActionDispatch::IntegrationTest
  openapi!

  setup { sign_in_as users(:alice) }

  test "フォローすると初回だけ相手に通知される" do
    assert_difference "users(:carol).notifications_to.count" do
      post "/api/users/carol/follow"
    end
    assert_response :ok
    assert_equal({ "isFollowing" => true, "followersCount" => 1 }, response.parsed_body.slice("isFollowing", "followersCount"))

    assert_no_difference "Notification.count" do
      post "/api/users/carol/follow"
    end
  end

  test "自分自身のフォローは拒否される" do
    post "/api/users/alice/follow"
    assert_response :unprocessable_content
    assert_equal [ [ "followingId", "Following cannot be yourself" ] ], problem_errors
  end

  test "フォローを外す" do
    delete "/api/users/bob/follow"
    assert_response :ok
    assert_equal({ "isFollowing" => false, "followersCount" => 0 }, response.parsed_body.slice("isFollowing", "followersCount"))
  end
end
