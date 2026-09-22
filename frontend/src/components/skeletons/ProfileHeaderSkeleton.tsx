export function ProfileHeaderSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-2 p-4">
      <div className="h-4 w-32 rounded bg-gray-700" />
      <div className="h-52 w-full rounded bg-gray-700" />
      <div className="-mt-12 h-24 w-24 rounded-full border-4 border-black bg-gray-700" />
      <div className="mt-2 h-4 w-40 rounded bg-gray-700" />
      <div className="h-3 w-24 rounded bg-gray-700" />
    </div>
  )
}
