import { useState } from 'react';

const Badge = ({ name, icon, tooltipMessage, isPremium = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {isHovered && (
        <div className="fixed top-4 bg-black/90 text-white text-sm px-2 py-1 rounded-md -translate-x-1/2 left-1/2 whitespace-nowrap z-50">
          {tooltipMessage}
        </div>
      )}

      <button
        type="button"
        className={`
          group relative w-10 h-10 rounded-xl
          flex items-center justify-center
          transition-all duration-300 ease-out
          ${
            isPremium
              ? 'bg-gradient-to-br from-amber-100 via-amber-300 to-amber-500 shadow-lg shadow-amber-500/30'
              : 'bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-lg shadow-zinc-900/30'
          }
          hover:scale-105 active:scale-95
        `}>
        <div
          className={`
          absolute inset-0.5 rounded-[10px]
          ${
            isPremium
              ? 'bg-gradient-to-br from-amber-900 to-amber-950'
              : 'bg-gradient-to-br from-zinc-900 to-zinc-950'
          }
        `}
        />
        <div className="relative w-full h-full p-2 flex items-center justify-center">
          <img
            src={icon}
            alt={name}
            className={`
              w-8 h-8 object-contain
              transition-transform duration-300
              group-hover:scale-110
              ${isPremium ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]'}
              [filter:brightness(0)_invert(1)]
            `}
          />
        </div>
      </button>
    </div>
  );
};

import PropTypes from 'prop-types';
Badge.propTypes = {
  name: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  tooltipMessage: PropTypes.string.isRequired,
  isPremium: PropTypes.bool,
};

export default Badge;
