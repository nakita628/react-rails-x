class User < ApplicationRecord
  attribute :bio, default: ""
  attribute :link, default: ""

  validates :username, presence: true, uniqueness: true,
                       format: { with: /\A[a-zA-Z0-9_]{1,15}\z/, message: "must be 15 characters or fewer and contain only letters, digits, and underscores" }
  validates :full_name, presence: true
  validates :email_address, presence: true, uniqueness: true,
                            format: { with: URI::MailTo::EMAIL_REGEXP, message: "must be a valid email address" }
  validates :link, length: { maximum: 100, too_long: "must be %{count} characters or fewer" },
                   format: { with: %r{\A(https?://\S+)?\z}, message: "must be a URL starting with http:// or https://" }

  has_many :sessions, dependent: :destroy
  has_many :posts, foreign_key: "author_id", inverse_of: :author, dependent: :destroy
  has_many :comments, foreign_key: "author_id", inverse_of: :author, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :reposts, dependent: :destroy
  has_many :bookmarks, dependent: :destroy
  has_many :following, class_name: "Follow", foreign_key: "follower_id", inverse_of: :follower, dependent: :destroy
  has_many :followers, class_name: "Follow", foreign_key: "following_id", inverse_of: :following, dependent: :destroy
  has_many :notifications_from, class_name: "Notification", foreign_key: "from_id", inverse_of: :from,
                                dependent: :destroy
  has_many :notifications_to, class_name: "Notification", foreign_key: "to_id", inverse_of: :to, dependent: :destroy

  has_secure_password
  normalizes :email_address, with: ->(e) { e.strip.downcase }
  validates :password, length: { minimum: 6, too_short: "must be at least %{count} characters" }, allow_nil: true
  attr_accessor :profile_img, :cover_img
  validates :profile_img, :cover_img, image: { types: %w[image/png image/jpeg image/webp image/gif], max: 5.megabytes }
  before_save { self.profile_image_key = MediaStore.replace(profile_image_key, "avatars", profile_img) if profile_img }
  before_save { self.cover_image_key = MediaStore.replace(cover_image_key, "covers", cover_img) if cover_img }
  after_destroy { MediaStore.delete(profile_image_key, cover_image_key) }
end
