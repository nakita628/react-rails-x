class RepostsController < ApplicationController
  before_action { @post = Post.find(params[:post_id]) }

  # POST /api/posts/:post_id/repost（冪等）
  def create
    @post.reposts.find_or_create_by!(user: Current.user)
    render json: post_json(@post)
  end

  # DELETE /api/posts/:post_id/repost（冪等）
  def destroy
    @post.reposts.where(user: Current.user).delete_all
    render json: post_json(@post)
  end
end
