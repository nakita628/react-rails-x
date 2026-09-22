class UsersController < ApplicationController
  allow_unauthenticated_access only: :create

  # POST /api/users（サインアップ）
  def create
    user = User.new(params.permit(:username, :full_name, :email_address, :password))
    if user.save
      start_new_session_for user
      render json: auth_user(user), status: :created
    elsif user.errors.of_kind?(:username, :taken) || user.errors.of_kind?(:email_address, :taken)
      render_problem :conflict, "That username or email address is already taken"
    else
      render_validation_problem user.errors
    end
  end

  # GET /api/users/:username
  def show
    render json: user_profile(User.preload(:followers, :following).find_by!(username: params[:username]))
  end

  # GET /api/users/suggested: 自分と、すでにフォローしている人を除いた最大 10 人。
  def suggested
    candidates = User.where.not(id: Current.user.id).where.not(id: Current.user.following.select(:following_id))
    users = User.where(id: candidates.pluck(:id).sample(10)).preload(:followers, :following)
    render json: users.map { user_profile(it) }
  end
end
