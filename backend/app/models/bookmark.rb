class Bookmark < ApplicationRecord
  self.primary_key = %w[user_id post_id]

  belongs_to :user, inverse_of: :bookmarks
  belongs_to :post, inverse_of: :bookmarks
end
