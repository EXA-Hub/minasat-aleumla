// src/components/dashboard/widgets/StatsGrid.jsx
import { Card } from '../../ui/card';
import { TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import CoinIcon from '../../ui/CoinIcon';

const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              إجمالي المعاملات
            </p>
            <h4 className="mt-2 text-2xl font-bold">
              {stats?.totalTransactions || 0}
            </h4>
          </div>
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
            <BarChart2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              المدفوعات
            </p>
            <h4 className="mt-2 text-2xl font-bold">
              <CoinIcon amount={stats?.totalSpent || 0} />
            </h4>
          </div>
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
            <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">المستلم</p>
            <h4 className="mt-2 text-2xl font-bold">
              <CoinIcon amount={stats?.totalReceived || 0} />
            </h4>
          </div>
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatsGrid;
