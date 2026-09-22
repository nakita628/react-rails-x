require "rails_helper"

RSpec.describe Comment, type: :model do
  subject(:comment) { posts(:alices_post).comments.new(author: users(:bob), text:) }

  context "本文が空のとき" do
    let(:text) { "" }

    it "無効で、理由を返す" do
      expect(comment).not_to be_valid
      expect(comment.errors.full_messages).to eq [ "Comment can't be blank" ]
    end
  end

  context "本文が 281 文字のとき" do
    let(:text) { "x" * 281 }

    it "無効で、理由を返す" do
      expect(comment).not_to be_valid
      expect(comment.errors.full_messages).to eq [ "Comment must be 280 characters or fewer" ]
    end
  end

  context "本文が 280 文字のとき" do
    let(:text) { "x" * 280 }

    it { is_expected.to be_valid }
  end
end
