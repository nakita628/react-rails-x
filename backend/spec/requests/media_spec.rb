require "swagger_helper"

RSpec.describe "media", type: :request do
  path "/api/media/{prefix}/{filename}" do
    parameter name: :prefix, in: :path, schema: { type: :string, enum: %w[posts avatars covers] }
    parameter name: :filename, in: :path, schema: { type: :string }, example: "po9a2b3c4d5e6f7g8h9i0j1k.png"

    get "アップロードした画像" do
      tags "media"
      operationId "readMedia"
      description "投稿の画像、プロフィール画像、カバー画像を、API が返した URL で配信する。サインインは不要。"
      produces "image/png", "image/jpeg", "image/webp", "image/gif"

      response "200", "画像" do
        let(:key) { MediaStore.store("posts", pixel) }
        let(:prefix) { key.split("/").first }
        let(:filename) { key.split("/").last }
        after { MediaStore.delete(key) }
        run_test! do |response|
          expect(response.media_type).to eq "image/png"
          expect(response.body.bytesize).to eq 70
        end
      end

      response "404", "存在しない画像" do
        let(:prefix) { "posts" }
        let(:filename) { "nope.png" }
        run_test!
      end
    end
  end
end
