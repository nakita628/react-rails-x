class FollowsController < ApplicationController
  before_action :set_user

  # POST /api/users/:username/follow（冪等）。初回だけ相手に通知する。
  def create
    follow = Follow.find_or_create_by!(follower: Current.user, following: @user)
    @user.notifications_to.create!(type: "follow", from: Current.user) if follow.previously_new_record?
    show
  end

  # DELETE /api/users/:username/follow（冪等）
  def destroy
    Follow.where(follower: Current.user, following: @user).delete_all
    show
  end

  private
    def set_user
      @user = User.find_by!(username: params[:username])
    end

    def show
      render json: user_profile(User.preload(:followers, :following).find(@user.id))
    end
end
