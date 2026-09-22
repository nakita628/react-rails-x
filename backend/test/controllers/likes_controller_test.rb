require "test_helper"

class LikesControllerTest < ActionDispatch::IntegrationTest
  openapi!

  setup { sign_in_as users(:carol) }

  test "いいねすると初回だけ投稿者に通知される" do
    assert_difference "users(:alice).notifications_to.count" do
      post "/api/posts/#{posts(:alices_post).id}/like"
    end
    assert_response :ok
    assert_equal({ "liked" => true, "likeCount" => 2 }, response.parsed_body.slice("liked", "likeCount"))

    assert_no_difference "Notification.count" do
      post "/api/posts/#{posts(:alices_post).id}/like"
    end
  end

  test "存在しない投稿へのいいねは 404" do
    post "/api/posts/0/like"
    assert_response :not_found
  end

  test "いいねを取り消す" do
    sign_in_as users(:bob)
    delete "/api/posts/#{posts(:alices_post).id}/like"
    assert_response :ok
    assert_equal({ "liked" => false, "likeCount" => 0 }, response.parsed_body.slice("liked", "likeCount"))
  end
end
