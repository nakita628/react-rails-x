import { createFileRoute } from '@tanstack/react-router'

import { Bookmarks } from '@/features/posts/components/Bookmarks'

export const Route = createFileRoute('/_authenticated/bookmarks')({
  component: Bookmarks,
})
