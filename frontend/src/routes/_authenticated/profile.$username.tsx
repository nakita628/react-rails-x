import { createFileRoute } from '@tanstack/react-router'

import { ProfileHeaderSkeleton } from '@/components/skeletons/ProfileHeaderSkeleton'
import { ProfileView } from '@/features/profile/components/ProfileView'
import { $api } from '@/lib'

export const Route = createFileRoute('/_authenticated/profile/$username')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      $api.queryOptions('get', '/api/users/{username}', {
        params: { path: { username: params.username } },
      }),
    ),
  pendingComponent: () => (
    <div className="min-h-screen flex-[4_4_0] border-r border-gray-700">
      <ProfileHeaderSkeleton />
    </div>
  ),
  errorComponent: () => (
    <div className="min-h-screen flex-[4_4_0] border-r border-gray-700">
      <p className="mt-4 text-center text-lg">User not found</p>
    </div>
  ),
  component: RouteComponent,
})

function RouteComponent() {
  const { username } = Route.useParams()
  return <ProfileView key={username} username={username} />
}
