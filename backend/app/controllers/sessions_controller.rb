class SessionsController < ApplicationController
  allow_unauthenticated_access only: :create
  rate_limit to: 10, within: 3.minutes, only: :create, with: -> { render_problem :too_many_requests, "Try again later." }

  # POST /api/session（サインイン）
  def create
    if user = User.authenticate_by(params.permit(:username, :password))
      start_new_session_for user
      render json: auth_user(user)
    else
      render_problem :unauthorized, "Try another username or password."
    end
  end

  # DELETE /api/session（サインアウト）
  def destroy
    terminate_session
    head :no_content
  end
end
