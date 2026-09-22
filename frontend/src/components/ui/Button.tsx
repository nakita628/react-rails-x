import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'outline' | 'white'
type Size = 'sm' | 'md'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer'

const variants: Record<Variant, string> = {
  primary: 'bg-sky-500 text-white hover:bg-sky-600',
  white: 'bg-white text-black hover:bg-gray-200',
  outline: 'border border-gray-600 text-white hover:bg-white/10',
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-1 text-sm',
  md: 'px-5 py-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      type="button"
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}
