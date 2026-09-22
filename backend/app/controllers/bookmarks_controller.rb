class BookmarksController < ApplicationController
  before_action { @post = Post.find(params[:post_id]) }

  # POST /api/posts/:post_id/bookmark（冪等。非公開なので通知しない）
  def create
    @post.bookmarks.find_or_create_by!(user: Current.user)
    render json: post_json(@post)
  end

  # DELETE /api/posts/:post_id/bookmark（冪等）
  def destroy
    @post.bookmarks.where(user: Current.user).delete_all
    render json: post_json(@post)
  end
end
