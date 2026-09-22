class NotificationsController < ApplicationController
  # GET /api/notifications?page=1&rows=20
  def index
    notifications = paginate(Current.user.notifications_to.preload(:from).order(created_at: :desc, id: :desc))
    render json: notifications.map { notification_json(it) }
  end

  # PATCH /api/notifications: すべて既読にする
  def update
    Current.user.notifications_to.where(read: false).update_all(read: true)
    head :no_content
  end

  # DELETE /api/notifications: すべて削除する
  def destroy
    Current.user.notifications_to.delete_all
    head :no_content
  end
end
