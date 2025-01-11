// my-react-app/src/pages/dashboard/finance/affiliate.jsx
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { DollarSign, Users } from 'lucide-react';
import api from '../../../utils/api';
import { toast } from 'react-hot-toast';
import CoinIcon from '../../../components/ui/CoinIcon';

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
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  const handleCopy = (textToCopy) => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          setCopyStatus('success');
          setTimeout(() => setCopyStatus(null), 1000); // Reset after 1 second
        })
        .catch(() => {
          setCopyStatus('failure');
          setTimeout(() => setCopyStatus(null), 1000); // Reset after 1 second
        });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (successful) {
        setCopyStatus('success');
        setTimeout(() => setCopyStatus(null), 1000);
      } else {
        setCopyStatus('failure');
        setTimeout(() => setCopyStatus(null), 1000);
      }
    }
  };

  return (
    <div dir="rtl" className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">برنامج الإحالة</h2>
        <button
          onClick={handleCollectTaxes}
          disabled={!referrals.reduce((sum, ref) => sum + ref.tax, 0)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          حصد الأرباح
        </button>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">رابط الإحالة الخاص بك</h3>
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <code className="flex-1 break-words truncate">{url}</code>
          <button
            onClick={() => handleCopy(url)}
            className="text-blue-600 hover:text-blue-700"
          >
            نسخ
          </button>
          {copyStatus && (
            <span
              className={`transition-all duration-500 ${
                copyStatus === 'success'
                  ? 'text-green-600 animate-bounce'
                  : 'text-red-600 animate-shake'
              }`}
            >
              {copyStatus === 'success' ? '✔' : '✘'}
            </span>
          )}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-gray-600">عدد الإحالات</span>
          </div>
          <p className="text-2xl font-bold mt-2">{referrals.length}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <span className="text-gray-600">مجموع الأرباح</span>
          </div>
          <div className="text-2xl font-bold mt-2">
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
