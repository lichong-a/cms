import { cn } from '@cms/utils';
import { forwardRef } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-glass',
          hoverable && 'transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-900/80 hover:shadow-glass-dark cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));

CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };
export type { CardProps };
