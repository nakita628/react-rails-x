require "test_helper"

class FollowTest < ActiveSupport::TestCase
  test "自分自身はフォローできない" do
    follow = Follow.new(follower: users(:alice), following: users(:alice))
    assert_not follow.valid?
    assert_equal [ "Following cannot be yourself" ], follow.errors.full_messages
  end
end
