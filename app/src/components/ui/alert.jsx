import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Alert = forwardRef(
  (
    { className, variant = 'default', children, dir = 'auto', ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="alert"
        dir={dir}
        className={cn(
          'relative w-full rounded-lg border p-4',
          {
            'bg-background text-foreground': variant === 'default',
            'border-red-200 bg-red-50 text-red-900 dark:border-red-200/30 dark:bg-red-900/10 dark:text-red-200':
              variant === 'destructive',
            'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-200/30 dark:bg-yellow-900/10 dark:text-yellow-200':
              variant === 'warning',
            'border-primary bg-primary text-primary dark:border-30primary dark:bg-10primary dark:text-primary':
              variant === 'info', // New informational alert style
          },
          // Add RTL-specific padding adjustments
          'ltr:text-left rtl:text-right',
          className
        )}
        {...props}>
        {children}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

const AlertTitle = forwardRef(({ className, dir = 'auto', ...props }, ref) => (
  <h5
    ref={ref}
    dir={dir}
    className={cn(
      'mb-1 font-medium leading-none tracking-tight',
      'ltr:text-left rtl:text-right',
      className
    )}
    {...props}
  />
));

AlertTitle.displayName = 'AlertTitle';

const AlertDescription = forwardRef(
  ({ className, dir = 'auto', ...props }, ref) => (
    <div
      ref={ref}
      dir={dir}
      className={cn(
        'text-sm [&_p]:leading-relaxed',
        'ltr:text-left rtl:text-right',
        className
      )}
      {...props}
    />
  )
);

AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
