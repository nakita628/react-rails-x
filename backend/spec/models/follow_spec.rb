require "rails_helper"

RSpec.describe Follow, type: :model do
  subject(:follow) { described_class.new(follower: users(:alice), following:) }

  context "フォロー先が自分自身のとき" do
    let(:following) { users(:alice) }

    it "無効で、理由を返す" do
      expect(follow).not_to be_valid
      expect(follow.errors.full_messages).to eq [ "Following cannot be yourself" ]
    end
  end

  context "フォロー先が他人のとき" do
    let(:following) { users(:carol) }

    it { is_expected.to be_valid }
  end
end
