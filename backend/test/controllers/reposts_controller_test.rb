require "test_helper"

class RepostsControllerTest < ActionDispatch::IntegrationTest
  openapi!

  setup { sign_in_as users(:bob) }

  test "投稿をリポストする" do
    post "/api/posts/#{posts(:alices_post).id}/repost"
    assert_response :ok
    assert_equal({ "reposted" => true, "repostCount" => 2 }, response.parsed_body.slice("reposted", "repostCount"))
  end

  test "リポストを取り消す" do
    sign_in_as users(:carol)
    delete "/api/posts/#{posts(:alices_post).id}/repost"
    assert_response :ok
    assert_equal({ "reposted" => false, "repostCount" => 0 }, response.parsed_body.slice("reposted", "repostCount"))
  end
end
