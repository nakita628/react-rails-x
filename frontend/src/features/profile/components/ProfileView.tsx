import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { useEffect, useRef, useState, useTransition } from 'react'
import toast from 'react-hot-toast'
import { FaLink } from 'react-icons/fa'
import { FaArrowLeft } from 'react-icons/fa6'
import { IoCalendarOutline } from 'react-icons/io5'
import { MdEdit } from 'react-icons/md'

import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { PostFeed } from '@/features/posts/components/PostFeed'
import { EditProfileModal } from '@/features/profile/components/EditProfileModal'
import { FollowButton } from '@/features/users/components/FollowButton'
import { $api } from '@/lib'

type Feed = 'posts' | 'likes'

function FeedTab({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex flex-1 cursor-pointer justify-center p-3 transition duration-300 hover:bg-stone-900"
    >
      {label}
      {active && <div className="absolute bottom-0 h-1 w-10 rounded-full bg-sky-500" />}
    </button>
  )
}

const readImage = (event: React.ChangeEvent<HTMLInputElement>, set: (v: File) => void) => {
  const file = event.target.files?.[0]
  if (!file) return
  set(file)
}

function toFormData(body: Record<string, string | File | undefined> | undefined) {
  const formData = new FormData()
  for (const [key, value] of Object.entries(body ?? {})) {
    if (value !== undefined) formData.append(key, value)
  }
  return formData
}

export function ProfileView({ username }: { username: string }) {
  const queryClient = useQueryClient()
  const { data: authUser } = $api.useSuspenseQuery('get', '/api/profile')
  const { data: user } = $api.useSuspenseQuery('get', '/api/users/{username}', {
    params: { path: { username } },
  })
  const updateProfile = $api.useMutation('patch', '/api/profile', {
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['get', '/api/profile'] }),
        queryClient.invalidateQueries({ queryKey: ['get', '/api/users/{username}'] }),
        queryClient.invalidateQueries({ queryKey: ['get', '/api/users/suggested'] }),
      ]),
  })

  const [feed, setFeed] = useState<Feed>('posts')
  const [, startTransition] = useTransition()
  const switchFeed = (next: Feed) => startTransition(() => setFeed(next))
  const [coverImg, setCoverImg] = useState<File | null>(null)
  const [profileImg, setProfileImg] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  const profileRef = useRef<HTMLInputElement>(null)

  const isMyProfile = authUser.id === user?.id

  useEffect(() => {
    if (!coverImg) {
      setCoverPreview(null)
      return
    }
    const url = URL.createObjectURL(coverImg)
    setCoverPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [coverImg])

  useEffect(() => {
    if (!profileImg) {
      setProfilePreview(null)
      return
    }
    const url = URL.createObjectURL(profileImg)
    setProfilePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [profileImg])

  const handleSaveImages = () => {
    updateProfile.mutate(
      {
        body: { ...(coverImg ? { coverImg } : {}), ...(profileImg ? { profileImg } : {}) },
        bodySerializer: toFormData,
      },
      {
        onSuccess: () => {
          setCoverImg(null)
          setProfileImg(null)
          toast.success('Profile updated')
        },
        onError: () => toast.error('Could not update'),
      },
    )
  }

  return (
    <div className="min-h-screen flex-[4_4_0] border-r border-gray-700">
      <div className="flex items-center gap-10 px-4 py-2">
        <Link to="/">
          <FaArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex flex-col">
          <p className="text-lg font-bold">{user.fullName}</p>
          <span className="text-sm text-gray-500">@{user.username}</span>
        </div>
      </div>

      <div className="group/cover relative">
        {coverPreview || user.coverImg ? (
          <img
            src={coverPreview || user.coverImg || undefined}
            alt="cover"
            className="h-52 w-full object-cover"
          />
        ) : (
          <div className="h-52 w-full bg-slate-700" />
        )}
        {isMyProfile && (
          <button
            type="button"
            aria-label="Change cover image"
            className="absolute top-2 right-2 rounded-full bg-gray-800/75 p-2 opacity-0 transition group-hover/cover:opacity-100"
            onClick={() => coverRef.current?.click()}
          >
            <MdEdit className="h-5 w-5 text-white" />
          </button>
        )}
        <input
          type="file"
          hidden
          accept="image/png,image/jpeg,image/webp,image/gif"
          ref={coverRef}
          onChange={(event) => readImage(event, setCoverImg)}
        />
        <input
          type="file"
          hidden
          accept="image/png,image/jpeg,image/webp,image/gif"
          ref={profileRef}
          onChange={(event) => readImage(event, setProfileImg)}
        />

        <div className="group/avatar absolute -bottom-16 left-4">
          <Avatar
            src={profilePreview || user.profileImg}
            className="h-32 w-32 border-4 border-black"
          />
          {isMyProfile && (
            <button
              type="button"
              aria-label="Change profile image"
              className="absolute top-5 right-3 rounded-full bg-sky-500 p-1 opacity-0 transition group-hover/avatar:opacity-100"
              onClick={() => profileRef.current?.click()}
            >
              <MdEdit className="h-4 w-4 text-white" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2 px-4">
        {isMyProfile ? (
          <EditProfileModal />
        ) : (
          <FollowButton username={user.username} isFollowing={user.isFollowing} variant="outline" />
        )}
        {(coverImg ?? profileImg) && (
          <Button size="sm" disabled={updateProfile.isPending} onClick={handleSaveImages}>
            {updateProfile.isPending ? 'Updating...' : 'Update'}
          </Button>
        )}
      </div>

      <div className="mt-14 flex flex-col gap-4 px-4">
        <div className="flex flex-col">
          <span className="text-lg font-bold">{user.fullName}</span>
          <span className="text-sm text-gray-500">@{user.username}</span>
          {user.bio && <span className="my-1 text-sm">{user.bio}</span>}
        </div>

        <div className="flex flex-wrap gap-2">
          {user.link && (
            <div className="flex items-center gap-1">
              <FaLink className="h-3 w-3 text-gray-500" />
              <a
                href={user.link}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-sky-500 hover:underline"
              >
                {user.link}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2">
            <IoCalendarOutline className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              {format(new Date(user.createdAt), "'Joined' MMMM yyyy")}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold">{user.followingCount}</span>
            <span className="text-xs text-gray-500">Following</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold">{user.followersCount}</span>
            <span className="text-xs text-gray-500">Followers</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex w-full border-b border-gray-700">
        <FeedTab label="Posts" active={feed === 'posts'} onClick={() => switchFeed('posts')} />
        <FeedTab label="Likes" active={feed === 'likes'} onClick={() => switchFeed('likes')} />
      </div>

      <PostFeed query={feed === 'posts' ? { author: user.username } : { likedBy: user.username }} />
    </div>
  )
}
