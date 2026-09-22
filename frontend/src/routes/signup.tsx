import { createFileRoute, redirect } from '@tanstack/react-router'

import { SignupForm } from '@/features/auth/components/SignupForm'
import { fetchAuthUser } from '@/features/auth/guard'

export const Route = createFileRoute('/signup')({
  beforeLoad: async ({ context }) => {
    if (await fetchAuthUser(context.queryClient)) throw redirect({ to: '/' })
  },
  component: SignupForm,
})
