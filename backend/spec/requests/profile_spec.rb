require "swagger_helper"

RSpec.describe "profile", type: :request do
  let(:current_user) { users(:alice) }

  before { sign_in_as current_user if current_user }

  path "/api/profile" do
    get "サインイン中のユーザー自身" do
      tags "profile"
      operationId "readProfile"
      produces "application/json"

      response "200", "サインイン中のユーザー" do
        schema "$ref" => "#/components/schemas/AuthUser"
        run_test! do |response|
          expect(response.parsed_body.slice("username", "emailAddress", "profileImg")).to eq("username" => "alice", "emailAddress" => "alice@example.com", "profileImg" => nil)
        end
      end

      response "401", "サインインしていない" do
        schema "$ref" => "#/components/schemas/Problem"
        let(:current_user) { nil }
        run_test!
      end
    end

    patch "プロフィールを更新する" do
      tags "profile"
      operationId "updateProfile"
      description "部分更新。画像はファイルで送り、パスワード変更は currentPassword と newPassword を一緒に送る。"
      consumes "multipart/form-data"
      produces "application/json"
      parameter name: :fullName, in: :formData, required: false, schema: { "$ref" => "#/components/schemas/UpdateProfileRequest" }
      parameter name: :bio, in: :formData, required: false
      parameter name: :link, in: :formData, required: false
      parameter name: :profileImg, in: :formData, required: false
      parameter name: :coverImg, in: :formData, required: false
      parameter name: :currentPassword, in: :formData, required: false
      parameter name: :newPassword, in: :formData, required: false

      response "200", "更新後のユーザー" do
        schema "$ref" => "#/components/schemas/AuthUser"

        context "表示名・自己紹介・リンク・プロフィール画像・パスワードをまとめて" do
          let(:fullName) { "Alice B" }
          let(:bio) { "hi" }
          let(:link) { "https://example.com" }
          let(:profileImg) { pixel }
          let(:currentPassword) { PASSWORD }
          let(:newPassword) { "secret456" }
          run_test! do |response|
            expect(response.parsed_body.slice("fullName", "bio", "link")).to eq("fullName" => "Alice B", "bio" => "hi", "link" => "https://example.com")
            expect(response.parsed_body["profileImg"]).to match %r{\A/api/media/avatars/[a-z0-9]+\.png\z}
            expect(users(:alice).reload.authenticate("secret456")).to be_truthy
          end
        end

        context "画像だけ" do
          let(:coverImg) { pixel }
          run_test! do |response|
            expect(response.parsed_body["coverImg"]).to match %r{\A/api/media/covers/[a-z0-9]+\.png\z}
          end
        end
      end

      response "401", "現在のパスワードが違う" do
        schema "$ref" => "#/components/schemas/Problem"
        let(:currentPassword) { "wrong" }
        let(:newPassword) { "secret456" }
        run_test!
      end

      response "422", "検証に失敗した" do
        schema "$ref" => "#/components/schemas/Problem"
        let(:link) { "javascript:alert(1)" }
        let(:currentPassword) { PASSWORD }
        let(:newPassword) { "x" * 73 }
        let(:coverImg) { fixture_file_upload("not_an_image.txt", "text/plain") }
        run_test! do
          expect(problem_errors).to contain_exactly(
            [ "link", "Link must be a URL starting with http:// or https://" ],
            [ "password", "Password must be 72 characters or fewer" ],
            [ "coverImg", "Cover image must be PNG, JPEG, WebP, or GIF" ]
          )
        end
      end
    end

    delete "アカウントを削除する" do
      tags "profile"
      operationId "deleteProfile"
      description "取り消せない。投稿・いいね・フォロー・画像も一緒に消え、セッションが終わる。"
      produces "application/json"

      response "204", "削除した" do
        run_test! do
          expect(User.exists?(users(:alice).id)).to be false
          expect(Post.where(author_id: users(:alice).id)).to be_empty
          get "/api/profile"
          expect(response).to have_http_status(:unauthorized)
        end
      end

      response "401", "サインインしていない" do
        schema "$ref" => "#/components/schemas/Problem"
        let(:current_user) { nil }
        run_test!
      end
    end
  end
end
