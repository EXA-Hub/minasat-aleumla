import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Link2, Heart } from 'lucide-react';
import CoinIcon from '@/components/ui/CoinIcon';
import api from '../../../utils/api';
import { toast } from 'react-hot-toast';

const DonationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [donationPage, setDonationPage] = useState({
    title: '',
    minAmount: 5,
    customAmounts: [5, 10, 20, 50, 100],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDonationSettings();
  }, []);

  const loadDonationSettings = async () => {
    try {
      const data = await api.donations.getSettings();
      setDonationPage(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error(error.data?.error || 'حدث خطأ أثناء تحميل إعدادات التبرعات');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await api.donations.updateSettings(donationPage);
      setDonationPage(data);
      toast.success('تم الحفظ');
    } catch (error) {
      console.error(error);
      toast.error(error.data?.error || 'حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (textToCopy) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        toast.success('تم النسخ');
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (successful) {
        toast.success('تم النسخ');
      }
    }
  };
  const copyDonationLink = async () => {
    const username = (await api.auth.getMe()).username;
    const link = `${window.location.origin}/tip/${username}`;
    handleCopy(link);
  };

  const PreviewDonation = () => (
    <div className={`p-6 rounded-lg bg-[var(--background)]`}>
      <h2 className="text-2xl font-bold text-center mb-6">
        {donationPage.title}
      </h2>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {donationPage.customAmounts.map((amount) => (
          <button
            key={amount}
            className="p-3 rounded border hover:bg-blue-50 dark:hover:bg-gray-700"
          >
            <div className="flex justify-center items-center">
              <CoinIcon amount={amount} />
            </div>
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="رسالة دعم (اختياري)"
        className="w-full p-3 border rounded mb-4 bg-[var(--background)]"
      />

      <button className="w-full bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center gap-2">
        <Heart className="h-5 w-5" />
        ادعم الآن
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">صفحة التبرعات</h2>
        <div className="flex gap-2">
          <button
            onClick={copyDonationLink}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
          >
            <Link2 className="h-5 w-5" />
            نسخ الرابط
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">الإعدادات الأساسية</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">عنوان الصفحة</label>
                <input
                  type="text"
                  value={donationPage.title}
                  onChange={(e) =>
                    setDonationPage({ ...donationPage, title: e.target.value })
                  }
                  className="w-full p-2 border rounded bg-[var(--background)]"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">الحد الأدنى للتبرع</label>
                <input
                  type="number"
                  value={donationPage.minAmount}
                  onChange={(e) =>
                    setDonationPage({
                      ...donationPage,
                      minAmount: Number(e.target.value),
                    })
                  }
                  min={1}
                  className="w-full p-2 border rounded bg-[var(--background)]"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">المبالغ المقترحة</label>
                <input
                  type="text"
                  value={donationPage.customAmounts.join(', ')}
                  onChange={(e) =>
                    setDonationPage({
                      ...donationPage,
                      customAmounts: e.target.value
                        .split(',')
                        .map((n) => Number(n.trim()))
                        .filter((n) => !isNaN(n)),
                    })
                  }
                  className="w-full p-2 border rounded bg-[var(--background)]"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </button>
            </div>
          </Card>
        </div>

        <div className="sticky top-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">معاينة</h3>
            <PreviewDonation />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DonationsPage;
