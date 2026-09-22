class Post < ApplicationRecord
  belongs_to :author, class_name: "User", inverse_of: :posts
  has_many :comments, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :reposts, dependent: :destroy
  has_many :bookmarks, dependent: :destroy

  scope :recent, -> { order(created_at: :desc, id: :desc) }
  attr_accessor :img
  validates :img, image: { types: %w[image/png image/jpeg image/webp image/gif], max: 5.megabytes }
  validates :text, presence: { message: "or an image is required" }, unless: -> { img || image_key }
  before_save { self.image_key = MediaStore.store("posts", img) if img }
  after_destroy { MediaStore.delete(image_key) }
end
