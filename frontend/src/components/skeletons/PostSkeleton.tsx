export function PostSkeleton() {
  return (
    <div className="flex w-full animate-pulse gap-4 border-b border-gray-700 p-4">
      <div className="h-10 w-10 shrink-0 rounded-full bg-gray-700" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-3 w-24 rounded bg-gray-700" />
        <div className="h-3 w-full rounded bg-gray-700" />
        <div className="h-40 w-full rounded bg-gray-700" />
      </div>
    </div>
  )
}
