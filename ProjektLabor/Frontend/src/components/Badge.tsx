import React from 'react'
import clsx from 'clsx'

type Variant = 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple'

const styles: Record<Variant, string> = {
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  variant?: Variant
}

export const Badge: React.FC<BadgeProps> = ({ children, className, variant = 'gray', ...rest }) => (
  <span
    className={clsx('inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium', styles[variant], className)}
    {...rest}
  >
    {children}
  </span>
)

export default Badge
