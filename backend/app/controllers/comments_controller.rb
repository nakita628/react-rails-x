class CommentsController < ApplicationController
  # POST /api/posts/:post_id/comments
  def create
    post = Post.find(params[:post_id])
    post.comments.create!(author: Current.user, text: params[:text].to_s.strip)
    render json: post_json(post), status: :created
  end
end
