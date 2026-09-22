import { revalidateLogic, useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import toast from 'react-hot-toast'
import { FaUser } from 'react-icons/fa'
import { MdDriveFileRenameOutline, MdOutlineMail, MdPassword } from 'react-icons/md'
import { SiX } from 'react-icons/si'
import * as z from 'zod'

import { Button } from '@/components/ui/Button'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { $api } from '@/lib'

/**
 * OpenAPI 文書の `CreateUserRequest` を写したもの。正典は OpenAPI 側で、サーバーが全フィールドを検証し直して
 * 422 を返す。この写しは明らかに不正なフォームを送らずに済ませるためにあるので、契約とずれても
 * 余計なリクエストが 1 回増えるだけで、誤った書き込みにはならない。
 */
const SignupFieldsSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ error: 'Invalid email address format' }))
      .meta({
        description: 'The email address, unique across the app.',
        example: 'alice@example.com',
      }),
    username: z
      .string()
      .regex(/^[a-zA-Z0-9_]{1,15}$/, {
        error:
          'Username must be 15 characters or fewer and contain only letters, digits, and underscores',
      })
      .meta({ description: 'The sign-in name, unique across the app.', example: 'alice' }),
    fullName: z.string().min(1, { error: 'Display name is required' }).meta({
      description: 'The display name, which is shown instead of the username.',
      example: 'Alice',
    }),
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
    title: 'Sign-up fields',
    description:
      'The fields the account-creation form collects, and the messages shown when one is wrong.',
  })

const inputClass = 'grow bg-transparent outline-none'
const labelClass =
  'flex items-center gap-2 rounded border border-gray-700 px-3 py-2 focus-within:border-sky-500'

export function SignupForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const signup = $api.useMutation('post', '/api/users', {
    onSuccess: (user) => queryClient.setQueryData(['get', '/api/profile'], user),
  })
  const form = useForm({
    defaultValues: { email: '', username: '', fullName: '', password: '' },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: SignupFieldsSchema,
      onSubmitAsync: async ({ value }) => {
        try {
          // スキーマがメールを trim して小文字化する。TanStack Form は入力そのままを持つ。
          const { email, ...fields } = SignupFieldsSchema.parse(value)
          await signup.mutateAsync({ body: { ...fields, emailAddress: email } })
        } catch (error) {
          return (error as { status?: number }).status === 409
            ? 'That username or email is already taken'
            : 'Could not create your account'
        }
        toast.success('Your account has been created')
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
          <h1 className="text-4xl font-extrabold">Join today.</h1>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>
              <MdOutlineMail className="h-5 w-5 text-gray-400" />
              <form.Field name="email">
                {(field) => (
                  <input
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    className={inputClass}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                )}
              </form.Field>
            </label>
            <form.Subscribe selector={(state) => state.fieldMeta.email?.errors[0]?.message}>
              {(message) => message && <p className="text-sm text-red-500">{message}</p>}
            </form.Subscribe>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex flex-1 flex-col gap-1">
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
            <div className="flex flex-1 flex-col gap-1">
              <label className={labelClass}>
                <MdDriveFileRenameOutline className="h-5 w-5 text-gray-400" />
                <form.Field name="fullName">
                  {(field) => (
                    <input
                      type="text"
                      placeholder="Full Name"
                      className={inputClass}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                  )}
                </form.Field>
              </label>
              <form.Subscribe selector={(state) => state.fieldMeta.fullName?.errors[0]?.message}>
                {(message) => message && <p className="text-sm text-red-500">{message}</p>}
              </form.Subscribe>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>
              <MdPassword className="h-5 w-5 text-gray-400" />
              <form.Field name="password">
                {(field) => (
                  <input
                    type="password"
                    placeholder="Password"
                    autoComplete="new-password"
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
                Sign up
              </SubmitButton>
            )}
          </form.Subscribe>
          <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
            {(error) => error && <p className="text-sm text-red-500">{error}</p>}
          </form.Subscribe>
        </form>

        <div className="mt-6 flex w-full max-w-sm flex-col gap-2">
          <p className="text-lg">Already have an account?</p>
          <Link to="/login">
            <Button variant="outline" className="w-full">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
