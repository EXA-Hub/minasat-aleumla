import { useState } from 'react';
import PropTypes from 'prop-types';

const CoinIcon = ({ amount }) => {
  const [isHovered, setIsHovered] = useState(false);
  // Format amount with commas for full view
  const formattedAmount = new Intl.NumberFormat().format(amount);
  // Convert the amount to a more readable form, e.g., 21M
  const shortAmount =
    amount >= 1_000_000
      ? `${Math.floor((amount / 1_000_000).toFixed(1))} مليون`
      : amount >= 1_000
        ? `${Math.floor((amount / 1_000).toFixed(1))} ألف`
        : amount;

  return (
    <div
      className="relative flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`المبلغ: ${formattedAmount}`}>
      {/* Short Amount (Visible by default) */}
      <span className="transition-opacity duration-300 ease-in-out">
        {shortAmount}
      </span>

      {/* Full Amount (Visible on hover) */}
      <span
        className={`absolute transition-opacity duration-300 ease-in-out ${
          isHovered ? 'opacity-100' : 'opacity-0'
        } bg-gray-900 text-white text-sm px-2 py-1 rounded-md shadow-lg`}
        style={{ top: '-2rem' }} // Position the tooltip above the icon
      >
        {formattedAmount}
      </span>

      {/* Coin Icon */}
      <img
        src="/icon.svg"
        alt="رمز العملة"
        className="w-5 h-5 object-contain"
      />
    </div>
  );
};

CoinIcon.propTypes = {
  amount: PropTypes.number.isRequired, // Validates that `amount` is a number
};

export default CoinIcon;
