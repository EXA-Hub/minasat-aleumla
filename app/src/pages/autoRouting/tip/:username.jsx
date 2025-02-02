// app/src/pages/autoRouting/tip/:username.jsx
import './animate.tips.css';
import { Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { walletService } from '../../../services/walletService';
import CoinIcon from '@/components/ui/CoinIcon';
import api from '../../../utils/api';

const TipPage = () => {
  const [loading, setLoading] = useState(true);
  const { username } = useParams();
  const [data, setData] = useState({
    donationPage: {
      title: '',
      minAmount: 5,
      customAmounts: [5, 10, 20, 50, 100],
    },
    username,
  });
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [message, setMessage] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomAmount, setShowCustomAmount] = useState(false); // State to control custom amount visibility

  useEffect(() => {
    const loadDonationSettings = async () => {
      try {
        const data = await api.donations.getPublicPage(username);
        setData(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.error(
          error.data?.error || 'حدث خطأ أثناء تحميل إعدادات التبرعات'
        );
      }
    };

    loadDonationSettings();
  }, [username]);

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount(0); // Clear the custom amount when selecting a preset value
    setShowCustomAmount(false); // Hide the custom amount input if a preset is selected
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    setSelectedAmount(null); // Deselect any preset amount when entering a custom value
    setShowCustomAmount(true); // Show custom input
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const amountToDonate = selectedAmount || parseFloat(customAmount);
    if (!amountToDonate || amountToDonate < data.donationPage.minAmount) {
      toast.error(
        `يرجى تحديد مبلغ تبرع لا يقل عن ${data.donationPage.minAmount}`
      );
      return;
    }

    try {
      setLoading(true);

      await walletService.transfer({
        recipient: data.username,
        amount: amountToDonate,
        description: `${message} - تبرع من صفحة التبرعات`,
        payFee: false,
      });
      // Make the donation request
      toast.success('تم التبرع بنجاح', {
        icon: (
          <Heart className="animate__animated animate__pulse animate__infinite h-6 w-6 text-red-500" />
        ),
      });
    } catch (error) {
      console.error(error);
      toast.error(error.data?.error || 'حدث خطأ أثناء التبرع');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="transform rounded-lg bg-[var(--background)] p-6 shadow-lg transition duration-500">
      <h2 className="animate__animated animate__fadeIn mb-6 text-center text-3xl font-bold text-primary">
        {data.donationPage.title}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="animate__animated animate__fadeIn animate__delay-1s space-y-6">
        <div className="mb-6 grid grid-cols-3 gap-3">
          {data.donationPage.customAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              className={`rounded-lg border-2 border-transparent p-4 transition-all duration-300 ease-in-out hover:border-primary ${
                selectedAmount === amount && !showCustomAmount
                  ? 'scale-105 transform bg-primary ease-in'
                  : ''
              }`}
              onClick={() => handleAmountSelect(amount)}>
              <div className="flex items-center justify-center">
                <CoinIcon amount={amount} />
              </div>
            </button>
          ))}
          <button
            type="button"
            className={`rounded-lg border-2 border-transparent p-4 transition-all duration-300 ease-in-out hover:border-primary ${
              showCustomAmount || selectedAmount === null
                ? 'scale-105 transform bg-primary ease-in'
                : ''
            }`}
            onClick={() => setShowCustomAmount(true)} // Show custom input when clicked
          >
            <div className="flex items-center justify-center">مخصص</div>
          </button>
        </div>

        {showCustomAmount && (
          <div className="animate__animated animate__fadeIn mb-4">
            <label
              htmlFor="custom-amount"
              className="block text-sm font-medium text-primary">
              مبلغ تبرع مخصص
            </label>
            <input
              type="number"
              id="custom-amount"
              value={customAmount}
              onChange={handleCustomAmountChange}
              min={data.donationPage.minAmount}
              placeholder="أدخل مبلغ مخصص"
              className="w-full rounded-lg border-2 border-primary bg-background p-3 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={250}
          placeholder="رسالة دعم (اختياري)"
          className="mb-4 w-full rounded-lg border-2 border-primary bg-background p-3 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <button
          type="submit"
          disabled={!selectedAmount || loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-3 text-white transition-all duration-300 ease-in-out hover:bg-primary">
          <Heart className="animate__animated animate__tada h-5 w-5" />
          ادعم الآن
        </button>
      </form>
      <label className="block text-sm font-medium text-red-500">
        سيتم خصم الرسوم من مبلغ التبرع
      </label>
    </div>
  );
};

export default TipPage;
