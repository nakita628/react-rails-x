require "test_helper"

class CommentTest < ActiveSupport::TestCase
  test "本文は 1〜280 文字" do
    comment = posts(:alices_post).comments.new(author: users(:bob), text: "")
    assert_not comment.valid?
    assert_equal [ "Comment can't be blank" ], comment.errors.full_messages

    comment.text = "x" * 281
    assert_not comment.valid?
    assert_equal [ "Comment must be 280 characters or fewer" ], comment.errors.full_messages
  end
end
