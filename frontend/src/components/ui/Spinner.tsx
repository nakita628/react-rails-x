type SpinnerSize = 'sm' | 'md' | 'lg'

const sizeMap: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-4',
}

export function Spinner({ size = 'md' }: { size?: SpinnerSize }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-current border-t-transparent text-sky-500 ${sizeMap[size]}`}
    />
  )
}
