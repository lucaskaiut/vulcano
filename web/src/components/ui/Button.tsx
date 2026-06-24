import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'md' | 'sm'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground shadow-surface hover:bg-primary-hover active:bg-primary-active disabled:opacity-50',
  secondary:
    'bg-secondary text-secondary-foreground shadow-surface hover:bg-secondary-hover active:bg-secondary-hover disabled:opacity-50',
  ghost:
    'bg-surface-sunken text-foreground shadow-inset hover:brightness-[0.97] active:brightness-[0.94] disabled:opacity-50',
}

const sizeClasses: Record<ButtonSize, string> = {
  md: 'px-4 py-2.5 text-sm',
  sm: 'px-3 py-1.5 text-sm',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className = '', children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = 'Button'
