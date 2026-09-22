require "swagger_helper"

RSpec.describe "users", type: :request do
  path "/api/users" do
    post "サインアップする" do
      tags "users"
      operationId "createUser"
      description "ユーザーを作り、そのままサインイン状態にする。"
      consumes "application/json"
      produces "application/json"
      parameter name: :user, in: :body, schema: { "$ref" => "#/components/schemas/CreateUserRequest" }

      response "201", "作成したユーザー" do
        schema "$ref" => "#/components/schemas/AuthUser"
        let(:user) { { username: "dave", fullName: "Dave", emailAddress: "Dave@Example.com", password: PASSWORD } }
        run_test! do |response|
          expect(response.parsed_body["emailAddress"]).to eq "dave@example.com"
          expect(response.cookies["session_id"]).to be_present
        end
      end

      response "409", "ユーザー名かメールアドレスが使われている" do
        schema "$ref" => "#/components/schemas/Problem"
        let(:user) { { username: "alice", fullName: "Alice", emailAddress: "new@example.com", password: PASSWORD } }
        run_test!
      end

      response "422", "検証に失敗した" do
        schema "$ref" => "#/components/schemas/Problem"
        let(:user) { { username: "bad name", fullName: "", emailAddress: "nope", password: "123" } }
        run_test! do
          expect(problem_errors).to eq [
            [ "username", "Username must be 15 characters or fewer and contain only letters, digits, and underscores" ],
            [ "fullName", "Full name can't be blank" ],
            [ "emailAddress", "Email address must be a valid email address" ],
            [ "password", "Password must be at least 6 characters" ]
          ]
        end
      end
    end
  end

  path "/api/users/suggested" do
    get "おすすめユーザー" do
      tags "users"
      operationId "readSuggestedUsers"
      description "自分と、すでにフォローしている人を除いた最大 10 人。順不同。"
      produces "application/json"

      response "200", "おすすめユーザー" do
        schema type: :array, items: { "$ref" => "#/components/schemas/UserProfile" }
        before { sign_in_as users(:alice) }
        run_test! do |response|
          expect(response.parsed_body.map { [ it["username"], it["profileImg"] ] }).to eq [ [ "carol", "/api/media/avatars/fixture.png" ] ]
        end
      end

      response "401", "サインインしていない" do
        schema "$ref" => "#/components/schemas/Problem"
        run_test!
      end
    end
  end

  path "/api/users/{username}" do
    parameter name: :username, in: :path, schema: { type: :string }, example: "bob"

    get "プロフィールを取得する" do
      tags "users"
      operationId "readUser"
      produces "application/json"

      response "200", "プロフィール" do
        schema "$ref" => "#/components/schemas/UserProfile"
        before { sign_in_as users(:alice) }

        context "フォローしている相手" do
          let(:username) { "bob" }
          run_test! do |response|
            expect(response.parsed_body.slice("followersCount", "followingCount", "isFollowing", "coverImg"))
              .to eq("followersCount" => 1, "followingCount" => 0, "isFollowing" => true, "coverImg" => "/api/media/covers/fixture.png")
          end
        end

        context "画像のないユーザー" do
          let(:username) { "alice" }
          run_test! do |response|
            expect(response.parsed_body.slice("profileImg", "coverImg", "isFollowing")).to eq("profileImg" => nil, "coverImg" => nil, "isFollowing" => false)
          end
        end
      end

      response "404", "存在しないユーザー名" do
        schema "$ref" => "#/components/schemas/Problem"
        let(:username) { "nobody" }
        before { sign_in_as users(:alice) }
        run_test!
      end
    end
  end

  path "/api/users/{username}/follow" do
    parameter name: :username, in: :path, schema: { type: :string }, example: "bob"
    before { sign_in_as users(:alice) }

    post "フォローする" do
      tags "users"
      operationId "createFollow"
      description "冪等。初回だけ相手に通知する。"
      produces "application/json"

      response "200", "フォローした相手のプロフィール" do
        schema "$ref" => "#/components/schemas/UserProfile"
        let(:username) { "carol" }
        run_test! do |response|
          expect(response.parsed_body.slice("isFollowing", "followersCount")).to eq("isFollowing" => true, "followersCount" => 1)
          expect(users(:carol).notifications_to.pluck(:type)).to eq [ "follow" ]
          expect { post "/api/users/carol/follow" }.not_to change(Notification, :count)
        end
      end

      response "422", "自分自身をフォローしようとした" do
        schema "$ref" => "#/components/schemas/Problem"
        let(:username) { "alice" }
        run_test! do
          expect(problem_errors).to eq [ [ "followingId", "Following cannot be yourself" ] ]
        end
      end
    end

    delete "フォローを外す" do
      tags "users"
      operationId "deleteFollow"
      description "冪等。"
      produces "application/json"

      response "200", "フォローを外した相手のプロフィール" do
        schema "$ref" => "#/components/schemas/UserProfile"
        let(:username) { "bob" }
        run_test! do |response|
          expect(response.parsed_body.slice("isFollowing", "followersCount")).to eq("isFollowing" => false, "followersCount" => 0)
        end
      end
    end
  end
end
