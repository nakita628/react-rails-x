class Repost < ApplicationRecord
  self.primary_key = %w[user_id post_id]

  belongs_to :user, inverse_of: :reposts
  belongs_to :post, inverse_of: :reposts
end
