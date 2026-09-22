import { createFileRoute } from '@tanstack/react-router'

import { Timeline } from '@/features/posts/components/Timeline'

export const Route = createFileRoute('/_authenticated/')({
  component: Timeline,
})
