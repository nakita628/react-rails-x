require "swagger_helper"

RSpec.describe "notifications", type: :request do
  before { sign_in_as users(:alice) }

  path "/api/notifications" do
    get "自分の通知" do
      tags "notifications"
      operationId "readNotifications"
      description "新しい順、1 ページ 20 件。"
      produces "application/json"
      parameter name: :page, in: :query, required: false, schema: { type: :integer, minimum: 1, default: 1 }
      parameter name: :rows, in: :query, required: false, schema: { type: :integer, minimum: 1, maximum: 100, default: 20 }

      response "200", "通知の配列" do
        schema type: :array, items: { "$ref" => "#/components/schemas/Notification" }
        run_test! do |response|
          expect(response.parsed_body.map { [ it["type"], it["read"], it.dig("from", "username") ] })
            .to eq [ [ "like", false, "bob" ], [ "follow", false, "carol" ] ]
        end
      end

      response "422", "クエリパラメータが契約に合わない" do
        schema "$ref" => "#/components/schemas/Problem"
        let(:page) { "first" }
        run_test! do
          expect(problem_errors).to eq [ [ "page", "Page must be an integer of 1 or more" ] ]
        end
      end
    end

    patch "すべて既読にする" do
      tags "notifications"
      operationId "updateNotificationsRead"
      produces "application/json"

      response "204", "既読にした" do
        run_test! do
          expect(users(:alice).notifications_to.where(read: false)).to be_empty
        end
      end
    end

    delete "すべて削除する" do
      tags "notifications"
      operationId "deleteNotifications"
      produces "application/json"

      response "204", "削除した" do
        run_test! do
          expect(users(:alice).notifications_to).to be_empty
        end
      end
    end
  end
end
