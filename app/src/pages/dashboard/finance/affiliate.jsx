// my-react-app/src/pages/dashboard/finance/affiliate.jsx
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { DollarSign, Users } from 'lucide-react';
import CoinIcon from '../../../components/ui/CoinIcon';
import api from '../../../utils/api';

const AffiliatePage = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState(null); // null, 'success', 'failure'
  const [url, setUrl] = useState(`${window.location.origin}/ref/UID`);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const data = await api.affiliate.getReferrals();
        setReferrals(data.referrals);
        setUrl(`${window.location.origin}/ref/${data.id}`);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  const handleCollectTaxes = async () => {
    try {
      setLoading(true);
      const msg = await api.affiliate.collectTaxes();
      const data = await api.affiliate.getReferrals();
      setReferrals(data.referrals);
      setUrl(`${window.location.origin}/ref/${data.id}`);
      toast.success(msg.message);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );
  }

  const handleCopy = (textToCopy) => {
    try {
      navigator.clipboard.writeText(textToCopy);
      setCopyStatus('success');
    } catch (error) {
      setCopyStatus('failure');
      console.error(error);
    } finally {
      setTimeout(() => setCopyStatus(null), 1000); // Reset after 1 second
    }
  };

  return (
    <div dir="rtl" className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">برنامج الإحالة</h2>
        <button
          onClick={handleCollectTaxes}
          disabled={!referrals.reduce((sum, ref) => sum + ref.tax, 0)}
          className="bg-primary hover:bg-primary rounded-md px-4 py-2 text-white">
          حصد الأرباح
        </button>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">رابط الإحالة الخاص بك</h3>
        <div className="flex items-center gap-2 rounded-md bg-gray-50 p-3 dark:bg-gray-800">
          <code className="flex-1 truncate break-words">{url}</code>
          <button
            onClick={() => handleCopy(url)}
            className="text-primary hover:text-primary">
            نسخ
          </button>
          {copyStatus && (
            <span
              className={`transition-all duration-500 ${
                copyStatus === 'success'
                  ? 'animate-bounce text-green-600'
                  : 'animate-shake text-red-600'
              }`}>
              {copyStatus === 'success' ? '✔' : '✘'}
            </span>
          )}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="text-primary h-5 w-5" />
            <span className="text-gray-600">عدد الإحالات</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{referrals.length}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="text-primary h-5 w-5" />
            <span className="text-gray-600">مجموع الأرباح</span>
          </div>
          <div className="mt-2 text-2xl font-bold">
            <CoinIcon
              amount={referrals.reduce((sum, ref) => sum + ref.tax, 0)}
            />
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4 text-right">المستخدم</th>
              <th className="p-4 text-right">الأرباح</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((referral) => (
              <tr key={referral._id} className="border-t">
                <td className="p-4">{referral.username}</td>
                <td className="p-4">
                  <CoinIcon amount={referral.tax} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default AffiliatePage;
