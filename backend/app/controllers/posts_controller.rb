class PostsController < ApplicationController
  FEEDS = %w[all following bookmarks].freeze
  PRELOAD = [ :author, :likes, :reposts, :bookmarks, { comments: :author } ].freeze

  # GET /api/posts?feed=all|following|bookmarks&author=...&likedBy=...&page=1&rows=20
  # [post, reposted_by] の組を新しい順に返す。reposted_by はそのフィード項目をリポストした
  # ユーザー（元の投稿なら nil）。
  def index
    feed = params[:feed].presence || "all"
    raise ProblemDetails::InvalidParameter.new(:feed, "Feed must be one of #{FEEDS.join(', ')}") unless FEEDS.include?(feed)

    items =
      if params[:author]
        activity_of User.where(username: params[:author])
      elsif params[:liked_by]
        posts_only Post.where(id: Like.where(user_id: User.where(username: params[:liked_by]).select(:id)).select(:post_id))
      elsif feed == "following"
        activity_of User.where(id: Current.user.following.select(:following_id))
      elsif feed == "bookmarks"
        posts_only Post.where(id: Current.user.bookmarks.select(:post_id))
      else
        posts_only Post.all
      end
    render json: items.map { |post, reposted_by| post_json(post, reposted_by: reposted_by) }
  end

  # GET /api/posts/:id
  def show
    render json: post_json(Post.preload(*PRELOAD).find(params[:id]))
  end

  # POST /api/posts（multipart/form-data）
  def create
    post = Current.user.posts.create!(text: params[:text].presence, img: params[:img])
    render json: post_json(post), status: :created
  end

  # DELETE /api/posts/:id（投稿者のみ）
  def destroy
    post = Post.find(params[:id])
    return render_problem :forbidden, "You can only delete your own posts" unless post.author == Current.user

    post.destroy!
    head :no_content
  end

  private
    def posts_only(posts)
      paginate(posts.recent.preload(*PRELOAD)).map { [ it, nil ] }
    end

    # `users` の投稿とリポストを時系列でマージする。両側をこのページの末尾（offset + rows 件）まで
    # 読めば、マージ後の先頭 offset + rows 件は正確に決まる。同じ投稿が両側に出ても（投稿者本人と
    # リポストした人がどちらも `users` にいる）、重複を 1 つ消すごとに残るのは 1 件なので、
    # 片側に offset + rows 件あればページが短くなることはない。投稿は最新の活動として 1 回だけ出る。
    def activity_of(users)
      ids = users.select(:id)
      wanted = page_offset + page_rows
      own = Post.where(author_id: ids).recent.limit(wanted).map { [ it, nil, it.created_at ] }
      reposted = Repost.where(user_id: ids).order(created_at: :desc).limit(wanted).preload(:post, :user)
                       .map { [ it.post, it.user, it.created_at ] }
      pairs = (own + reposted).sort_by { |post, _, at| [ at, post.id ] }.reverse.uniq { |post, _, _| post.id }
      posts = Post.preload(*PRELOAD).where(id: pairs.map { |post, _, _| post.id }).index_by(&:id)
      pairs.drop(page_offset).first(page_rows).map { |post, reposted_by, _| [ posts.fetch(post.id), reposted_by ] }
    end
end
