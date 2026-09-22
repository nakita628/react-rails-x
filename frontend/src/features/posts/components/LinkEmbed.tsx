import { $api } from '@/lib'

export function LinkEmbed({ url }: { url: string }) {
  const { data } = $api.useQuery(
    'get',
    '/api/link_preview',
    { params: { query: { url } } },
    { staleTime: 1000 * 60 * 60, retry: false },
  )

  if (!data || (!data.title && !data.image)) return null

  return (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-fit max-w-sm overflow-hidden rounded-2xl border border-gray-700 hover:bg-gray-900"
    >
      {data.image && (
        <img
          src={data.image}
          alt={data.title ?? 'Link preview image'}
          className="max-h-52 w-full object-cover"
        />
      )}
      <div className="flex flex-col gap-0.5 p-3">
        {data.siteName && <span className="text-xs text-gray-500">{data.siteName}</span>}
        {data.title && <span className="text-sm font-bold">{data.title}</span>}
        {data.description && (
          <span className="line-clamp-2 text-sm text-gray-500">{data.description}</span>
        )}
      </div>
    </a>
  )
}
