import avatarPlaceholder from '@/assets/avatar-placeholder.jpg'

export function Avatar({
  src,
  alt = '',
  className = 'w-10 h-10',
}: {
  src?: string | null | undefined
  alt?: string
  className?: string
}) {
  return (
    <img
      src={src || avatarPlaceholder}
      alt={alt}
      className={`${className} rounded-full bg-gray-700 object-cover`}
    />
  )
}
