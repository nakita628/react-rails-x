class Like < ApplicationRecord
  self.primary_key = %w[user_id post_id]

  belongs_to :user, inverse_of: :likes
  belongs_to :post, inverse_of: :likes
end
