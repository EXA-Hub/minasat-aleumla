// app/src/components/ui/badge.jsx
import PropTypes from 'prop-types';
import { useState } from 'react';

const Badge = ({ name, icon, tooltipMessage, isPremium = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <div
        className="fixed top-4 bg-black/90 text-white text-sm px-2 py-1 rounded-md -translate-x-1/2 left-1/2 whitespace-nowrap transition-opacity duration-200"
        style={{
          opacity: isHovered ? 1 : 0,
          pointerEvents: 'none',
          zIndex: 9999,
        }}>
        {tooltipMessage}
      </div>
      {/* Badge */}
      <div
        className={`
          w-8 h-8 rounded-full 
          flex items-center justify-center
          ${
            isPremium
              ? 'bg-gradient-to-br from-yellow-200/10 to-yellow-500/10 border-2 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.3)]'
              : 'bg-gray-900/50 border border-white/10'
          }
          transition-all duration-200
          hover:scale-110 hover:bg-gray-800/50
          active:scale-95
        `}>
        <img
          src={icon}
          alt={name}
          className={`
            w-5 h-5 
            transition-all duration-200 
            group-hover:scale-110
            ${isPremium ? 'drop-shadow-[0_0_6px_rgba(234,179,8,0.4)]' : ''}
          `}
        />
      </div>
      <span className="sr-only">{name}</span>
    </div>
  );
};

Badge.propTypes = {
  name: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  tooltipMessage: PropTypes.string.isRequired,
  isPremium: PropTypes.bool,
};

export default Badge;
