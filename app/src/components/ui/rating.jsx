// app/src/components/ui/rating.jsx
import * as React from 'react';
import { Star } from 'lucide-react';
import PropTypes from 'prop-types';
import { cn } from '../../lib/utils';

export function Rating({
  value = 0,
  precision = 1,
  size = 'medium',
  readOnly = false,
  onChange,
  name,
  className,
  sx = {},
}) {
  const [hoverValue, setHoverValue] = React.useState(null);
  const [isFocused, setIsFocused] = React.useState(false);
  const totalStars = 5;
  const starSize = size === 'small' ? 'w-4 h-4' : 'w-5 h-5';

  // Round value to nearest step (0.5 or 1)
  const roundToStep = (val) => {
    if (precision === 0.5) {
      return Math.round(val * 2) / 2;
    }
    return Math.round(val);
  };

  const handleMouseMove = (event, starIndex) => {
    if (readOnly) return;
    const star = event.currentTarget;
    const rect = star.getBoundingClientRect();
    const width = rect.width;
    const x = event.clientX - rect.left;
    const ratio = x / width;

    // For RTL, check if mouse is on right half of star for 0.5 step
    let value = starIndex + 1;
    if (precision === 0.5 && ratio >= 0.5) {
      value -= 0.5;
    }

    setHoverValue(value);
  };

  const handleClick = (starIndex, event) => {
    if (readOnly) return;
    const star = event.currentTarget;
    const rect = star.getBoundingClientRect();
    const width = rect.width;
    const x = event.clientX - rect.left;
    const ratio = x / width;

    // For RTL, calculate value based on right side click position
    let newValue = starIndex + 1;
    if (precision === 0.5 && ratio >= 0.5) {
      newValue -= 0.5;
    }

    onChange?.({}, roundToStep(newValue));
  };

  const handleKeyDown = (event) => {
    if (readOnly) return;

    const currentValue = value || 0;
    let newValue = currentValue;

    switch (event.key) {
      case 'ArrowRight':
        newValue = Math.max(0, currentValue - precision);
        break;
      case 'ArrowLeft':
        newValue = Math.min(5, currentValue + precision);
        break;
      case 'Home':
        newValue = 0;
        break;
      case 'End':
        newValue = 5;
        break;
      default:
        return;
    }

    event.preventDefault();
    if (onChange && newValue !== currentValue) {
      onChange({}, roundToStep(newValue));
    }
  };

  const renderStar = (index) => {
    const displayValue = hoverValue ?? value;
    const filled = displayValue >= index + 1;
    const halfFilled =
      !filled && displayValue > index && displayValue < index + 1;

    return (
      <button
        key={index}
        type="button"
        onClick={(e) => handleClick(index, e)}
        onMouseMove={(e) => handleMouseMove(e, index)}
        onMouseEnter={() => !readOnly && setHoverValue(index + 1)}
        onMouseLeave={() => !readOnly && setHoverValue(null)}
        onKeyDown={handleKeyDown}
        disabled={readOnly}
        name={name}
        role="radio"
        aria-checked={filled}
        aria-label={`${index + 1} stars`}
        className={cn(
          'relative transition-all',
          'hover:scale-110 active:scale-95',
          !readOnly && 'hover:text-primary cursor-pointer',
          readOnly && 'cursor-default',
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          'rounded-sm',
          filled ? 'text-primary' : 'text-muted-foreground'
        )}>
        {halfFilled ? (
          <div className="relative">
            {/* Empty star */}
            <Star
              className={cn(starSize, 'transition-colors')}
              strokeWidth={1.5}
            />

            {/* Half-filled star (RTL-aware) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                clipPath: 'inset(0 0 0 50%)',
              }}>
              <Star
                className={cn(
                  starSize,
                  'fill-primary text-primary transition-colors'
                )}
                strokeWidth={1.5}
              />
            </div>
          </div>
        ) : (
          <Star
            className={cn(
              starSize,
              filled && 'fill-current',
              'transition-colors'
            )}
            strokeWidth={1.5}
          />
        )}
      </button>
    );
  };

  return (
    <div
      className={cn(
        'inline-flex gap-0.5',
        isFocused && 'ring-ring ring-2 ring-offset-2',
        className
      )}
      style={sx}
      role="radiogroup"
      aria-label="Rating"
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}>
      {[...Array(totalStars)].map((_, index) => renderStar(index))}
    </div>
  );
}

Rating.propTypes = {
  value: PropTypes.number,
  precision: PropTypes.oneOf([0.5, 1]),
  size: PropTypes.oneOf(['small', 'medium']),
  readOnly: PropTypes.bool,
  onChange: PropTypes.func,
  name: PropTypes.string,
  className: PropTypes.string,
  sx: PropTypes.object,
};
