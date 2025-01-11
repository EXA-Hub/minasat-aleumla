// src/pages/dashboard/wallet.jsx
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Send, AlertTriangle, InfoIcon } from 'lucide-react';
import BalanceCard from '../../components/dashboard/widgets/BalanceCard';
import { CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import CoinIcon from '../../components/ui/CoinIcon';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { walletService } from '../../services/walletService';
import { Alert, AlertDescription } from '@/components/ui/alert';
const Wallet = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [rates, setRates] = useState([]);
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
      const [ratesData, balanceData] = await Promise.all([
        walletService.getRates(),
        walletService.getBalance(),
      ]);

      setRates(ratesData);
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
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <Send className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
            className={`p-4 mb-6 rounded-lg ${
              error
                ? 'bg-red-100 text-red-600 dark:bg-red-900/20'
                : 'bg-green-100 text-green-600 dark:bg-green-900/20'
            }`}>
            {error || success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">المستلم</label>
            <input
              type="text"
              value={formData.recipient}
              onChange={(e) =>
                setFormData({ ...formData, recipient: e.target.value })
              }
              className="w-full p-2 rounded-md border bg-background"
              required
              placeholder="أدخل اسم المستخدم"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">المبلغ</label>
            <div className="relative">
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full p-2 rounded-md border bg-background"
                required
                min="1"
                placeholder="0"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <img src="/icon.svg" alt="coin" className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الوصف</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-2 rounded-md border bg-background"
              rows="3"
              placeholder="اكتب وصفاً للتحويل (اختياري)"
            />
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--background)] text-[var(--foreground)]">
            <input
              type="checkbox"
              id="payFee"
              checked={formData.payFee}
              onChange={(e) =>
                setFormData({ ...formData, payFee: e.target.checked })
              }
              className="rounded text-[#1d4ed8] focus:ring-[#1d4ed8] bg-[var(--background)] text-[var(--foreground)]"
            />
            <label htmlFor="payFee" className="text-sm">
              دفع الرسوم ({formData.amount ? calculateFee(formData.amount) : 0}{' '}
              عملة)
            </label>
            <div className="p-4 rounded-lg text-sm bg-[var(--background)] text-[var(--foreground)]">
              الرسوم: {fee}% ={' '}
              {formData.amount ? calculateFee(formData.amount) : 0} عملة
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex items-center gap-2 bg-blue-600/90 dark:bg-blue-400/90"
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
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab('buy')}
            className={`flex-1 ${activeTab === 'buy' ? 'bg-[#1d4ed8]' : 'bg-gray-200 text-gray-800'}`}>
            شراء عملات
          </Button>
          <Button
            onClick={() => setActiveTab('sell')}
            className={`flex-1 ${activeTab === 'sell' ? 'bg-[#1d4ed8]' : 'bg-gray-200 text-gray-800'}`}>
            بيع عملات
          </Button>
        </div>
        <Alert
          variant="warning"
          className="flex items-center bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow-md">
          <AlertTriangle className="w-6 h-6 mr-3" />
          <AlertDescription className="text-sm">
            شامل الضريبة التحويلية
          </AlertDescription>
        </Alert>
        <div className="grid gap-4 md:grid-cols-2">
          {rates.map((rate) => (
            <Card
              key={rate.coins}
              className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {Object.keys(rate).length < 6 ? (
                    Object.keys(rate)
                      .filter((key) => key !== 'coins') // Exclude the coins property from display
                      .map((currency) => {
                        return (
                          <span key={currency}>
                            {rate[currency]} {currency.toUpperCase()}
                          </span>
                        );
                      })
                  ) : (
                    <div className="flex flex-wrap gap-4 max-w-full overflow-auto">
                      {Object.keys(rate)
                        .filter((key) => key !== 'coins')
                        .map((currency) => (
                          <span
                            key={currency}
                            className="bg-[var(--muted)] p-1 rounded-lg font-bold text-sm max-w-[150px] text-center">
                            {rate[currency]} {currency.toUpperCase()}
                          </span>
                        ))}
                    </div>
                  )}
                  <CoinIcon amount={rate.coins} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-[#1d4ed8]">
                  {activeTab === 'buy' ? 'شراء' : 'بيع'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="space-y-6 p-6">
        <Card>
          <Alert
            variant="info"
            className="flex items-center bg-yellow-100 text-yellow-800 p-4 rounded-lg shadow-md">
            <InfoIcon className="w-6 h-6 mr-3" />
            <AlertDescription className="text-sm">
              مجرد بيانات إفتراضية (سيتم العمل على هذه الميزة للمشتركين فقط)
            </AlertDescription>
          </Alert>

          <CardHeader>
            <CardTitle className="text-xl font-bold text-center text-foreground">
              الرصيد اليومي
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailyData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#d1d5db' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#d1d5db' }}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ payload }) => (
                      <div className="bg-background text-foreground p-2 border rounded shadow">
                        {payload?.[0]?.value && (
                          <>
                            <p className="text-sm font-medium">الرصيد:</p>
                            <CoinIcon amount={payload[0].value} />
                          </>
                        )}
                      </div>
                    )}
                    cursor={{ fill: 'rgba(29, 78, 216, 0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="#1d4ed8"
                    strokeWidth={3}
                    dot={{ stroke: '#1d4ed8', fill: '#ffffff', r: 4 }}
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
