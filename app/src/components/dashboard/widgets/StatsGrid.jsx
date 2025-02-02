// src/components/dashboard/widgets/StatsGrid.jsx
import PropTypes from 'prop-types';
import { TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import CoinIcon from '../../ui/CoinIcon';
import { Card } from '../../ui/card';

const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              إجمالي المعاملات
            </p>
            <h4 className="mt-2 text-2xl font-bold">
              {stats?.totalTransactions || 0}
            </h4>
          </div>
          <div className="rounded-full bg-primary p-2">
            <BarChart2 className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              المدفوعات
            </p>
            <h4 className="mt-2 text-2xl font-bold">
              <CoinIcon amount={stats?.totalSpent || 0} />
            </h4>
          </div>
          <div className="rounded-full bg-red-100 p-2 dark:bg-red-900">
            <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">المستلم</p>
            <h4 className="mt-2 text-2xl font-bold">
              <CoinIcon amount={stats?.totalReceived || 0} />
            </h4>
          </div>
          <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </Card>
    </div>
  );
};

StatsGrid.propTypes = {
  stats: PropTypes.object.isRequired,
};

export default StatsGrid;
