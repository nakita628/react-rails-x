import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Suspense } from 'react'

import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Sidebar } from '@/features/auth/components/Sidebar'
import { fetchAuthUser } from '@/features/auth/guard'
import { RightPanel } from '@/features/users/components/RightPanel'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    if (!(await fetchAuthUser(context.queryClient))) throw redirect({ to: '/login' })
  },
  component: AppLayout,
})

const rightColumnPlaceholder = <div className="mx-2 my-4 hidden w-72 lg:block" />

function AppLayout() {
  return (
    <div className="mx-auto flex max-w-6xl">
      <Sidebar />
      <Outlet />
      <ErrorBoundary fallback={rightColumnPlaceholder}>
        <Suspense fallback={rightColumnPlaceholder}>
          <RightPanel />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
