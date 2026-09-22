import { revalidateLogic, useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import toast from 'react-hot-toast'
import * as z from 'zod'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { $api } from '@/lib'

const inputClass =
  'flex-1 rounded border border-gray-700 bg-transparent p-2 outline-none focus:border-sky-500'

/** OpenAPI 文書の `CreateUserRequest.password` / `UpdateProfileRequest.newPassword` のパスワード規則。 */
const password = (subject: 'Password' | 'New password') =>
  z
    .string()
    .min(6, { error: `${subject} must be at least 6 characters` })
    .max(72, { error: `${subject} must be 72 characters or fewer` })

/**
 * プロフィール編集フォームの形。正典は OpenAPI 文書でサーバーが検証し直すので、この写しは明らかに
 * 不正なフォームを送らずに済ませるためだけにある。
 *
 * `UpdateProfileRequest` を 1 対 1 で写してはいない。リクエストではパスワードの組は「送らないか、正しいか」
 * だが、フォームは両方の入力欄を常に描画し、空文字を「パスワードは変えない」の意味で使う。そのため
 * 各パスワード欄は `''` との union にしてあり、触っていない欄は通り、入力した欄には契約の規則がかかる。
 */
const UpdateProfileFieldsSchema = z
  .object({
    fullName: z.string().meta({
      description: 'The display name, which is shown instead of the username.',
      example: 'Alice',
    }),
    bio: z.string().meta({
      description: 'The self-description shown on the profile.',
      example: 'Building small things with Hono.',
    }),
    link: z
      .string()
      .max(100, { error: 'Link must be 100 characters or fewer' })
      .regex(/^(https?:\/\/\S+)?$/, {
        error: 'Link must be a URL starting with http:// or https://',
      })
      .meta({ description: 'External link URL.', example: 'https://example.com' }),
    currentPassword: z.union([z.literal(''), password('Password')]).meta({
      description:
        'Current password (only when changing the password; send together with newPassword).',
      example: 'correct-horse-battery-staple',
    }),
    newPassword: z.union([z.literal(''), password('New password')]).meta({
      description:
        'New password (only when changing the password; send together with currentPassword).',
      example: 'correct-horse-battery-staple',
    }),
  })
  .meta({
    description: 'Schema for updating profile fields',
    example: {
      fullName: 'Alice',
      bio: 'Building small things with Hono.',
      link: 'https://example.com',
      currentPassword: 'correct-horse-battery-staple',
      newPassword: 'correct-horse-battery-staple',
    },
  })

  .refine((values) => !(values.newPassword && !values.currentPassword), {
    error: 'Enter your current password to change it',
    path: ['currentPassword'],
  })

function toFormData(body: Record<string, string | File | undefined> | undefined) {
  const formData = new FormData()
  for (const [key, value] of Object.entries(body ?? {})) {
    if (value !== undefined) formData.append(key, value)
  }
  return formData
}

/**
 * プロフィール編集 / アカウント削除のモーダル。書き込み後に無効化するクエリキー:
 *
 * ```mermaid
 * flowchart LR
 *   U[updateProfile mutation] -->|onSuccess invalidate| K1[(get /api/profile)]
 *   U -->|onSuccess invalidate| K2[(get /api/users/*)]
 *   D[deleteProfile / アカウント削除] -->|queryClient.clear| ALL[(キャッシュを全部捨てる)]
 *
 * アカウント削除は DELETE /api/profile で、本文を持たない（DELETE に本文は定義できない）ので、
 * パスワードの再入力ではなく確認ボタンだけにしている。
 * ```
 */
export function EditProfileModal() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { data: authUser } = $api.useSuspenseQuery('get', '/api/profile')
  const updateProfile = $api.useMutation('patch', '/api/profile', {
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['get', '/api/profile'] }),
        queryClient.invalidateQueries({ queryKey: ['get', '/api/users/{username}'] }),
        queryClient.invalidateQueries({ queryKey: ['get', '/api/users/suggested'] }),
      ]),
  })
  const deleteAccount = $api.useMutation('delete', '/api/profile')
  const [open, setOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const updateForm = useForm({
    defaultValues: {
      fullName: authUser.fullName,
      bio: authUser.bio,
      link: authUser.link,
      currentPassword: '',
      newPassword: '',
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: UpdateProfileFieldsSchema,
      onSubmitAsync: async ({ value, formApi }) => {
        const { fullName, bio, link, currentPassword, newPassword } = value
        try {
          await updateProfile.mutateAsync({
            body: {
              fullName,
              bio,
              link,
              ...(newPassword && currentPassword ? { currentPassword, newPassword } : {}),
            },
            bodySerializer: toFormData,
          })
        } catch (error) {
          if ((error as { status?: number }).status === 401) {
            return { fields: { currentPassword: { message: 'Current password is incorrect' } } }
          }
          toast.error('Could not update')
          return null
        }
        toast.success('Profile updated')
        formApi.resetField('currentPassword')
        formApi.resetField('newPassword')
        setOpen(false)
        return null
      },
    },
  })

  const deleteAction = async () => {
    try {
      await deleteAccount.mutateAsync({})
    } catch {
      toast.error('Could not delete your account')
      return
    }
    queryClient.clear()
    toast.success('Your account has been deleted')
    await navigate({ to: '/login' })
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Edit profile
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Update Profile">
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            void updateForm.handleSubmit()
          }}
          noValidate
        >
          <updateForm.Field name="fullName">
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
          </updateForm.Field>
          <updateForm.Field name="bio">
            {(field) => (
              <textarea
                placeholder="Bio"
                className={inputClass}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            )}
          </updateForm.Field>
          <div className="flex flex-col gap-1">
            <updateForm.Field name="link">
              {(field) => (
                <>
                  <input
                    type="text"
                    placeholder="Link"
                    className={inputClass}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                  {field.state.meta.errors[0] && (
                    <p className="text-sm text-red-500">{field.state.meta.errors[0].message}</p>
                  )}
                </>
              )}
            </updateForm.Field>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex flex-1 flex-col gap-1">
              <updateForm.Field name="currentPassword">
                {(field) => (
                  <>
                    <input
                      type="password"
                      placeholder="Current Password"
                      autoComplete="current-password"
                      className={inputClass}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    {field.state.meta.errors[0] && (
                      <p className="text-sm text-red-500">{field.state.meta.errors[0].message}</p>
                    )}
                  </>
                )}
              </updateForm.Field>
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <updateForm.Field name="newPassword">
                {(field) => (
                  <>
                    <input
                      type="password"
                      placeholder="New Password"
                      autoComplete="new-password"
                      className={inputClass}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                    />
                    {field.state.meta.errors[0] && (
                      <p className="text-sm text-red-500">{field.state.meta.errors[0].message}</p>
                    )}
                  </>
                )}
              </updateForm.Field>
            </div>
          </div>
          <updateForm.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <SubmitButton size="sm" pendingText="Updating..." pending={isSubmitting}>
                Update
              </SubmitButton>
            )}
          </updateForm.Subscribe>
        </form>

        <div className="mt-6 border-t border-gray-700 pt-4">
          <p className="text-sm font-bold text-red-500">Danger Zone</p>
          <p className="mt-1 text-xs text-gray-500">
            Deleting your account erases every post, like, and follow. This cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              setDeleteOpen(true)
            }}
            className="mt-3 cursor-pointer rounded-full border border-red-600 px-4 py-1 text-sm font-bold text-red-500 transition-colors hover:bg-red-600/10"
          >
            Delete account
          </button>
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete account">
        <form className="flex flex-col gap-4" action={deleteAction}>
          <p className="text-sm text-gray-300">
            Are you sure you want to delete your account? This cannot be undone.
          </p>
          <SubmitButton
            size="sm"
            pendingText="Deleting..."
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete permanently
          </SubmitButton>
        </form>
      </Modal>
    </>
  )
}
