// src/pages/dashboard/transactions.jsx
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Card } from '../../components/ui/card';
import TransactionsList from '../../components/dashboard/widgets/TransactionsList';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    hasMore: false,
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.transactions.getAll(
          pagination.page,
          pagination.limit
        );

        setTransactions(response.transactions);
        setPagination((prev) => ({
          ...prev,
          hasMore: response.pagination.hasMore,
        }));
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        setError(error.data?.error || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [pagination.page, pagination.limit]);

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="p-6 text-center text-red-600">
          <p className="font-bold">{error}</p>
          <button
            onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
            className="mt-4 text-primary hover:underline">
            إعادة المحاولة
          </button>
        </Card>
      </div>
    );
  }

  if (loading && transactions.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">المعاملات</h2>

      <Card className="p-6">
        <TransactionsList transactions={transactions} isLoading={loading} />

        {pagination.hasMore && (
          <div className="mt-4 text-center">
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              className="px-4 py-2 text-primary hover:underline disabled:opacity-50"
              disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
              ) : null}
              تحميل المزيد
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Transactions;
