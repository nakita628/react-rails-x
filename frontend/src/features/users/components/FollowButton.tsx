import { useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { $api } from '@/lib'

/**
 * フォロー / フォロー解除ボタン。成功時に無効化するクエリキー:
 *
 * ```mermaid
 * flowchart LR
 *   M[follow / unfollow mutation] -->|onSuccess invalidate| K1[(get /api/users/*)]
 *   M -->|onSuccess invalidate| K2[(get /api/profile)]
 * ```
 *
 * 自分のフォロー数も変わるので `/api/profile` も無効化する。
 */
export function FollowButton({
  username,
  isFollowing,
  variant,
}: {
  username: string
  isFollowing: boolean
  variant: 'white' | 'outline'
}) {
  const queryClient = useQueryClient()
  const mutation = {
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['get', '/api/users/{username}'] }),
        queryClient.invalidateQueries({ queryKey: ['get', '/api/users/suggested'] }),
        queryClient.invalidateQueries({ queryKey: ['get', '/api/profile'] }),
      ]),
  }
  const follow = $api.useMutation('post', '/api/users/{username}/follow', mutation)
  const unfollow = $api.useMutation('delete', '/api/users/{username}/follow', mutation)
  const isPending = follow.isPending || unfollow.isPending

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault()
    ;(isFollowing ? unfollow : follow).mutate({ params: { path: { username } } })
  }

  return (
    <Button variant={variant} size="sm" disabled={isPending} onClick={handleClick}>
      {isPending ? <Spinner size="sm" /> : isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  )
}
