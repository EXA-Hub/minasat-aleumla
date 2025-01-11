// src/components/dashboard/widgets/TransactionsList.jsx
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import CoinIcon from '../../ui/CoinIcon';

const TransactionsList = ({ transactions }) => {
  const getTransactionIcon = (type) => {
    return type === 'incoming' ? (
      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
        <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
      </div>
    ) : (
      <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
        <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {transactions?.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">
          لا توجد معاملات حتى الآن
        </p>
      ) : (
        transactions?.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 rounded-lg bg-card border"
          >
            <div className="flex items-center gap-4">
              {getTransactionIcon(transaction.type)}
              <div>
                <p className="font-medium">
                  {transaction.description}
                  {'  -  '}
                  <a
                    href={`/profile/@${transaction.otherParty}`}
                    className="underline text-inherit"
                  >
                    @{transaction.otherParty}
                  </a>
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={
                  transaction.type === 'incoming'
                    ? 'text-green-600'
                    : 'text-red-600'
                }
              >
                {transaction.type === 'incoming' ? '+' : '-'}
              </span>
              <CoinIcon amount={transaction.amount} />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TransactionsList;
