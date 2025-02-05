// src/pages/dashboard/wallet.jsx
import { useState, useEffect, lazy } from 'react';
import { Send, InfoIcon } from 'lucide-react';

// Dynamically import Recharts components
const LineChart = lazy(() =>
  import('recharts').then((module) => ({ default: module.LineChart }))
);
const Line = lazy(() =>
  import('recharts').then((module) => ({ default: module.Line }))
);
const XAxis = lazy(() =>
  import('recharts').then((module) => ({ default: module.XAxis }))
);
const YAxis = lazy(() =>
  import('recharts').then((module) => ({ default: module.YAxis }))
);
const CartesianGrid = lazy(() =>
  import('recharts').then((module) => ({ default: module.CartesianGrid }))
);
const Tooltip = lazy(() =>
  import('recharts').then((module) => ({ default: module.Tooltip }))
);
const ResponsiveContainer = lazy(() =>
  import('recharts').then((module) => ({ default: module.ResponsiveContainer }))
);

import { CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import BalanceCard from '../../components/dashboard/widgets/BalanceCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { walletService } from '../../services/walletService';
import { Button } from '../../components/ui/button';
import CoinIcon from '../../components/ui/CoinIcon';
import { Card } from '../../components/ui/card';

const Wallet = () => {
  const [dailyData] = useState([
    { day: 'السبت', balance: 1200 },
    { day: 'الأحد', balance: 1350 },
    { day: 'الإثنين', balance: 1500 },
    { day: 'الثلاثاء', balance: 1450 },
    { day: 'الأربعاء', balance: 1600 },
    { day: 'الخميس', balance: 1750 },
    { day: 'الجمعة', balance: 1900 },
  ]);
  const [balance, setBalance] = useState(0);
  const [fee, setFee] = useState(2);

  useEffect(() => {
    const fetchData = async () => {
      const balanceData = await walletService.getBalance();
      setBalance(balanceData.balance);
      setFee(balanceData.fee);
    };
    fetchData();
  }, []);

  const [formData, setFormData] = useState({
    recipient: '',
    amount: 0,
    description: '',
    payFee: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateFee = (amount) => Math.ceil(Number(amount) * (fee / 100));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await walletService.transfer(formData);
      setSuccess('تم تحويل العملات بنجاح');
      setFormData({
        recipient: '',
        amount: '',
        description: '',
        payFee: false,
      });
      setBalance(response.remainingBalance);
    } catch (err) {
      console.log(err);
      setError(
        err.data?.errors
          ? err.data?.errors[0]?.msg
          : err.data.error || 'حدث خطأ في التحويل'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">الرصيد</h2>
      <BalanceCard balance={{ amount: balance }} />
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="rounded-full bg-primary p-3">
            <Send className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">تحويل العملات</h3>
            <p className="text-sm text-muted-foreground">
              قم بتحويل العملات إلى مستخدم آخر
            </p>
          </div>
        </div>

        {(error || success) && (
          <div
            className={`mb-6 rounded-lg p-4 ${
              error
                ? 'bg-red-100 text-red-600 dark:bg-red-900/20'
                : 'bg-green-100 text-green-600 dark:bg-green-900/20'
            }`}>
            {error || success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">المستلم</label>
            <input
              type="text"
              value={formData.recipient}
              onChange={(e) =>
                setFormData({ ...formData, recipient: e.target.value })
              }
              className="w-full rounded-md border bg-background p-2"
              required
              placeholder="أدخل اسم المستخدم"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">المبلغ</label>
            <div className="relative">
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full rounded-md border bg-background p-2"
                required
                min="1"
                placeholder="0"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <img src="/icon.svg" alt="coin" className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">الوصف</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full rounded-md border bg-background p-2"
              rows="3"
              placeholder="اكتب وصفاً للتحويل (اختياري)"
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-background p-3 text-foreground">
            <input
              type="checkbox"
              id="payFee"
              checked={formData.payFee}
              onChange={(e) =>
                setFormData({ ...formData, payFee: e.target.checked })
              }
              className="rounded bg-background text-foreground text-primary focus:ring-primary"
            />
            <label htmlFor="payFee" className="text-sm">
              سيتم سحب (
              {parseInt(formData.amount) +
                (formData.payFee ? calculateFee(formData.amount) : 0)}
              ) من رصيدك وإرسال (
              {parseInt(formData.amount) -
                (formData.payFee ? 0 : calculateFee(formData.amount))}
              ) للمستلم
            </label>
            <div className="rounded-lg bg-background p-4 text-sm text-foreground">
              الرسوم: {fee}% ={' '}
              {formData.amount ? calculateFee(formData.amount) : 0} عملة
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex items-center gap-2 bg-90primary dark:bg-90primary"
              disabled={loading}>
              <Send className="h-4 w-4" />
              {loading ? 'جاري التحويل...' : 'تحويل'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFormData({ recipient: '', amount: '', description: '' })
              }>
              إعادة تعيين
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-6 p-6">
        <Card>
          <Alert
            variant="info"
            className="flex items-center rounded-lg bg-yellow-100 p-4 text-yellow-800 shadow-md">
            <InfoIcon className="mr-3 h-6 w-6" />
            <AlertDescription className="text-sm">
              مجرد بيانات إفتراضية (سيتم العمل على هذه الميزة للمشتركين فقط)
            </AlertDescription>
          </Alert>

          <CardHeader>
            <CardTitle className="text-center text-xl font-bold text-foreground">
              الرصيد اليومي
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailyData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="var(--foreground)"
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: 'var(--foreground)' }}
                    axisLine={{ stroke: 'var(--background)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'var(--foreground)' }}
                    axisLine={{ stroke: 'var(--background)' }}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ payload }) => (
                      <div className="rounded border bg-background p-2 text-foreground shadow">
                        {payload?.[0]?.value && (
                          <>
                            <p className="text-sm font-medium">الرصيد:</p>
                            <CoinIcon amount={payload[0].value} />
                          </>
                        )}
                      </div>
                    )}
                    cursor={{ fill: 'var(--10primary)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    dot={{
                      stroke: 'var(--primary)',
                      fill: 'var(--primary-foreground)',
                      r: 4,
                    }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Wallet;
