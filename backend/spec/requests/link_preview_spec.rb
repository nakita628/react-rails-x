require "swagger_helper"

RSpec.describe "link_preview", type: :request do
  before { sign_in_as users(:alice) }

  path "/api/link_preview" do
    get "URL の Open Graph メタデータ" do
      tags "link_preview"
      operationId "readLinkPreview"
      description "ベストエフォート。取得できないページは空のメタデータになる。http(s) 以外の URL と内部アドレスは 400。"
      produces "application/json"
      parameter name: :url, in: :query, required: true, schema: { type: :string }, example: "https://rubyonrails.org/"

      response "200", "メタデータ" do
        schema "$ref" => "#/components/schemas/LinkPreview"
        let(:url) { "https://example.com/article" }
        before do
          html = '<html><head><title>Fallback</title><meta property="og:title" content="Example"><meta property="og:image" content="/hero.png"><meta property="og:site_name" content="Example Site"></head></html>'
          allow(LinkPreview).to receive(:internal?).and_return(false)
          allow(LinkPreview).to receive(:fetch_html).and_return(html)
        end
        run_test! do |response|
          expect(response.parsed_body).to eq("url" => url, "title" => "Example", "description" => nil,
                                             "image" => "https://example.com/hero.png", "siteName" => "Example Site")
        end
      end

      response "400", "http(s) 以外の URL、または内部アドレス" do
        schema "$ref" => "#/components/schemas/Problem"
        let(:url) { "http://127.0.0.1/" }
        run_test!
      end
    end
  end
end
