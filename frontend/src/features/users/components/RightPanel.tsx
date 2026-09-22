import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { Avatar } from '@/components/ui/Avatar'
import { FollowButton } from '@/features/users/components/FollowButton'
import { $api } from '@/lib'

const INITIAL_VISIBLE = 3

export function RightPanel() {
  const { data: suggestedUsers } = $api.useSuspenseQuery('get', '/api/users/suggested', undefined, {
    staleTime: Infinity,
  })
  const [expanded, setExpanded] = useState(false)

  if (suggestedUsers.length === 0) return <div className="mx-2 my-4 hidden w-72 lg:block" />

  const visibleUsers = expanded ? suggestedUsers : suggestedUsers.slice(0, INITIAL_VISIBLE)
  const hasMore = !expanded && suggestedUsers.length > INITIAL_VISIBLE

  return (
    <div className="mx-2 my-4 hidden lg:block">
      <div className="sticky top-2 w-72 rounded-2xl bg-[#16181c] p-4">
        <p className="font-bold">Who to follow</p>
        <div className="mt-2 flex flex-col gap-4">
          {visibleUsers.map((user) => (
            <Link
              key={user.id}
              to="/profile/$username"
              params={{ username: user.username }}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <Avatar src={user.profileImg} className="h-8 w-8" />
                <div className="flex flex-col">
                  <span className="w-28 truncate font-semibold tracking-tight">
                    {user.fullName}
                  </span>
                  <span className="text-sm text-gray-500">@{user.username}</span>
                </div>
              </div>
              <FollowButton
                username={user.username}
                isFollowing={user.isFollowing}
                variant="white"
              />
            </Link>
          ))}
        </div>
        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-3 cursor-pointer text-sm text-sky-500 hover:underline"
          >
            Show more
          </button>
        )}
      </div>
    </div>
  )
}
