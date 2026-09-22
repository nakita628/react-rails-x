import { revalidateLogic, useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { FaUser } from 'react-icons/fa'
import { MdPassword } from 'react-icons/md'
import { SiX } from 'react-icons/si'
import * as z from 'zod'

import { Button } from '@/components/ui/Button'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { $api } from '@/lib'

/**
 * OpenAPI 文書の `CreateSessionRequest` を写したもの。正典はあくまで OpenAPI 側で、この写しは明らかに
 * 不正なフォームを送らずに済ませるためだけにある。
 */
const LoginFieldsSchema = z
  .object({
    username: z
      .string()
      .regex(/^[a-zA-Z0-9_]{1,15}$/, {
        error:
          'Username must be 15 characters or fewer and contain only letters, digits, and underscores',
      })
      .meta({ description: 'The sign-in name, unique across the app.', example: 'alice' }),
    password: z
      .string({ error: 'Password must be a string' })
      .min(6, { error: 'Password must be at least 6 characters' })
      .max(72, { error: 'Password must be 72 characters or fewer' })
      .meta({
        description: 'The password as typed, before hashing.',
        example: 'correct horse battery',
      }),
  })
  .meta({
    title: 'Sign-in fields',
    description:
      'The credentials the sign-in form collects, and the messages shown when one is wrong.',
  })

const inputClass = 'grow bg-transparent outline-none'
const labelClass =
  'flex items-center gap-2 rounded border border-gray-700 px-3 py-2 focus-within:border-sky-500'

export function LoginForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const login = $api.useMutation('post', '/api/session', {
    onSuccess: (user) => queryClient.setQueryData(['get', '/api/profile'], user),
  })
  const form = useForm({
    defaultValues: { username: '', password: '' },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: LoginFieldsSchema,
      onSubmitAsync: async ({ value }) => {
        try {
          // 契約が受け取るのはスキーマの出力。TanStack Form は入力そのままを持つ。
          await login.mutateAsync({ body: LoginFieldsSchema.parse(value) })
        } catch {
          return 'Incorrect username or password'
        }
        await navigate({ to: '/' })
        return null
      },
    },
  })

  return (
    <div className="mx-auto flex h-screen max-w-7xl items-center px-10">
      <div className="hidden flex-1 items-center justify-center lg:flex">
        <SiX className="h-auto w-2/3 text-white" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center">
        <form
          className="flex w-full max-w-sm flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
          noValidate
        >
          <SiX className="h-12 w-12 text-white lg:hidden" />
          <h1 className="text-4xl font-extrabold">Let&apos;s go.</h1>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>
              <FaUser className="h-5 w-5 text-gray-400" />
              <form.Field name="username">
                {(field) => (
                  <input
                    type="text"
                    placeholder="Username"
                    autoComplete="username"
                    className={inputClass}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                )}
              </form.Field>
            </label>
            <form.Subscribe selector={(state) => state.fieldMeta.username?.errors[0]?.message}>
              {(message) => message && <p className="text-sm text-red-500">{message}</p>}
            </form.Subscribe>
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>
              <MdPassword className="h-5 w-5 text-gray-400" />
              <form.Field name="password">
                {(field) => (
                  <input
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    className={inputClass}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                )}
              </form.Field>
            </label>
            <form.Subscribe selector={(state) => state.fieldMeta.password?.errors[0]?.message}>
              {(message) => message && <p className="text-sm text-red-500">{message}</p>}
            </form.Subscribe>
          </div>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <SubmitButton pendingText="Loading..." pending={isSubmitting}>
                Login
              </SubmitButton>
            )}
          </form.Subscribe>
          <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
            {(error) => error && <p className="text-sm text-red-500">{error}</p>}
          </form.Subscribe>
        </form>

        <div className="mt-6 flex w-full max-w-sm flex-col gap-2">
          <p className="text-lg">Don&apos;t have an account?</p>
          <Link to="/signup">
            <Button variant="outline" className="w-full">
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
