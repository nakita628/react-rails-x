require "rails_helper"

RSpec.describe User, type: :model do
  describe "登録" do
    subject(:user) do
      described_class.new(username: "dave", full_name: "Dave", email_address: " Dave@Example.com ", password: PASSWORD)
    end

    it { is_expected.to be_valid }

    it "メールアドレスは前後の空白を除いて小文字にする" do
      expect(user.email_address).to eq "dave@example.com"
    end

    it "パスワードで認証できる" do
      expect(user.authenticate(PASSWORD)).to eq user
    end
  end

  describe "検証" do
    context "ユーザー名・表示名・メールアドレス・パスワードがすべて規則に反するとき" do
      subject(:user) { described_class.new(username: "bad name", full_name: "", email_address: "nope", password: "123") }

      it "破った規則ごとにメッセージを返す" do
        expect(user).not_to be_valid
        expect(user.errors.full_messages).to eq [
          "Username must be 15 characters or fewer and contain only letters, digits, and underscores",
          "Full name can't be blank",
          "Email address must be a valid email address",
          "Password must be at least 6 characters"
        ]
      end
    end

    context "ユーザー名とメールアドレスが既に使われているとき" do
      subject(:user) { described_class.new(username: "alice", full_name: "A", email_address: "ALICE@example.com", password: PASSWORD) }

      it "大文字小文字を区別せずに重複を弾く" do
        expect(user).not_to be_valid
        expect(user.errors.of_kind?(:username, :taken)).to be true
        expect(user.errors.of_kind?(:email_address, :taken)).to be true
      end
    end

    context "パスワードが 73 文字のとき" do
      subject(:user) { users(:alice).tap { it.password = "x" * 73 } }

      it "無効で、理由を返す" do
        expect(user).not_to be_valid
        expect(user.errors.full_messages).to eq [ "Password must be 72 characters or fewer" ]
      end
    end

    describe "リンク" do
      subject(:user) { users(:alice).tap { it.link = link } }

      context "http(s) で始まらないとき" do
        let(:link) { "javascript:alert(1)" }

        it "無効で、理由を返す" do
          expect(user).not_to be_valid
          expect(user.errors.full_messages).to eq [ "Link must be a URL starting with http:// or https://" ]
        end
      end

      context "101 文字以上のとき" do
        let(:link) { "https://#{"a" * 100}" }

        it "無効で、理由を返す" do
          expect(user).not_to be_valid
          expect(user.errors.full_messages).to eq [ "Link must be 100 characters or fewer" ]
        end
      end

      context "空のとき" do
        let(:link) { "" }

        it { is_expected.to be_valid }
      end
    end

    context "カバー画像が PNG / JPEG / WebP / GIF でないとき" do
      subject(:user) { users(:alice).tap { it.cover_img = fixture_file_upload("not_an_image.txt", "text/plain") } }

      it "無効で、理由を返す" do
        expect(user).not_to be_valid
        expect(user.errors.full_messages).to eq [ "Cover image must be PNG, JPEG, WebP, or GIF" ]
      end
    end
  end

  describe "#destroy" do
    subject(:user) { users(:alice) }

    before { user.sessions.create! }

    it "投稿・セッション・フォロー・通知も消す" do
      expect { user.destroy! }
        .to change(Post, :count).by(-1)
        .and change(Session, :count).by(-1)
        .and change(Follow, :count).by(-1)
        .and change(Notification, :count).by(-2)
    end
  end
end
