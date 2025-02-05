// app/src/components/ui/slider.jsx
import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '../../lib/utils';

const Slider = React.forwardRef(
  ({ className, value, defaultValue, ...props }, ref) => {
    const sliderValue = Array.isArray(value) ? value : [value];
    const sliderDefaultValue = Array.isArray(defaultValue)
      ? defaultValue
      : [defaultValue];

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex w-full touch-none items-center select-none',
          className
        )}
        value={sliderValue}
        defaultValue={sliderDefaultValue}
        dir="rtl"
        {...props}>
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-slate-200">
          <SliderPrimitive.Range className="absolute start-0 h-full bg-blue-600" />
        </SliderPrimitive.Track>
        {sliderValue.map((_value, i) => (
          <SliderPrimitive.Thumb
            key={i}
            className={cn(
              'block h-4 w-4 rounded-full border border-blue-500/50 bg-white shadow transition-colors',
              'focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:outline-none',
              'disabled:pointer-events-none disabled:opacity-50',
              'hover:cursor-grab active:cursor-grabbing'
            )}
          />
        ))}
      </SliderPrimitive.Root>
    );
  }
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
