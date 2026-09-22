import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { differenceInDays, differenceInHours, differenceInMinutes, format } from 'date-fns'
import type { MethodResponse } from 'openapi-react-query'
import { type ReactNode, useOptimistic, useState, useTransition } from 'react'
import toast from 'react-hot-toast'
import { BiRepost } from 'react-icons/bi'
import { FaRegComment, FaRegHeart, FaTrash } from 'react-icons/fa'
import { FaBookmark, FaHeart, FaRegBookmark } from 'react-icons/fa6'

import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { $api } from '@/lib'

import { LinkEmbed } from './LinkEmbed'

/**
 * 投稿の時刻をタイムライン風に整形する。新しいうちは相対表示、1 日を過ぎたら絶対表示。
 *
 * @param createdAt - 投稿の作成時刻（ISO 8601）
 * @returns `Just now` / `5m` / `3h` / `1d`、1 日を過ぎたら `MMM d`
 */
function formatPostDate(createdAt: string) {
  const created = new Date(createdAt)
  const now = new Date()

  const days = differenceInDays(now, created)
  if (days > 1) return format(created, 'MMM d')
  if (days === 1) return '1d'

  const hours = differenceInHours(now, created)
  if (hours >= 1) return `${hours}h`

  const minutes = differenceInMinutes(now, created)
  if (minutes >= 1) return `${minutes}m`

  return 'Just now'
}

type Post = MethodResponse<typeof $api, 'get', '/api/posts'>[number]

const URL_RE = /https?:\/\/[^\s<>"')]+/g

// URL の直後によく書かれる句読点は URL の一部ではない（"See https://x.dev." の末尾のピリオドなど）

const trimTrailingPunctuation = (raw: string) => raw.replace(/[.,;:!?]+$/, '')

function embedUrls(text: string | null | undefined): string[] {
  if (!text) return []
  const urls = [...text.matchAll(URL_RE)].map((match) => trimTrailingPunctuation(match[0]))
  return [...new Set(urls)].slice(0, 3)
}

function renderTextWithLinks(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let cursor = 0
  let key = 0

  for (const match of text.matchAll(URL_RE)) {
    const url = trimTrailingPunctuation(match[0])
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index))
    nodes.push(
      <a
        key={key++}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sky-400 hover:underline"
      >
        {url}
      </a>,
    )
    cursor = match.index + url.length
  }
  if (cursor < text.length) nodes.push(text.slice(cursor))

  return nodes
}

