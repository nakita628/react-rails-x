import { createFileRoute, redirect } from '@tanstack/react-router'

import { LoginForm } from '@/features/auth/components/LoginForm'
import { fetchAuthUser } from '@/features/auth/guard'

export const Route = createFileRoute('/login')({
  beforeLoad: async ({ context }) => {
    if (await fetchAuthUser(context.queryClient)) throw redirect({ to: '/' })
  },
  component: LoginForm,
})
