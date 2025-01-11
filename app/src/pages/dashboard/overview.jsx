// src/pages/dashboard/overview.jsx
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Loader2, Info as InfoIcon } from 'lucide-react';
import TransactionsList from '../../components/dashboard/widgets/TransactionsList';
import BalanceCard from '../../components/dashboard/widgets/BalanceCard';
import StatsGrid from '../../components/dashboard/widgets/StatsGrid';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Card } from '../../components/ui/card';
import api from '../../utils/api';

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [balance, setBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, balanceData, transactionsData] = await Promise.all([
        api.stats.getOverview(),
        api.wallet.getBalance(),
        api.transactions.getRecent(5),
      ]);

      setStats(statsData);
      setBalance({
        amount: balanceData.balance,
        lastUpdated: new Date(balanceData.lastUpdated || Date.now()),
      });
      setRecentTransactions(transactionsData.transactions);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Card className="p-6 text-center text-red-600">
          <p className="font-bold">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="mt-4 text-blue-600 hover:underline">
            إعادة المحاولة
          </button>
        </Card>
      </div>
    );
  }

  if (loading && !stats && !balance) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">لوحة التحكم</h2>
        <p className="text-sm text-muted-foreground">
          آخر تحديث: {lastUpdated.toLocaleTimeString('ar-SA')}
        </p>
      </div>

      <Alert
        variant="info"
        className="flex items-center bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow-md">
        <InfoIcon className="w-6 h-6 mr-3" />
        <AlertDescription className="text-sm">
          في حالة واجهتك مشاكل توجه إلى{' '}
          <Link to="/dashboard/security/help">صفحة المساعدة</Link>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StatsGrid stats={stats} />
        </div>
        <div>
          <BalanceCard balance={balance} />
        </div>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold">آخر المعاملات</h3>
            <p className="text-sm text-muted-foreground">
              عرض آخر {recentTransactions.length} معاملات
            </p>
          </div>
          <Link
            to="/dashboard/transactions"
            className="text-sm text-blue-600 hover:underline">
            عرض الكل
          </Link>
        </div>

        <TransactionsList
          transactions={recentTransactions}
          isLoading={loading}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">التحويلات الشهرية</h3>
          <Alert
            variant="info"
            className="flex items-center bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow-md">
            <InfoIcon className="w-6 h-6 mr-3" />
            <AlertDescription className="text-sm">
              سيتم إضافة هذه الميزة قريباً للمشتركين
            </AlertDescription>
          </Alert>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">توزيع المعاملات</h3>
          <Alert
            variant="info"
            className="flex items-center bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow-md">
            <InfoIcon className="w-6 h-6 mr-3" />
            <AlertDescription className="text-sm">
              سيتم إضافة هذه الميزة قريباً للمشتركين
            </AlertDescription>
          </Alert>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
