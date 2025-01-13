// app/src/pages/explore/support/donators.jsx
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Username from '../../../components/explore/widgets/Username';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '../../../utils/api';

// Components
function DonateForm() {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useOutletContext();

  const handleSubmit = async (e) => {
    if (!user) navigate('/login');
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await api.donate.create(amount);
      toast.success('شكراً لتبرعك!', {
        icon: '💌',
      });
      if (data.badge)
        toast.success(`لقد حصلت على شارة ${data.badge.name}!`, {
          icon: '🎉',
        });
      else toast.success(`رصيدك الجديد هو ${data.newBalance}`);
    } catch (error) {
      console.error(error);
      toast.error('خطأ');
    } finally {
      setIsLoading(false);
      setAmount('');
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 rounded-lg shadow-lg animate-fade-in">
      {isLoading ? (
        // Loading Card
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white font-medium">جاري معالجة التبرع...</p>
        </div>
      ) : (
        // Donation Form
        <>
          <h2 className="text-2xl font-bold text-white mb-4">تبرع الآن</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="amount"
                className="text-sm font-medium text-white">
                المبلغ{' '}
                <img
                  src="/icon.svg"
                  alt="coin"
                  className="w-5 h-5 inline filter brightness-0 invert mr-1"
                />
              </label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="أدخل المبلغ"
                required
                className="w-full bg-white/20 backdrop-blur-sm text-white placeholder:text-white/70"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-white text-purple-600 hover:bg-white/90 transition-all duration-300 transform hover:scale-105">
              تبرع 💝
            </Button>
          </form>
        </>
      )}
    </div>
  );
}

function DonatorsListWrapper() {
  const [donators, setDonators] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonators = async () => {
      try {
        const response = await api.donate.donators();
        setDonators(response);
      } catch (error) {
        console.error(error);
        setError(error.data?.error || 'خطأ في تحميل المتبرعين');
      }
    };

    fetchDonators();
  }, []);

  if (error)
    return (
      <div className="text-red-500 text-center">
        {error || 'خطأ في تحميل المتبرعين'}
      </div>
    );

  if (!donators)
    return (
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: 500 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-6 rounded-full"
            style={{ width: `${Math.floor(Math.random() * 8) + 4}rem` }} // Random width
          />
        ))}
      </div>
    );

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {donators.map((donator) => {
        const [username, isGoldDonator] = Object.entries(donator)[0];
        return (
          <div
            key={username}
            className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-300 hover:shadow-md ${
              isGoldDonator
                ? 'border border-primary text-primary bg-10primary hover:bg-20primary'
                : 'border border-foreground text-foreground bg-10foreground hover:bg-20foreground'
            }`}>
            <Username username={username} />
          </div>
        );
      })}
    </div>
  );
}

export default function DonatePage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">ادعم مجتمعنا</h1>
        <DonateForm />
        <h2 className="text-2xl font-bold text-center">المتبرعين</h2>
        <DonatorsListWrapper />
      </div>
    </div>
  );
}
