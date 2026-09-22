require "swagger_helper"

RSpec.describe "posts", type: :request do
  # 各 path / response は current_user を上書きしてサインインする人を変える（nil なら未サインイン）
  let(:current_user) { users(:bob) }

  before { sign_in_as current_user if current_user }

  path "/api/posts" do
    get "投稿一覧" do
      tags "posts"
      operationId "readPosts"
      description <<~DESC
        一覧はすべてこのエンドポイントで、クエリパラメータで切り替える。
        feed=all（既定）は全体タイムライン、feed=following はフォローしている人の投稿とリポスト、
        feed=bookmarks は自分のブックマーク、author={username} はその人の投稿とリポスト、
        likedBy={username} はその人がいいねした投稿。新しい順、1 ページ 20 件。
      DESC
      produces "application/json"
      parameter name: :feed, in: :query, required: false, schema: { type: :string, enum: %w[all following bookmarks] }, example: "following"
      parameter name: :author, in: :query, required: false, schema: { type: :string }, example: "alice"
      parameter name: :likedBy, in: :query, required: false, schema: { type: :string }, example: "bob"
      parameter name: :page, in: :query, required: false, schema: { type: :integer, minimum: 1, default: 1 }
      parameter name: :rows, in: :query, required: false, schema: { type: :integer, minimum: 1, maximum: 100, default: 20 }

      response "200", "投稿の配列" do
        schema type: :array, items: { "$ref" => "#/components/schemas/Post" }

        context "全体タイムラインは全投稿が新しい順" do
          run_test! do |response|
            expect(response.parsed_body.map { [ it["text"], it["img"] ] })
              .to eq [ [ nil, "/api/media/posts/fixture.png" ], [ "hello from bob", nil ], [ "hello from alice", nil ] ]
            expect(response.parsed_body.last.slice("likeCount", "liked", "repostCount", "reposted", "bookmarked"))
              .to eq("likeCount" => 1, "liked" => true, "repostCount" => 1, "reposted" => false, "bookmarked" => true)
          end
        end

        context "末尾を過ぎたページは空" do
          let(:page) { 2 }
          run_test! do |response|
            expect(response.parsed_body).to eq []
          end
        end

        context "フォロー中フィードにはフォローしている人のリポストも載る" do
          let(:feed) { "following" }
          before { Follow.create!(follower: users(:bob), following: users(:carol)) }
          run_test! do |response|
            expect(response.parsed_body.map { [ it["text"], it.dig("repostedBy", "username") ] })
              .to eq [ [ nil, nil ], [ "hello from alice", "carol" ] ]
          end
        end

        context "投稿者とリポストした人の両方をフォローしていても、ページをまたいで投稿は 1 回だけ出る" do
          let(:feed) { "following" }
          let(:rows) { 1 }
          before do
            Follow.create!(follower: users(:bob), following: users(:carol))
            Follow.create!(follower: users(:bob), following: users(:alice))
            users(:alice).posts.create!(text: "a newer post from alice")
          end
          run_test! do |first_page|
            pages = [ first_page.parsed_body ]
            (2..4).each do |page|
              get "/api/posts", params: { feed: "following", rows: 1, page: page }
              pages << response.parsed_body
            end
            expect(pages.map { |page| page.map { [ it["text"], it.dig("repostedBy", "username") ] } })
              .to eq [ [ [ "a newer post from alice", nil ] ], [ [ nil, nil ] ], [ [ "hello from alice", "carol" ] ], [] ]
          end
        end

        context "投稿者を指定した一覧" do
          let(:author) { "alice" }
          run_test! do |response|
            expect(response.parsed_body.map { it["text"] }).to eq [ "hello from alice" ]
          end
        end

        context "ユーザーがいいねした投稿" do
          let(:likedBy) { "bob" }
          run_test! do |response|
            expect(response.parsed_body.map { it["text"] }).to eq [ "hello from alice" ]
          end
        end

        context "自分のブックマーク" do
          let(:feed) { "bookmarks" }
          run_test! do |response|
            expect(response.parsed_body.map { it["text"] }).to eq [ "hello from alice" ]
          end
        end
      end

      response "422", "クエリパラメータが契約に合わない" do
        schema "$ref" => "#/components/schemas/Problem"

        context "rows は 1〜100" do
          let(:rows) { 0 }
          run_test! do
            expect(problem_errors).to eq [ [ "rows", "Rows must be an integer between 1 and 100" ] ]
          end
        end

        context "feed は決まった値のどれか" do
          let(:feed) { "everything" }
          run_test! do
            expect(problem_errors).to eq [ [ "feed", "Feed must be one of all, following, bookmarks" ] ]
          end
        end
      end

      response "401", "サインインしていない" do
        schema "$ref" => "#/components/schemas/Problem"
        let(:current_user) { nil }
        run_test!
      end
    end

    post "投稿を作成する" do
      tags "posts"
      operationId "createPost"
      description "text か img のどちらかは必須。"
      consumes "multipart/form-data"
      produces "application/json"
      parameter name: :text, in: :formData, required: false, schema: { "$ref" => "#/components/schemas/CreatePostRequest" }
      parameter name: :img, in: :formData, required: false

      response "201", "作成した投稿" do
        schema "$ref" => "#/components/schemas/Post"

        context "テキストと画像" do
          let(:text) { "with an image" }
          let(:img) { pixel }
          run_test! do |response|
            expect(response.parsed_body["text"]).to eq "with an image"
            expect(response.parsed_body["img"]).to match %r{\A/api/media/posts/[a-z0-9]+\.png\z}
          end
        end

        context "テキストだけ" do
          let(:text) { "just words" }
          run_test! do |response|
            expect(response.parsed_body["img"]).to be_nil
          end
        end

        context "画像だけ" do
          let(:img) { pixel }
          run_test! do |response|
            expect(response.parsed_body["text"]).to be_nil
          end
        end
      end

      response "422", "テキストも画像もない、または画像ではない" do
        schema "$ref" => "#/components/schemas/Problem"

        context "テキストも画像もない" do
          let(:text) { "" }
          run_test! do
            expect(problem_errors).to eq [ [ "text", "Text or an image is required" ] ]
          end
        end

        context "画像ではないファイル" do
          let(:img) { fixture_file_upload("not_an_image.txt", "text/plain") }
          run_test! do
            expect(problem_errors).to eq [ [ "img", "Image must be PNG, JPEG, WebP, or GIF" ] ]
          end
        end
      end
    end
  end

  path "/api/posts/{id}" do
    parameter name: :id, in: :path, schema: { type: :integer }, example: 42
    let(:id) { posts(:alices_post).id }

    get "投稿を 1 件取得する" do
      tags "posts"
      operationId "readPost"
      produces "application/json"

      response "200", "投稿" do
        schema "$ref" => "#/components/schemas/Post"
        run_test! do |response|
          expect(response.parsed_body["comments"].map { it["text"] }).to eq [ "Nice post!" ]
        end
      end

      response "404", "存在しない投稿" do
        schema "$ref" => "#/components/schemas/Problem"
        let(:id) { 0 }
        run_test!
      end
    end

    delete "投稿を削除する" do
      tags "posts"
      operationId "deletePost"
      description "投稿者だけができる。"
      produces "application/json"

      response "204", "削除した" do
        let(:id) { posts(:bobs_post).id }
        run_test! do
          expect(Post.exists?(posts(:bobs_post).id)).to be false
        end
      end

      response "403", "他人の投稿" do
        schema "$ref" => "#/components/schemas/Problem"
        run_test!
      end
    end
  end

  # fixture では bob が alices_post にいいねとブックマークを、carol がリポストをしている。
  # 作る側はまだしていない人、取り消す側はした人でサインインする。
  {
    like: [ "いいね", "liked", "likeCount", :carol, :bob ],
    repost: [ "リポスト", "reposted", "repostCount", :bob, :carol ],
    bookmark: [ "ブックマーク", "bookmarked", nil, :carol, :bob ]
  }.each do |kind, (label, flag, count, creator, remover)|
    path "/api/posts/{post_id}/#{kind}" do
      parameter name: :post_id, in: :path, schema: { type: :integer }, example: 42
      let(:post_id) { posts(:alices_post).id }
      let(:current_user) { users(creator) }

      post "#{label}する" do
        tags "posts"
        operationId "create#{kind.to_s.capitalize}"
        description "冪等。#{'初回だけ投稿者に通知する。' if kind == :like}#{'非公開なので通知しない。' if kind == :bookmark}"
        produces "application/json"

        response "200", "#{label}した後の投稿" do
          schema "$ref" => "#/components/schemas/Post"
          run_test! do |response|
            expect(response.parsed_body[flag]).to be true
            expect(response.parsed_body[count]).to eq 2 if count
            expect(users(:alice).notifications_to.where(type: "like").count).to eq 2 if kind == :like
          end
        end

        response "404", "存在しない投稿" do
          schema "$ref" => "#/components/schemas/Problem"
          let(:post_id) { 0 }
          run_test!
        end
      end

      delete "#{label}を取り消す" do
        tags "posts"
        operationId "delete#{kind.to_s.capitalize}"
        description "冪等。"
        produces "application/json"

        response "200", "#{label}を取り消した後の投稿" do
          schema "$ref" => "#/components/schemas/Post"
          let(:current_user) { users(remover) }
          run_test! do |response|
            expect(response.parsed_body[flag]).to be false
            expect(response.parsed_body[count]).to eq 0 if count
          end
        end
      end
    end
  end

  path "/api/posts/{post_id}/comments" do
    parameter name: :post_id, in: :path, schema: { type: :integer }, example: 42
    let(:post_id) { posts(:alices_post).id }
    let(:current_user) { users(:carol) }

    post "コメントする" do
      tags "posts"
      operationId "createComment"
      consumes "application/json"
      produces "application/json"
      parameter name: :comment, in: :body, schema: { "$ref" => "#/components/schemas/CreateCommentRequest" }

      response "201", "コメントが付いた後の投稿" do
        schema "$ref" => "#/components/schemas/Post"
        let(:comment) { { text: "  Me too!  " } }
        run_test! do |response|
          expect(response.parsed_body["comments"].map { [ it["text"], it.dig("author", "username") ] })
            .to eq [ [ "Nice post!", "bob" ], [ "Me too!", "carol" ] ]
        end
      end

      response "422", "空か長すぎる" do
        schema "$ref" => "#/components/schemas/Problem"
        let(:comment) { { text: "x" * 281 } }
        run_test! do
          expect(problem_errors).to eq [ [ "text", "Comment must be 280 characters or fewer" ] ]
        end
      end
    end
  end
end
