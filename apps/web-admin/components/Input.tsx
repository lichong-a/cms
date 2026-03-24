import { cn } from '@cms/utils';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={id}
          className={cn(
            'w-full h-10 px-3 py-2 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/20 rounded-2xl text-sm transition-all duration-300',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white/80 dark:focus:bg-gray-900/80',
            'disabled:cursor-not-allowed disabled:opacity-50 shadow-glass focus:shadow-glass-dark',
            error
              ? 'border-red-500/50 focus:ring-red-500'
              : '',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
