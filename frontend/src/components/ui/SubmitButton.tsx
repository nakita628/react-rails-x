import type { ReactNode } from 'react'
import { useFormStatus } from 'react-dom'

import { Button } from './Button'

/**
 * 送信中は `pendingText` を表示する送信ボタン。
 *
 * `pending` は TanStack Form の `handleSubmit` で送るフォーム用。そちらは React の form action ではなく
 * `onSubmit` 経由なので `useFormStatus()` が true にならず、呼び出し側が `state.isSubmitting` を渡す。
 * `action={}` を使うフォームは `pending` を省略し、`useFormStatus()` に任せる。
 */
export function SubmitButton({
  children,
  pendingText,
  pending,
  ...props
}: React.ComponentProps<typeof Button> & { pendingText?: ReactNode; pending?: boolean }) {
  const status = useFormStatus()
  const isPending = pending ?? status.pending
  return (
    <Button {...props} type="submit" disabled={isPending}>
      {isPending ? (pendingText ?? children) : children}
    </Button>
  )
}
