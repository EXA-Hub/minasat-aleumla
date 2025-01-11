import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import CoinIcon from '@/components/ui/CoinIcon';
import api from '../../../utils/api';
import { toast } from 'react-hot-toast';
import './animate.tips.css';
import { walletService } from '../../../services/walletService';

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
      await walletService.transfer({
        recipient: data.username,
        amount: amountToDonate,
        description: `${message} - تبرع من صفحة التبرعات`,
        payFee: false,
      });
      // Make the donation request
      toast.success('تم التبرع بنجاح', {
        icon: (
          <Heart className="h-6 w-6 text-red-500 animate__animated animate__pulse animate__infinite" />
        ),
      });
    } catch (error) {
      console.error(error);
      toast.error(error.data?.error || 'حدث خطأ أثناء التبرع');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg bg-[var(--background)] shadow-lg transform transition duration-500">
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-600 animate__animated animate__fadeIn">
        {data.donationPage.title}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 animate__animated animate__fadeIn animate__delay-1s"
      >
        <div className="grid grid-cols-3 gap-3 mb-6">
          {data.donationPage.customAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              className={`p-4 rounded-lg border-2 border-transparent hover:border-blue-500 transition-all duration-300 ease-in-out ${
                selectedAmount === amount && !showCustomAmount
                  ? 'transform scale-105 ease-in bg-blue-900'
                  : ''
              }`}
              onClick={() => handleAmountSelect(amount)}
            >
              <div className="flex justify-center items-center">
                <CoinIcon amount={amount} />
              </div>
            </button>
          ))}
          <button
            type="button"
            className={`p-4 rounded-lg border-2 border-transparent hover:border-blue-500 transition-all duration-300 ease-in-out ${
              showCustomAmount || selectedAmount === null
                ? 'transform scale-105 ease-in bg-blue-900'
                : ''
            }`}
            onClick={() => setShowCustomAmount(true)} // Show custom input when clicked
          >
            <div className="flex justify-center items-center">مخصص</div>
          </button>
        </div>

        {showCustomAmount && (
          <div className="mb-4 animate__animated animate__fadeIn">
            <label
              htmlFor="custom-amount"
              className="block text-sm font-medium text-blue-600"
            >
              مبلغ تبرع مخصص
            </label>
            <input
              type="number"
              id="custom-amount"
              value={customAmount}
              onChange={handleCustomAmountChange}
              min={data.donationPage.minAmount}
              placeholder="أدخل مبلغ مخصص"
              className="bg-background w-full p-3 border-2 border-blue-500 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={250}
          placeholder="رسالة دعم (اختياري)"
          className="bg-background w-full p-3 border-2 border-blue-500 rounded-lg mb-4 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ease-in-out hover:bg-blue-500"
        >
          <Heart className="h-5 w-5 animate__animated animate__tada" />
          ادعم الآن
        </button>
      </form>
      <label className="block text-sm font-medium text-red-500">
        سيتم فرض رسوم على التبرعات
      </label>
    </div>
  );
};

export default TipPage;
