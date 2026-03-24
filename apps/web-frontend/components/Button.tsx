import { cn } from '@cms/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-2xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-glass hover:shadow-glass-dark',
        secondary: 'backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/20 text-gray-900 dark:text-gray-100 hover:bg-white/80 dark:hover:bg-gray-900/80 shadow-glass hover:shadow-glass-dark',
        ghost: 'hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-sm',
        outline: 'backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-white/30 dark:border-gray-700/30 hover:bg-white/70 dark:hover:bg-gray-900/70 shadow-glass hover:shadow-glass-dark',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
export type { ButtonProps };