export function Post({ post }: { post: Post }) {
  const queryClient = useQueryClient()
  const { data: authUser } = $api.useSuspenseQuery('get', '/api/profile')
  const [comment, setComment] = useState('')
  const [showComments, setShowComments] = useState(false)

  const invalidatePosts = () => queryClient.invalidateQueries({ queryKey: ['get', '/api/posts'] })
  const mutation = { onSuccess: invalidatePosts }

  const deletePost = $api.useMutation('delete', '/api/posts/{id}', mutation)
  const commentPost = $api.useMutation('post', '/api/posts/{post_id}/comments', mutation)
  const like = $api.useMutation('post', '/api/posts/{post_id}/like', mutation)
  const unlike = $api.useMutation('delete', '/api/posts/{post_id}/like', mutation)
  const repost = $api.useMutation('post', '/api/posts/{post_id}/repost', mutation)
  const unrepost = $api.useMutation('delete', '/api/posts/{post_id}/repost', mutation)
  const bookmark = $api.useMutation('post', '/api/posts/{post_id}/bookmark', mutation)
  const unbookmark = $api.useMutation('delete', '/api/posts/{post_id}/bookmark', mutation)
  const path = { params: { path: { post_id: post.id } } }

  const [optimisticLike, setOptimisticLike] = useOptimistic(
    { liked: post.liked, likeCount: post.likeCount },
    (_state, nextLiked: boolean) => ({
      liked: nextLiked,
      likeCount: post.likeCount + (nextLiked ? 1 : -1),
    }),
  )
  const [isLiking, startLike] = useTransition()

  const [optimisticRepost, setOptimisticRepost] = useOptimistic(
    { reposted: post.reposted, repostCount: post.repostCount },
    (_state, nextReposted: boolean) => ({
      reposted: nextReposted,
      repostCount: post.repostCount + (nextReposted ? 1 : -1),
    }),
  )
  const [isReposting, startRepost] = useTransition()

  const [optimisticBookmarked, setOptimisticBookmarked] = useOptimistic(
    post.bookmarked,
    (_state, nextBookmarked: boolean) => nextBookmarked,
  )
  const [isBookmarking, startBookmark] = useTransition()

  const [pendingComments, addPendingComment] = useOptimistic<
    { id: string; text: string }[],
    { id: string; text: string }
  >([], (state, pending) => [...state, pending])

  const owner = post.author
  const isMyPost = authUser.id === owner.id

  const handleDelete = () => {
    deletePost.mutate(
      { params: { path: { id: post.id } } },
      {
        onSuccess: () => toast.success('Post deleted'),
        onError: () => toast.error('Could not delete'),
      },
    )
  }

  const handleLike = () =>
    startLike(async () => {
      setOptimisticLike(!post.liked)
      await (post.liked ? unlike : like).mutateAsync(path)
    })

  const handleRepost = () =>
    startRepost(async () => {
      setOptimisticRepost(!post.reposted)
      await (post.reposted ? unrepost : repost).mutateAsync(path)
    })

  const handleBookmark = () =>
    startBookmark(async () => {
      setOptimisticBookmarked(!post.bookmarked)
      await (post.bookmarked ? unbookmark : bookmark).mutateAsync(path)
    })

  const commentAction = async () => {
    const text = comment.trim()
    if (!text) return
    addPendingComment({ id: crypto.randomUUID(), text })
    setComment('')
    try {
      await commentPost.mutateAsync({ ...path, body: { text } })
      toast.success('Comment added')
    } catch {
      setComment(text)
      toast.error('Could not add your comment')
    }
  }

  return (
    <div className="flex items-start gap-2 border-b border-gray-700 p-4">
      <Link to="/profile/$username" params={{ username: owner.username }} className="shrink-0">
        <Avatar src={owner.profileImg} className="h-10 w-10" />
      </Link>

      <div className="flex flex-1 flex-col">
        {post.repostedBy && (
          <span className="mb-1 flex items-center gap-2 text-xs font-bold text-gray-500">
            <BiRepost className="h-3 w-3" />
            <Link
              to="/profile/$username"
              params={{ username: post.repostedBy.username }}
              className="hover:underline"
            >
              {post.repostedBy.fullName} reposted
            </Link>
          </span>
        )}
        <div className="flex items-center gap-2">
          <Link to="/profile/$username" params={{ username: owner.username }} className="font-bold">
            {owner.fullName}
          </Link>
          <span className="flex gap-1 text-sm text-gray-500">
            <Link to="/profile/$username" params={{ username: owner.username }}>
              @{owner.username}
            </Link>
            <span>·</span>
            <span>{formatPostDate(post.createdAt)}</span>
          </span>
          {isMyPost && (
            <span className="flex flex-1 justify-end">
              {deletePost.isPending ? (
                <Spinner size="sm" />
              ) : (
                <button type="button" onClick={handleDelete} aria-label="Delete post">
                  <FaTrash className="h-4 w-4 cursor-pointer hover:text-red-500" />
                </button>
              )}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 overflow-hidden">
          {post.text && (
            <span className="whitespace-pre-wrap">{renderTextWithLinks(post.text)}</span>
          )}
          {embedUrls(post.text).map((url) => (
            <LinkEmbed key={url} url={url} />
          ))}
          {post.img && (
            <a
              href={post.img}
              target="_blank"
              rel="noreferrer"
              aria-label="Open the attached image"
              className="w-fit"
            >
              <img
                src={post.img}
                alt=""
                className="h-80 cursor-pointer rounded-lg border border-gray-700 object-contain"
              />
            </a>
          )}
        </div>

        <div className="mt-3 flex justify-between">
          <div className="flex w-2/3 items-center justify-between">
            <button
              type="button"
              className="group flex cursor-pointer items-center gap-1"
              onClick={() => setShowComments(true)}
            >
              <FaRegComment className="h-4 w-4 text-gray-500 group-hover:text-sky-400" />
              <span className="text-sm text-gray-500 group-hover:text-sky-400">
                {post.comments.length + pendingComments.length}
              </span>
            </button>

            <button
              type="button"
              className="group flex cursor-pointer items-center gap-1"
              onClick={handleRepost}
              disabled={isReposting}
            >
              <BiRepost
                className={`h-4 w-4 group-hover:text-green-500 ${
                  optimisticRepost.reposted ? 'text-green-500' : 'text-gray-500'
                }`}
              />
              <span
                className={`text-sm group-hover:text-green-500 ${
                  optimisticRepost.reposted ? 'text-green-500' : 'text-gray-500'
                }`}
              >
                {optimisticRepost.repostCount}
              </span>
            </button>

            <button
              type="button"
              className="group flex cursor-pointer items-center gap-1"
              onClick={handleLike}
              disabled={isLiking}
            >
              {optimisticLike.liked ? (
                <FaHeart className="h-4 w-4 text-pink-500" />
              ) : (
                <FaRegHeart className="h-4 w-4 text-gray-500 group-hover:text-pink-500" />
              )}
              <span
                className={`text-sm group-hover:text-pink-500 ${
                  optimisticLike.liked ? 'text-pink-500' : 'text-gray-500'
                }`}
              >
                {optimisticLike.likeCount}
              </span>
            </button>
          </div>

          <button
            type="button"
            className="group flex cursor-pointer items-center"
            onClick={handleBookmark}
            disabled={isBookmarking}
            aria-label={optimisticBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            {optimisticBookmarked ? (
              <FaBookmark className="h-4 w-4 text-sky-500" />
            ) : (
              <FaRegBookmark className="h-4 w-4 text-gray-500 group-hover:text-sky-500" />
            )}
          </button>
        </div>
      </div>

      <Modal open={showComments} onClose={() => setShowComments(false)} title="COMMENTS">
        <div className="flex max-h-60 flex-col gap-3 overflow-auto">
          {post.comments.length === 0 && pendingComments.length === 0 && (
            <p className="text-sm text-gray-500">No comments yet 🤔 be the first 😉</p>
          )}
          {post.comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <Link
                to="/profile/$username"
                params={{ username: c.author.username }}
                className="shrink-0"
              >
                <Avatar src={c.author.profileImg} className="h-8 w-8" />
              </Link>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <Link
                    to="/profile/$username"
                    params={{ username: c.author.username }}
                    className="font-bold"
                  >
                    {c.author.fullName}
                  </Link>
                  <Link
                    to="/profile/$username"
                    params={{ username: c.author.username }}
                    className="text-sm text-gray-500"
                  >
                    @{c.author.username}
                  </Link>
                </div>
                <div className="text-sm whitespace-pre-wrap">{renderTextWithLinks(c.text)}</div>
                {embedUrls(c.text).map((url) => (
                  <LinkEmbed key={url} url={url} />
                ))}
              </div>
            </div>
          ))}
          {pendingComments.map((pendingComment) => (
            <div key={pendingComment.id} className="flex items-start gap-2 opacity-60">
              <Avatar src={authUser.profileImg} className="h-8 w-8" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-bold">{authUser.fullName}</span>
                  <span className="text-sm text-gray-500">@{authUser.username}</span>
                </div>
                <div className="text-sm">{pendingComment.text}</div>
              </div>
            </div>
          ))}
        </div>
        <form
          className="mt-4 flex items-center gap-2 border-t border-gray-700 pt-2"
          action={commentAction}
        >
          <textarea
            className="w-full resize-none rounded border border-gray-700 bg-transparent p-2 text-sm outline-none focus:border-sky-500"
            placeholder="Add a comment..."
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          <SubmitButton size="sm" pendingText={<Spinner size="sm" />}>
            Post
          </SubmitButton>
        </form>
      </Modal>
    </div>
  )
}
