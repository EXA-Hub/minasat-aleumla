import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import BalanceCard from '../../components/dashboard/widgets/BalanceCard';
import LoadingPage from '../core/loading';
import api from '../../utils/api';

const Exchange = () => {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [balanceData] = await Promise.all([api.wallet.getBalance()]);
        setBalance(balanceData.balance);
      } catch (err) {
        console.error(err);
        toast.error('حدث خطأ ما');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold">
        الحوالة{' '}
        <span className="text-muted-foreground text-xs">
          (لتبديل العملات الرقمية)
        </span>
      </h2>

      <BalanceCard balance={{ amount: balance }} />

      <div className="flex flex-col items-center gap-4">
        {/* Payment Methods Section */}
        <div className="text-center">
          <h3 className="text-foreground text-2xl font-bold">
            طرق الدفع المتاحة
          </h3>
          <p className="text-muted-foreground text-xl">
            اختر طريقة الدفع المفضلة لديك
          </p>
        </div>

        {/* Payment Icons Grid */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {[
            {
              to: '/pay/paypal',
              src: '/icons/payment/paypal.png',
              alt: 'PayPal Payment',
              closed: true,
            },
            {
              to: '/pay/vodafone-cash',
              src: '/icons/payment/vodafone.png',
              alt: 'Vodafone Cash',
              closed: true,
            },
            {
              to: '/pay/crypto',
              src: '/icons/payment/crypto.png',
              alt: 'Cryptocurrency',
              closed: true,
            },
            {
              to: '/pay/probot',
              src: '/icons/payment/Probot.png',
              alt: 'Probot Payment',
              closed: false,
            },
          ].map((payment, index) =>
            payment.closed ? (
              <div
                key={index}
                className="group bg-30mutedforeground flex cursor-not-allowed items-center justify-center rounded-lg opacity-50">
                <img
                  src={payment.src}
                  className="object-contain p-2"
                  alt={payment.alt}
                />
              </div>
            ) : (
              <Link
                key={index}
                to={payment.to}
                className="group bg-30mutedforeground flex items-center justify-center rounded-lg">
                <img
                  src={payment.src}
                  className="object-contain p-2"
                  alt={payment.alt}
                />
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Exchange;
