// react-app/src/pages/explore/transfers/cheques.jsx
import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api from '../../../utils/api';
import BalanceCard from '../../../components/dashboard/widgets/BalanceCard';
import CoinIcon from '../../../components/ui/CoinIcon';
import { toast } from 'react-hot-toast';

const ChequesPage = () => {
  const { user } = useOutletContext();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [claimCode, setClaimCode] = useState('');
  const [cheques, setCheques] = useState([]);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    hasMore: false,
  });

  const createCheque = async (e) => {
    e.preventDefault();
    try {
      const data = await api.cheques.create({
        amount: parseFloat(amount),
        description,
      });
      setCheques([data, ...cheques]);
      setAmount('');
      setDescription('');
      toast.success('تمت بنجاح');
    } catch (err) {
      console.error(err);
      setError(err.data?.error || 'Error occurred');
    }
  };

  const claimCheque = async (e) => {
    e.preventDefault();
    try {
      await api.cheques.claim({ code: claimCode });
      setClaimCode('');
      toast.success('تمت بنجاح');
    } catch (err) {
      console.error(err);
      setError(err.data?.error || 'Error occurred');
    }
  };

  const fetchCheques = useCallback(
    async (page = 1) => {
      try {
        const data = await api.cheques.getAll(page, pagination.limit);
        setCheques(data.cheques);
        setPagination({
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          hasMore: data.pagination.hasMore,
        });
      } catch (err) {
        console.error(err);
        setError(err.data?.error || 'Error occurred');
      }
    },
    [pagination.limit]
  ); // Add dependencies if needed

  useEffect(() => {
    if (user) fetchCheques();
  }, [fetchCheques, user]);

  if (!user)
    return (
      <div>
        من فضلك{' '}
        <a
          href="/login"
          className="text-primary hover:underline transition-all duration-300"
        >
          سجل دخول
        </a>{' '}
        للوصول إلى هذه الصفحة.
      </div>
    );

  const handleNextPage = () => {
    if (pagination.hasMore) {
      fetchCheques(pagination.page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      fetchCheques(pagination.page - 1);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <BalanceCard balance={{ amount: user.balance }} />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>إنشاء شيك</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createCheque} className="space-y-4">
              <Input
                type="number"
                placeholder="المبلغ"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Input
                placeholder="الوصف (اختياري)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Button type="submit" className="w-full">
                إنشاء شيك
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>صرف شيك</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={claimCheque} className="space-y-4">
              <Input
                placeholder="رمز الشيك"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value)}
              />
              <Button type="submit" className="w-full">
                صرف الشيك
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
          <CardTitle>شيكاتي</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الرسوم</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المستلم</TableHead>
                <TableHead>الرمز</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cheques.map((cheque) => (
                <TableRow key={cheque.code}>
                  <TableCell>
                    {new Date(cheque.createdAt).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell>
                    <CoinIcon amount={cheque.amount} />
                  </TableCell>
                  <TableCell>
                    <CoinIcon amount={cheque.feeAmount} />
                  </TableCell>
                  <TableCell>
                    {cheque.status === 'active' ? 'نشط' : 'تم الصرف'}
                  </TableCell>
                  <TableCell>{cheque.recipient || '-'}</TableCell>
                  <TableCell>{cheque.code}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={handlePreviousPage}
              disabled={pagination.page === 1}
            >
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

export default ChequesPage;
