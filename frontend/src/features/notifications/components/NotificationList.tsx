import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaUser } from 'react-icons/fa'
import { FaHeart } from 'react-icons/fa6'
import { IoSettingsOutline } from 'react-icons/io5'

import { Avatar } from '@/components/ui/Avatar'
import { $api } from '@/lib'

export function NotificationList() {
  const { data: notifications } = $api.useSuspenseQuery('get', '/api/notifications')
  const queryClient = useQueryClient()
  const invalidate = {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get', '/api/notifications'] }),
  }
  const clear = $api.useMutation('delete', '/api/notifications', invalidate)
  const { mutate: markRead } = $api.useMutation('patch', '/api/notifications', invalidate)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    markRead({})
  }, [markRead])

  const handleClear = () => {
    setMenuOpen(false)
    clear.mutate(
      {},
      {
        onSuccess: () => toast.success('All notifications deleted'),
        onError: () => toast.error('Could not delete'),
      },
    )
  }

  return (
    <div className="min-h-screen flex-[4_4_0] border-r border-gray-700">
      <div className="flex items-center justify-between border-b border-gray-700 p-4">
        <p className="font-bold">Notifications</p>
        <div className="relative">
          <button
            type="button"
            aria-label="Settings"
            onClick={() => setMenuOpen((v) => !v)}
            className="cursor-pointer p-1"
          >
            <IoSettingsOutline className="h-5 w-5" />
          </button>
          {menuOpen && (
            <ul className="absolute right-0 z-10 mt-1 w-52 rounded-lg border border-gray-700 bg-black p-2 shadow">
              <li>
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full cursor-pointer rounded p-2 text-left hover:bg-stone-900"
                >
                  Delete all notifications
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>

      {notifications.length === 0 && (
        <div className="p-4 text-center font-bold">No notifications 🤔</div>
      )}

      {notifications.map((n) => (
        <div key={n.id} className="border-b border-gray-700">
          <div className="flex items-center gap-2 p-4">
            {n.type === 'follow' ? (
              <FaUser className="h-7 w-7 text-sky-500" />
            ) : (
              <FaHeart className="h-7 w-7 text-pink-500" />
            )}
            <Link
              to="/profile/$username"
              params={{ username: n.from.username }}
              className="flex items-center gap-2"
            >
              <Avatar src={n.from.profileImg} className="h-8 w-8" />
              <div className="flex gap-1">
                <span className="font-bold">@{n.from.username}</span>
                <span>{n.type === 'follow' ? 'followed you' : 'liked your post'}</span>
              </div>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
