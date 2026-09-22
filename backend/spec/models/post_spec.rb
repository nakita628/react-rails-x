require "rails_helper"

RSpec.describe Post, type: :model do
  subject(:post) { described_class.new(author: users(:alice), text:, img:) }

  let(:text) { nil }
  let(:img) { nil }

  context "テキストも画像もないとき" do
    it "無効で、理由を返す" do
      expect(post).not_to be_valid
      expect(post.errors.full_messages).to eq [ "Text or an image is required" ]
    end
  end

  context "画像だけのとき" do
    let(:img) { fixture_file_upload("pixel.png", "image/png") }

    it { is_expected.to be_valid }

    it "保存すると MediaStore に画像を置き、削除すると取り除く" do
      post.save!
      expect(post.image_key).to match %r{\Aposts/[a-z0-9]+\.png\z}
      expect { post.destroy! }.to change { MediaStore.path_for(post.image_key).file? }.from(true).to(false)
    end
  end

  context "画像が PNG / JPEG / WebP / GIF でないとき" do
    let(:img) { fixture_file_upload("not_an_image.txt", "text/plain") }

    it "無効で、理由を返す" do
      expect(post).not_to be_valid
      expect(post.errors.full_messages).to eq [ "Image must be PNG, JPEG, WebP, or GIF" ]
    end
  end

  describe ".recent" do
    it "新しい順に並ぶ" do
      expect(described_class.recent).to eq [ posts(:carols_photo), posts(:bobs_post), posts(:alices_post) ]
    end
  end
end
