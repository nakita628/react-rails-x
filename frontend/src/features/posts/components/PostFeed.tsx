import type { ComponentProps } from 'react'

import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

import { PostList } from './PostList'

/**
 * 投稿一覧のエラー**境界**。{@link PostList} が `$api.useInfiniteQuery` でページを読み
 * （`throwOnError` なので失敗したリクエストはここに届く）、最初のページを読み込む間の
 * スケルトンは PostList 自身が出す。
 *
 * 肝心なのは `query` を `resetKey` に渡すこと。`query` が変わる、つまりフィード（all / following）や
 * author を切り替えると、前のクエリのエラー状態がリセットされて新しいクエリが試される。これがないと、
 * 一度エラーになったタブは切り替えたあとも失敗表示のままになる。
 *
 * @param query - 取得条件（`{ feed }` や `{ author }`）。クエリキーの一部なので、キャッシュの区切りにもなる。
 */
export function PostFeed({ query }: ComponentProps<typeof PostList>) {
  return (
    <ErrorBoundary
      resetKey={JSON.stringify(query)}
      fallback={<p className="my-4 text-center text-red-500">Failed to load</p>}
    >
      <PostList query={query} />
    </ErrorBoundary>
  )
}
