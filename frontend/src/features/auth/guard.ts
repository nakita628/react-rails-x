import type { QueryClient } from '@tanstack/react-query'

import { $api } from '@/lib'

/**
 * 認証ゲートの本体。サインイン中のユーザーを返し、未サインインなら `null` を返す。
 *
 * `_authenticated` レイアウトの `beforeLoad` から描画前に呼ばれ、`null` なら呼び出し側が `/login` へ
 * リダイレクトする（ルーティングは `routes/_authenticated.tsx`）。
 *
 * 設計上のポイントは 3 つ:
 * - **`ensureQueryData` ではなく `staleTime: 0` の `fetchQuery`**。`ensureQueryData` はキャッシュがあれば
 *   サーバーに聞かずに返すので、期限切れ・別タブでサインアウト済み・サーバー側で失効したセッションでも
 *   保護ページが一度は開いてしまう。ブロッキングのゲートは新しい答えを待ってこそ意味がある。
 * - **`retry: false`**。401（未サインイン）は想定内の答えで、一時的な失敗ではない。リトライしても往復が
 *   増えてゲートが遅くなるだけ。
 * - **`catch → clear + null`**。401 や取得失敗は伝播させず「未サインイン」として扱い、帰りがけにキャッシュを
 *   空にする。同じタブで次にサインインした人が、前の人の投稿・通知・プロフィールを読めないようにするため。
 *
 * 成功すると結果は `['get', '/api/profile']` のキャッシュに入り、以降の `/api/profile` クエリ（Sidebar や Post
 * など）は再取得せず同期的に使い回す。つまりこのゲートは認証チェックと `me` の事前取得を兼ねている。
 */
export async function fetchAuthUser(queryClient: QueryClient) {
  try {
    return await queryClient.fetchQuery({
      ...$api.queryOptions('get', '/api/profile'),
      retry: false,
      staleTime: 0,
    })
  } catch {
    queryClient.clear()
    return null
  }
}
