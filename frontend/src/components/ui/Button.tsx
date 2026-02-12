import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  asChild?: boolean
  href?: string
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-primary to-primary-dark text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30',
  secondary:
    'border-2 border-primary/50 bg-transparent text-primary backdrop-blur-sm transition-all duration-300 hover:border-primary hover:bg-primary/10',
  ghost:
    'hover:bg-foreground/10 transition-colors duration-200',
}

export function Button({
  variant = 'primary',
  asChild,
  href,
  children,
  className,
  ...props
}: ButtonProps) {
  const baseStyles =
    'group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'

  const combinedClassName = cn(
    baseStyles,
    variantStyles[variant],
    className
  )

  if (asChild && href) {
    return (
      <Link
        href={href}
        className={combinedClassName}
      >
        {children}
      </Link>
    )
  }

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  )
}
