import { PostFeed } from './PostFeed'

export function Bookmarks() {
  return (
    <div className="mr-auto min-h-screen flex-[4_4_0] border-r border-gray-700">
      <div className="flex w-full items-center border-b border-gray-700 p-4">
        <p className="text-lg font-bold">Bookmarks</p>
      </div>
      <PostFeed query={{ feed: 'bookmarks' }} />
    </div>
  )
}
