class Notification < ApplicationRecord
  self.inheritance_column = nil

  attribute :read, default: false

  validates :type, presence: true, inclusion: { in: %w[follow like] }

  belongs_to :from, class_name: "User", inverse_of: :notifications_from
  belongs_to :to, class_name: "User", inverse_of: :notifications_to
end
