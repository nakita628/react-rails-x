require "test_helper"

class PostTest < ActiveSupport::TestCase
  test "テキストか画像が要る" do
    post = Post.new(author: users(:alice))
    assert_not post.valid?
    assert_equal [ "Text or an image is required" ], post.errors.full_messages
  end

  test "画像だけでも投稿でき、保存時に MediaStore に置かれる" do
    post = Post.new(author: users(:alice), img: Rack::Test::UploadedFile.new(Rails.root.join("test/fixtures/files/pixel.png"), "image/png"))
    assert post.save
    assert_match %r{\Aposts/[a-z0-9]+\.png\z}, post.image_key
    assert MediaStore.path_for(post.image_key).file?
    post.destroy!
    assert_not MediaStore.path_for(post.image_key).file?
  end

  test "画像は PNG / JPEG / WebP / GIF に限る" do
    post = Post.new(author: users(:alice), img: Rack::Test::UploadedFile.new(Rails.root.join("Gemfile"), "text/plain"))
    assert_not post.valid?
    assert_equal [ "Image must be PNG, JPEG, WebP, or GIF" ], post.errors.full_messages
  end

  test "recent は新しい順に並ぶ" do
    assert_equal [ posts(:carols_photo), posts(:bobs_post), posts(:alices_post) ], Post.recent.to_a
  end
end
