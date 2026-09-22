import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { BiLogOut } from 'react-icons/bi'
import { FaRegBookmark, FaUser } from 'react-icons/fa'
import { IoNotifications } from 'react-icons/io5'
import { MdHomeFilled } from 'react-icons/md'
import { SiX } from 'react-icons/si'

import { Avatar } from '@/components/ui/Avatar'
import { $api } from '@/lib'

export function Sidebar() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: authUser } = $api.useSuspenseQuery('get', '/api/profile')
  const logout = $api.useMutation('delete', '/api/session', {
    onSuccess: () => queryClient.clear(),
  })

  const { data: notifications } = $api.useQuery('get', '/api/notifications')
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

  const handleLogout = (event: React.MouseEvent) => {
    event.preventDefault()
    logout.mutate({}, { onSuccess: () => void navigate({ to: '/login' }) })
  }

  return (
    <div className="w-20 md:w-52 md:flex-[2_2_0]">
      <div className="sticky top-0 flex h-screen w-20 flex-col border-r border-gray-700 md:w-full">
        <Link to="/" className="flex justify-center md:justify-start">
          <SiX className="m-2 h-12 w-12 rounded-full fill-white p-2 hover:bg-stone-900" />
        </Link>

        <ul className="mt-4 flex flex-col gap-3">
          <li className="flex justify-center md:justify-start">
            <Link
              to="/"
              className="flex max-w-fit cursor-pointer items-center gap-3 rounded-full py-2 pr-4 pl-2 transition-all duration-300 hover:bg-stone-900"
            >
              <MdHomeFilled className="h-7 w-7" />
              <span className="hidden text-lg md:block">Home</span>
            </Link>
          </li>
          <li className="flex justify-center md:justify-start">
            <Link
              to="/notifications"
              className="flex max-w-fit cursor-pointer items-center gap-3 rounded-full py-2 pr-4 pl-2 transition-all duration-300 hover:bg-stone-900"
            >
              <span className="relative">
                <IoNotifications className="h-7 w-7" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-500 px-1 text-[10px] leading-none font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </span>
              <span className="hidden text-lg md:block">Notifications</span>
            </Link>
          </li>
          <li className="flex justify-center md:justify-start">
            <Link
              to="/bookmarks"
              className="flex max-w-fit cursor-pointer items-center gap-3 rounded-full py-2 pr-4 pl-2 transition-all duration-300 hover:bg-stone-900"
            >
              <FaRegBookmark className="h-7 w-7" />
              <span className="hidden text-lg md:block">Bookmarks</span>
            </Link>
          </li>
          <li className="flex justify-center md:justify-start">
            <Link
              to="/profile/$username"
              params={{ username: authUser.username }}
              className="flex max-w-fit cursor-pointer items-center gap-3 rounded-full py-2 pr-4 pl-2 transition-all duration-300 hover:bg-stone-900"
            >
              <FaUser className="h-7 w-7" />
              <span className="hidden text-lg md:block">Profile</span>
            </Link>
          </li>
        </ul>

        <Link
          to="/profile/$username"
          params={{ username: authUser.username }}
          className="mt-auto mb-10 flex items-center gap-2 rounded-full px-2 py-2 transition-all duration-300 hover:bg-stone-900"
        >
          <Avatar src={authUser.profileImg} className="h-8 w-8" />
          <div className="hidden flex-1 items-center justify-between md:flex">
            <div>
              <p className="w-24 truncate text-sm font-bold">{authUser.fullName}</p>
              <p className="text-sm text-gray-500">@{authUser.username}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              className="cursor-pointer p-1"
            >
              <BiLogOut className="h-5 w-5" />
            </button>
          </div>
        </Link>
      </div>
    </div>
  )
}
