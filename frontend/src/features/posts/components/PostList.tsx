import { useEffect, useRef } from 'react'

import type { paths } from '@/api/schema'
import { PostSkeleton } from '@/components/skeletons/PostSkeleton'
import { Spinner } from '@/components/ui/Spinner'
import { $api } from '@/lib'

import { Post } from './Post'

const PAGE_SIZE = 20

export function PostList({
  query,
}: {
  query: NonNullable<paths['/api/posts']['get']['parameters']['query']>
}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = $api.useInfiniteQuery(
    'get',
    '/api/posts',
    { params: { query } },
    {
      pageParamName: 'page',
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length < PAGE_SIZE ? undefined : allPages.length + 1,
      throwOnError: true,
    },
  )
  const posts = data?.pages.flat() ?? []
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasNextPage) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !isFetchingNextPage) void fetchNextPage()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (!data) {
    return (
      <div className="flex flex-col">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    )
  }

  if (posts.length === 0) {
    return <p className="my-4 text-center">No posts in this tab. Try switching 👻</p>
  }

  return (
    <div>
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {hasNextPage && (
        <div ref={sentinelRef} className="flex justify-center p-4">
          {isFetchingNextPage && <Spinner size="sm" />}
        </div>
      )}
    </div>
  )
}
