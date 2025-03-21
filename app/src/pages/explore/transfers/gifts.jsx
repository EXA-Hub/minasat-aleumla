// react-app/src/pages/explore/transfers/gifts.jsx
import { toast } from 'react-hot-toast';
import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import BalanceCard from '../../../components/dashboard/widgets/BalanceCard';
import { Alert, AlertTitle } from '@/components/ui/alert';
import CoinIcon from '../../../components/ui/CoinIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '../../../utils/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const GiftsPage = () => {
  const { user } = useOutletContext();
  const [amount, setAmount] = useState('');
  const [code, setCode] = useState('');
  const [tryCode, setTryCode] = useState('');
  const [winnersCount, setWinnersCount] = useState(''); // New state for number of winners
  const [gifts, setGifts] = useState([]);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState({
    slots: 10,
    maxCoins: 20000,
    maxUsers: 10,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    hasMore: false,
  });

  const [creating, setCreating] = useState(false);
  const [trying, setTrying] = useState(false);

  const createGift = async (e) => {
    setCreating(true);
    e.preventDefault();
    try {
      const newGift = {
        amount: parseFloat(amount),
        code,
        winnersCount: parseInt(winnersCount), // Send number of winners to backend
      };
      if (newGift.winnersCount > plan.maxUsers) {
        setError('الحد الأقصى للمستخدمين هو ' + plan.maxUsers);
        return;
      } else if (newGift.amount > plan.maxCoins) {
        setError('الحد الأقصى للمبلغ هو ' + plan.maxCoins);
        return;
      }
      const data = await api.mysteryGifts.create(newGift);
      setGifts([data, ...gifts]);
      setAmount('');
      setCode('');
      setWinnersCount(''); // Reset winners count
      toast.success('تمت بنجاح');
    } catch (err) {
      setError(err.data?.error || 'Error occurred');
    } finally {
      setCreating(false);
    }
  };

  const tryGift = async (e) => {
    setTrying(true);
    e.preventDefault();
    try {
      await api.mysteryGifts.try({ code: tryCode });
      setTryCode('');
      toast.success('تمت بنجاح');
    } catch (err) {
      setError(err.data?.error || 'Error occurred');
    } finally {
      setTrying(false);
    }
  };

  const fetchGifts = useCallback(
    async (page = 1) => {
      try {
        const data = await api.mysteryGifts.getAll(page, pagination.limit);
        setGifts(data.gifts);
        setPagination({
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          hasMore: data.pagination.hasMore,
        });
        setPlan(data.plan);
      } catch (err) {
        setError(err.data?.error || 'Error occurred');
      }
    },
    [pagination.limit]
  );

  useEffect(() => {
    if (user) fetchGifts();
  }, [fetchGifts, user]);

  if (!user)
    return (
      <div>
        من فضلك{' '}
        <Link
          to="/login"
          className="text-primary hover:underline transition-all duration-300">
          سجل دخول
        </Link>{' '}
        للوصول إلى هذه الصفحة.
      </div>
    );

  const handleNextPage = () => {
    if (pagination.hasMore) {
      fetchGifts(pagination.page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      fetchGifts(pagination.page - 1);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <BalanceCard balance={{ amount: user.balance }} />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              إنشاء هدية {plan.slots}/{pagination.total}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createGift} className="space-y-4">
              <Input
                type="number"
                placeholder="المبلغ"
                value={amount}
                min={1}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Input
                placeholder="الرمز السري"
                value={code}
                type="text"
                onChange={(e) => setCode(e.target.value)}
              />
              <Input
                type="number"
                placeholder="عدد الفائزين"
                value={winnersCount}
                min={1}
                onChange={(e) => setWinnersCount(e.target.value)}
              />
              <Button type="submit" className="w-full" disabled={creating}>
                إنشاء هدية
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تجربة رمز</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={tryGift} className="space-y-4">
              <Input
                placeholder="الرمز السري"
                type="text"
                value={tryCode}
                onChange={(e) => setTryCode(e.target.value)}
              />
              <Button type="submit" className="w-full" disabled={trying}>
                تجربة الرمز
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>هداياي</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الرابحين</TableHead>
                <TableHead>المحاولات</TableHead>
                <TableHead>الرمز</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gifts.map((gift) => (
                <TableRow key={gift.code}>
                  <TableCell>
                    {new Date(gift.createdAt).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell>
                    <CoinIcon amount={gift.amount} />
                  </TableCell>
                  <TableCell>
                    {gift.status === 'active' ? 'نشط' : 'تم الربح'}
                  </TableCell>
                  <TableCell>{gift.winners?.length || 0}</TableCell>
                  <TableCell>{gift.attempts}</TableCell>
                  <TableCell>{gift.code}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={handlePreviousPage}
              disabled={pagination.page === 1}>
              السابق
            </Button>
            <span>
              الصفحة {pagination.page} من{' '}
              {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <Button onClick={handleNextPage} disabled={!pagination.hasMore}>
              التالي
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GiftsPage;
