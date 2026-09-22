import { createFileRoute } from '@tanstack/react-router'

import { Spinner } from '@/components/ui/Spinner'
import { NotificationList } from '@/features/notifications/components/NotificationList'
import { $api } from '@/lib'

export const Route = createFileRoute('/_authenticated/notifications')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData($api.queryOptions('get', '/api/notifications')),
  pendingComponent: () => (
    <div className="flex min-h-screen flex-[4_4_0] items-center justify-center border-r border-gray-700">
      <Spinner size="lg" />
    </div>
  ),
  component: NotificationList,
})
