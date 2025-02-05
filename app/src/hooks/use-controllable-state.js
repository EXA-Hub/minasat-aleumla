// app/src/hooks/use-controllable-state.js
import * as React from 'react';

export function useControllableState({
  value: valueProp,
  defaultValue,
  onChange,
}) {
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState(defaultValue);
  const isControlled = valueProp !== undefined;

  const value = isControlled ? valueProp : uncontrolledValue;

  const handleChange = React.useCallback(
    (nextValue) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onChange?.(nextValue);
    },
    [isControlled, onChange]
  );

  return [value, handleChange];
}
