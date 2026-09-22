# サインイン中ユーザー自身のアカウント。
class ProfilesController < ApplicationController
  before_action { @user = Current.user }

  # GET /api/profile
  def show
    render json: auth_user(@user)
  end

  # PATCH /api/profile（multipart/form-data）
  def update
    if params[:new_password].present?
      return render_problem :unauthorized, "Current password is incorrect" unless @user.authenticate(params[:current_password].to_s)
      @user.password = params[:new_password]
    end
    @user.update!(params.permit(:full_name, :bio, :link, :profile_img, :cover_img))
    render json: auth_user(@user)
  end

  # DELETE /api/profile: サインイン中のアカウントを消す。関連する行と画像も一緒に消える。
  # （DELETE は本文を持てないので、パスワードの再確認はしない。）
  def destroy
    @user.destroy!
    cookies.delete(:session_id)
    head :no_content
  end
end
