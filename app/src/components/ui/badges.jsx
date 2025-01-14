// app/src/components/ui/badges.jsx
import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const Badges = ({ BadgesArray = [] }) => {
  // Track hover state for each badge separately using their index
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Memoize static styles
  const staticStyles = useMemo(
    () => ({
      tooltip: {
        position: 'fixed',
        top: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        fontSize: '0.875rem',
        padding: '0.25rem 0.5rem',
        borderRadius: '0.375rem',
        transform: 'translateX(-50%)',
        left: '50%',
        whiteSpace: 'nowrap',
        transition: 'opacity 200ms',
        pointerEvents: 'none',
        zIndex: 9999,
      },
      badgeBase: `
      w-8 h-8 rounded-full 
      flex items-center justify-center
      transition-all duration-200
      hover:scale-110 hover:bg-gray-800/50
      active:scale-95
    `,
      premiumBadge: `
      bg-gradient-to-br from-yellow-200/10 to-yellow-500/10 
      border-2 border-yellow-500/50 
      shadow-[0_0_10px_rgba(234,179,8,0.3)]
    `,
      normalBadge: 'bg-gray-900/50 border border-white/10',
      iconBase: `
      w-5 h-5 text-white
      transition-all duration-200 
      group-hover:scale-110
      transform translate-x-0 translate-y-0
    `,
    }),
    []
  );

  if (!BadgesArray?.length) return null;

  return (
    <div
      className="absolute sm:top-4 sm:right-4 top-2 right-2 flex flex-wrap gap-1.5 sm:gap-2 max-w-[calc(100%-1rem)]"
      role="group"
      aria-label="Achievement Badges"
      dir="rtl">
      {BadgesArray.map(({ name, icon, msg, isPremium }, index) => (
        <div
          key={`${name}-${index}`}
          className="relative group cursor-pointer"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          role="button"
          aria-label={`${name} badge - ${msg}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setHoveredIndex(index);
            }
          }}
          onKeyUp={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setHoveredIndex(null);
            }
          }}>
          {/* Tooltip */}
          <div
            className="tooltip"
            style={{
              ...staticStyles.tooltip,
              opacity: hoveredIndex === index ? 1 : 0,
            }}
            role="tooltip">
            {msg}
          </div>

          {/* Badge */}
          <div
            className={`
              ${staticStyles.badgeBase}
              ${isPremium ? staticStyles.premiumBadge : staticStyles.normalBadge}
            `}>
            <img
              src={icon}
              alt={name}
              className={`
                ${staticStyles.iconBase}
                ${isPremium ? 'drop-shadow-[0_0_6px_rgba(234,179,8,0.4)]' : ''}
              `}
              style={{
                WebkitMask: `url(${icon}) center/contain no-repeat`,
                mask: `url(${icon}) center/contain no-repeat`,
              }}
            />
          </div>
          <span className="sr-only">{name}</span>
        </div>
      ))}
    </div>
  );
};

Badges.propTypes = {
  BadgesArray: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      msg: PropTypes.string.isRequired,
      isPremium: PropTypes.bool.isRequired,
    })
  ),
};

export default Badges;
