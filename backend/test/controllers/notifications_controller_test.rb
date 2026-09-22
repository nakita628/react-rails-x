require "test_helper"

class NotificationsControllerTest < ActionDispatch::IntegrationTest
  openapi!

  setup { sign_in_as users(:alice) }

  test "自分の通知が新しい順に返る" do
    get "/api/notifications"
    assert_response :ok
    assert_equal [ [ "like", false, "bob" ], [ "follow", false, "carol" ] ],
                 response.parsed_body.map { [ it["type"], it["read"], it.dig("from", "username") ] }
  end

  test "page は 1 以上" do
    get "/api/notifications", params: { page: "first" }
    assert_response :unprocessable_content
    assert_equal [ [ "page", "Page must be an integer of 1 or more" ] ], problem_errors
  end

  test "すべて既読にする" do
    patch "/api/notifications"
    assert_response :no_content
    assert_empty users(:alice).notifications_to.where(read: false)
  end

  test "すべて削除する" do
    delete "/api/notifications"
    assert_response :no_content
    assert_empty users(:alice).notifications_to
  end
end
