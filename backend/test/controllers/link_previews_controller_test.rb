require "test_helper"

class LinkPreviewsControllerTest < ActionDispatch::IntegrationTest
  openapi!

  setup { sign_in_as users(:alice) }

  test "ページの Open Graph メタデータ" do
    html = '<html><head><title>Fallback</title><meta property="og:title" content="Example"><meta property="og:image" content="/hero.png"><meta property="og:site_name" content="Example Site"></head></html>'
    LinkPreview.stub(:internal?, false) do
      LinkPreview.stub(:fetch_html, html) do
        get "/api/link_preview", params: { url: "https://example.com/article" }
      end
    end
    assert_response :ok
    assert_equal({ "url" => "https://example.com/article", "title" => "Example", "description" => nil,
                   "image" => "https://example.com/hero.png", "siteName" => "Example Site" }, response.parsed_body)
  end

  test "description だけのページ" do
    html = '<html><head><meta property="og:description" content="Just a description"></head></html>'
    LinkPreview.stub(:internal?, false) do
      LinkPreview.stub(:fetch_html, html) do
        get "/api/link_preview", params: { url: "https://example.com/plain" }
      end
    end
    assert_response :ok
    assert_equal({ "url" => "https://example.com/plain", "title" => nil, "description" => "Just a description",
                   "image" => nil, "siteName" => nil }, response.parsed_body)
  end

  test "内部アドレスは 400" do
    get "/api/link_preview", params: { url: "http://127.0.0.1/" }
    assert_response :bad_request
  end
end
