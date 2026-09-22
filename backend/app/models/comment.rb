class Comment < ApplicationRecord
  validates :text, presence: true, length: { maximum: 280, too_long: "must be %{count} characters or fewer" }

  belongs_to :post, inverse_of: :comments
  belongs_to :author, class_name: "User", inverse_of: :comments
end
