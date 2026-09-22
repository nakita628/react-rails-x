require "test_helper"

class CommentsControllerTest < ActionDispatch::IntegrationTest
  openapi!

  setup { sign_in_as users(:carol) }

  test "コメントすると投稿とそのコメント一覧が返る" do
    post "/api/posts/#{posts(:alices_post).id}/comments", params: { text: "  Me too!  " }, as: :json
    assert_response :created
    assert_equal [ [ "Nice post!", "bob" ], [ "Me too!", "carol" ] ], response.parsed_body["comments"].map { [ it["text"], it.dig("author", "username") ] }
  end

  test "コメントは 1〜280 文字" do
    post "/api/posts/#{posts(:alices_post).id}/comments", params: { text: "x" * 281 }, as: :json
    assert_response :unprocessable_content
    assert_equal [ [ "text", "Comment must be 280 characters or fewer" ] ], problem_errors
  end
end
