require "test_helper"

class PostsControllerTest < ActionDispatch::IntegrationTest
  openapi!

  setup { sign_in_as users(:bob) }

  test "全体タイムラインは全投稿が新しい順" do
    get "/api/posts"
    assert_response :ok
    assert_equal [ [ nil, "/api/media/posts/fixture.png" ], [ "hello from bob", nil ], [ "hello from alice", nil ] ],
                 response.parsed_body.map { [ it["text"], it["img"] ] }
    assert_equal({ "likeCount" => 1, "liked" => true, "repostCount" => 1, "reposted" => false, "bookmarked" => true },
                 response.parsed_body.last.slice("likeCount", "liked", "repostCount", "reposted", "bookmarked"))
  end

  test "末尾を過ぎたページは空" do
    get "/api/posts", params: { page: 2 }
    assert_response :ok
    assert_equal [], response.parsed_body
  end

  test "フォロー中フィードにはフォローしている人のリポストも載る" do
    Follow.create!(follower: users(:bob), following: users(:carol))
    get "/api/posts", params: { feed: "following" }
    assert_response :ok
    assert_equal [ [ nil, nil ], [ "hello from alice", "carol" ] ], response.parsed_body.map { [ it["text"], it.dig("repostedBy", "username") ] }
  end

  test "投稿者とリポストした人の両方をフォローしていても、ページをまたいで投稿は 1 回だけ出る" do
    Follow.create!(follower: users(:bob), following: users(:carol))
    Follow.create!(follower: users(:bob), following: users(:alice))
    users(:alice).posts.create!(text: "a newer post from alice")

    pages = (1..4).map do |page|
      get "/api/posts", params: { feed: "following", rows: 1, page: page }
      response.parsed_body.map { [ it["text"], it.dig("repostedBy", "username") ] }
    end
    assert_equal [ [ [ "a newer post from alice", nil ] ], [ [ nil, nil ] ], [ [ "hello from alice", "carol" ] ], [] ], pages
  end

  test "投稿者を指定した一覧" do
    get "/api/posts", params: { author: "alice" }
    assert_response :ok
    assert_equal [ "hello from alice" ], response.parsed_body.map { it["text"] }
  end

  test "ユーザーがいいねした投稿" do
    get "/api/posts", params: { likedBy: "bob" }
    assert_response :ok
    assert_equal [ "hello from alice" ], response.parsed_body.map { it["text"] }
  end

  test "自分のブックマーク" do
    get "/api/posts", params: { feed: "bookmarks" }
    assert_response :ok
    assert_equal [ "hello from alice" ], response.parsed_body.map { it["text"] }
  end

  test "rows は 1〜100" do
    get "/api/posts", params: { rows: 0 }
    assert_response :unprocessable_content
    assert_equal [ [ "rows", "Rows must be an integer between 1 and 100" ] ], problem_errors
  end

  test "feed は決まった値のどれか" do
    get "/api/posts", params: { feed: "everything" }
    assert_response :unprocessable_content
    assert_equal [ [ "feed", "Feed must be one of all, following, bookmarks" ] ], problem_errors
  end

  test "一覧にはサインインが要る" do
    delete "/api/session"
    get "/api/posts"
    assert_response :unauthorized
  end

  test "投稿を 1 件取得する" do
    get "/api/posts/#{posts(:alices_post).id}"
    assert_response :ok
    assert_equal "hello from alice", response.parsed_body["text"]
    assert_equal [ "Nice post!" ], response.parsed_body["comments"].map { it["text"] }
  end

  test "存在しない投稿は 404" do
    get "/api/posts/0"
    assert_response :not_found
  end

  test "テキストと画像で投稿する" do
    assert_difference "Post.count" do
      post "/api/posts", params: { text: "with an image", img: pixel }
    end
    assert_response :created
    assert_equal "with an image", response.parsed_body["text"]
    assert_match %r{\A/api/media/posts/[a-z0-9]+\.png\z}, response.parsed_body["img"]
  end

  test "テキストだけで投稿する" do
    post "/api/posts", params: { text: "just words" }
    assert_response :created
    assert_nil response.parsed_body["img"]
  end

  test "画像だけで投稿する" do
    post "/api/posts", params: { img: pixel }
    assert_response :created
    assert_nil response.parsed_body["text"]
  end

  test "投稿にはテキストか画像が要る" do
    post "/api/posts", params: { text: "" }
    assert_response :unprocessable_content
    assert_equal [ [ "text", "Text or an image is required" ] ], problem_errors
  end

  test "画像でないファイルは投稿できない" do
    post "/api/posts", params: { img: fixture_file_upload("not_an_image.txt", "text/plain") }
    assert_response :unprocessable_content
    assert_equal [ [ "img", "Image must be PNG, JPEG, WebP, or GIF" ] ], problem_errors
  end

  test "投稿者は自分の投稿を削除できる" do
    assert_difference "Post.count", -1 do
      delete "/api/posts/#{posts(:bobs_post).id}"
    end
    assert_response :no_content
  end

  test "他人の投稿は削除できない" do
    delete "/api/posts/#{posts(:alices_post).id}"
    assert_response :forbidden
  end
end
