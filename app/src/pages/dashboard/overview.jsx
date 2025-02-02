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
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="p-6 text-center text-red-600">
          <p className="font-bold">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="mt-4 text-primary hover:underline">
            إعادة المحاولة
          </button>
        </Card>
      </div>
    );
  }

  if (loading && !stats && !balance) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">لوحة التحكم</h2>
        <p className="text-sm text-muted-foreground">
          آخر تحديث: {lastUpdated.toLocaleTimeString('ar-SA')}
        </p>
      </div>

      <Alert
        variant="info"
        className="flex items-center rounded-lg bg-yellow-100 p-4 text-yellow-800 shadow-md">
        <InfoIcon className="mr-3 h-6 w-6" />
        <AlertDescription className="text-sm">
          في حالة واجهتك مشاكل توجه إلى{' '}
          <Link to="/dashboard/security/help">صفحة المساعدة</Link>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StatsGrid stats={stats} />
        </div>
        <div>
          <BalanceCard balance={balance} />
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">آخر المعاملات</h3>
            <p className="text-sm text-muted-foreground">
              عرض آخر {recentTransactions.length} معاملات
            </p>
          </div>
          <Link
            to="/dashboard/transactions"
            className="text-sm text-primary hover:underline">
            عرض الكل
          </Link>
        </div>

        <TransactionsList
          transactions={recentTransactions}
          isLoading={loading}
        />
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-xl font-semibold">التحويلات الشهرية</h3>
          <Alert
            variant="info"
            className="flex items-center rounded-lg bg-yellow-100 p-4 text-yellow-800 shadow-md">
            <InfoIcon className="mr-3 h-6 w-6" />
            <AlertDescription className="text-sm">
              سيتم إضافة هذه الميزة قريباً للمشتركين
            </AlertDescription>
          </Alert>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-xl font-semibold">توزيع المعاملات</h3>
          <Alert
            variant="info"
            className="flex items-center rounded-lg bg-yellow-100 p-4 text-yellow-800 shadow-md">
            <InfoIcon className="mr-3 h-6 w-6" />
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
