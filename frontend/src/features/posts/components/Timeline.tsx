import { useState, useTransition } from 'react'

import { CreatePost } from './CreatePost'
import { PostFeed } from './PostFeed'

type Feed = 'all' | 'following'

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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

export function Timeline() {
  const [feed, setFeed] = useState<Feed>('all')
  const [, startTransition] = useTransition()
  const switchFeed = (next: Feed) => startTransition(() => setFeed(next))

  return (
    <div className="mr-auto min-h-screen flex-[4_4_0] border-r border-gray-700">
      <div className="flex w-full border-b border-gray-700">
        <Tab label="For you" active={feed === 'all'} onClick={() => switchFeed('all')} />
        <Tab
          label="Following"
          active={feed === 'following'}
          onClick={() => switchFeed('following')}
        />
      </div>
      <CreatePost />
      <PostFeed query={{ feed }} />
    </div>
  )
}
