# API が返す JSON の形。view（jbuilder）は持たず、ここで組み立てて render json: に渡す。
# キーは契約どおり camelCase で書く。
module Representations
  private
    # 投稿やコメント、通知に埋め込む簡易ユーザー
    def user_summary(user)
      {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        profileImg: MediaStore.url_for(user.profile_image_key)
      }
    end

    # プロフィール（他人から見た形）
    def user_profile(user)
      user_summary(user).merge(
        coverImg: MediaStore.url_for(user.cover_image_key),
        bio: user.bio,
        link: user.link,
        followersCount: user.followers.size,
        followingCount: user.following.size,
        isFollowing: Current.user.following.any? { it.following_id == user.id },
        createdAt: user.created_at
      )
    end

    # サインイン中ユーザー自身（本人にだけ返す）
    def auth_user(user)
      user_summary(user).merge(
        emailAddress: user.email_address,
        coverImg: MediaStore.url_for(user.cover_image_key),
        bio: user.bio,
        link: user.link
      )
    end

    # reposted_by はそのフィード項目をリポストしたユーザー。元の投稿なら省く。
    def post_json(post, reposted_by: nil)
      {
        id: post.id,
        text: post.text,
        img: MediaStore.url_for(post.image_key),
        author: user_summary(post.author),
        likeCount: post.likes.size,
        liked: post.likes.any? { it.user_id == Current.user.id },
        repostCount: post.reposts.size,
        reposted: post.reposts.any? { it.user_id == Current.user.id },
        bookmarked: post.bookmarks.any? { it.user_id == Current.user.id },
        comments: post.comments.sort_by(&:created_at).map { comment_json(it) },
        createdAt: post.created_at,
        updatedAt: post.updated_at
      }.merge(reposted_by ? { repostedBy: user_summary(reposted_by) } : {})
    end

    def comment_json(comment)
      { id: comment.id, text: comment.text, author: user_summary(comment.author), createdAt: comment.created_at }
    end

    def notification_json(notification)
      {
        id: notification.id,
        type: notification.type,
        read: notification.read,
        from: user_summary(notification.from),
        createdAt: notification.created_at
      }
    end
end
