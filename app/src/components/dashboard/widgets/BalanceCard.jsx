import { Card } from '../../ui/card';
import PropTypes from 'prop-types';

const CoinIcon = ({ amount }) => (
  <div className="relative inline-flex items-center">
    <span className="ml-1">{amount}</span>
    <img
      src="/icon.svg"
      alt="coin"
      className="inline h-5 w-5 brightness-0 invert filter" // Makes SVG white
    />
  </div>
);

CoinIcon.propTypes = {
  amount: PropTypes.number.isRequired,
};

const BalanceCard = ({ balance }) => {
  return (
    <Card className="bg-gradient-to-l from-primary to-accent p-6 text-white">
      <div className="flex flex-col">
        <h3 className="text-lg font-medium opacity-90">الرصيد الحالي</h3>
        <div className="mt-2 text-3xl font-bold">
          <CoinIcon amount={balance?.amount || 0} />
        </div>
        <p className="mt-2 text-sm opacity-75">
          آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
        </p>
      </div>
    </Card>
  );
};

BalanceCard.propTypes = {
  balance: PropTypes.shape({
    amount: PropTypes.number,
  }).isRequired,
};

export default BalanceCard;
