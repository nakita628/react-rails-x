require "swagger_helper"

RSpec.describe "sessions", type: :request do
  path "/api/session" do
    post "サインインする" do
      tags "sessions"
      operationId "createSession"
      description "ユーザー名とパスワードでサインインし、セッション cookie を発行する。"
      consumes "application/json"
      produces "application/json"
      parameter name: :credentials, in: :body, schema: { "$ref" => "#/components/schemas/CreateSessionRequest" }

      response "200", "サインイン済みのユーザー" do
        schema "$ref" => "#/components/schemas/AuthUser"
        let(:credentials) { { username: "bob", password: PASSWORD } }
        run_test! do |response|
          expect(response.cookies["session_id"]).to be_present
          expect(response.parsed_body["profileImg"]).to eq "/api/media/avatars/fixture.png"
        end
      end

      response "401", "ユーザー名かパスワードが違う" do
        schema "$ref" => "#/components/schemas/Problem"
        let(:credentials) { { username: "alice", password: "wrong" } }
        run_test! do |response|
          expect(response.media_type).to eq "application/problem+json"
        end
      end
    end

    delete "サインアウトする" do
      tags "sessions"
      operationId "deleteSession"
      produces "application/json"

      response "204", "セッションが終わった" do
        before { sign_in_as users(:alice) }
        run_test! do
          get "/api/profile"
          expect(response).to have_http_status(:unauthorized)
        end
      end

      response "401", "サインインしていない" do
        schema "$ref" => "#/components/schemas/Problem"
        run_test!
      end
    end
  end

  # OpenAPI 文書には含めない。JSON でないボディに何が返るか。
  it "JSON でない本文は 400 の problem document になる" do
    post "/api/session", params: '{"username": ', headers: { "Content-Type" => "application/json" }
    expect(response).to have_http_status(:bad_request)
    expect(response.media_type).to eq "application/problem+json"
    expect(response.parsed_body["detail"]).to eq "The request body is not valid JSON"
  end
end
