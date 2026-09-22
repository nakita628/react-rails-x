class LikesController < ApplicationController
  before_action { @post = Post.find(params[:post_id]) }

  # POST /api/posts/:post_id/like（冪等）。初回だけ投稿者に通知する。
  def create
    like = @post.likes.find_or_create_by!(user: Current.user)
    @post.author.notifications_to.create!(type: "like", from: Current.user) if like.previously_new_record? && @post.author != Current.user
    render json: post_json(@post)
  end

  # DELETE /api/posts/:post_id/like（冪等）
  def destroy
    @post.likes.where(user: Current.user).delete_all
    render json: post_json(@post)
  end
end
