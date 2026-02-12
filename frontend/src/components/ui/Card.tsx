import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'card-elevated rounded-xl p-6 transition-all duration-300',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
