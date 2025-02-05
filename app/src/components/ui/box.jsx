// app/src/components/ui/box.jsx
import * as React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

export function Box({
  children,
  dir = 'rtl',
  asChild = false,
  className = '',
  ...props
}) {
  const Comp = asChild ? React.Fragment : 'div';

  return (
    <Comp dir={dir} className={cn('relative', className)} {...props}>
      {children}
    </Comp>
  );
}

Box.propTypes = {
  children: PropTypes.node,
  dir: PropTypes.oneOf(['rtl', 'ltr']),
  asChild: PropTypes.bool,
  className: PropTypes.string,
};
