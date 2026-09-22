require "test_helper"

class BookmarksControllerTest < ActionDispatch::IntegrationTest
  openapi!

  setup { sign_in_as users(:bob) }

  test "投稿をブックマークする" do
    post "/api/posts/#{posts(:bobs_post).id}/bookmark"
    assert_response :ok
    assert response.parsed_body["bookmarked"]
  end

  test "ブックマークを外す" do
    delete "/api/posts/#{posts(:alices_post).id}/bookmark"
    assert_response :ok
    assert_not response.parsed_body["bookmarked"]
  end
end
