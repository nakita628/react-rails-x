require "test_helper"

class MediaControllerTest < ActionDispatch::IntegrationTest
  openapi!

  test "アップロードした画像はサインインなしで配信される" do
    key = MediaStore.store("posts", pixel)
    get "/api/media/#{key}"
    assert_response :ok
    assert_equal "image/png", response.media_type
    assert_equal 70, response.body.bytesize
  ensure
    MediaStore.delete(key)
  end

  test "存在しない画像は 404" do
    get "/api/media/posts/nope.png"
    assert_response :not_found
  end
end
