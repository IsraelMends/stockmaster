import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  const base =
    'inline-flex items-center rounded-lg border px-3 py-1 text-xs font-medium transition-colors'

  const variants: Record<BadgeVariant, string> = {
    default: 'border-primary/20 bg-primary/5 text-primary hover:border-primary/40 hover:bg-primary/10',
    success:
      'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10',
    warning:
      'border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/10',
    danger: 'border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 hover:border-red-500/40 hover:bg-red-500/10',
    info: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-600 dark:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/10',
  }

  return (
    <span className={cn(base, variants[variant], className)} {...props}>
      {children}
    </span>
  )
}
