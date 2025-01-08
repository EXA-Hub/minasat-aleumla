// my-react-app/src/components/ui/button.jsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';
import { buttonVariants } from './buttonVariants';
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
import PropTypes from 'prop-types'; // Import PropTypes
// Add prop types for validation
Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf([
    'default',
    'outline',
    'subtle',
    'ghost',
    'danger',
    'success',
    'warning',
  ]),
  size: PropTypes.oneOf([
    'default',
    'sm',
    'lg',
    'xl',
    'xxl',
    'mini',
    'wide',
    'icon',
  ]),
  asChild: PropTypes.bool,
};
export { Button };
