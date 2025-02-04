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
    try {
      navigator.clipboard.writeText(textToCopy);
      toast.success('تم النسخ');
    } catch (error) {
      console.error(error);
      toast.error('فشل النسخ');
    }
  };
  const copyDonationLink = async () => {
    const username = (await api.auth.getMe()).username;
    const link = `${window.location.origin}/tip/${username}`;
    handleCopy(link);
  };

  const PreviewDonation = () => (
    <div className={`rounded-lg bg-[var(--background)] p-6`}>
      <h2 className="mb-6 text-center text-2xl font-bold">
        {donationPage.title}
      </h2>

      <div className="mb-6 grid grid-cols-3 gap-3">
        {donationPage.customAmounts.map((amount) => (
          <button
            key={amount}
            className="rounded border p-3 hover:bg-primary dark:hover:bg-gray-700">
            <div className="flex items-center justify-center">
              <CoinIcon amount={amount} />
            </div>
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="رسالة دعم (اختياري)"
        className="mb-4 w-full rounded border bg-[var(--background)] p-3"
      />

      <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-3 text-white">
        <Heart className="h-5 w-5" />
        ادعم الآن
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">صفحة التبرعات</h2>
        <div className="flex gap-2">
          <button
            onClick={copyDonationLink}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-primary">
            <Link2 className="h-5 w-5" />
            نسخ الرابط
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">الإعدادات الأساسية</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm">عنوان الصفحة</label>
                <input
                  type="text"
                  value={donationPage.title}
                  onChange={(e) =>
                    setDonationPage({ ...donationPage, title: e.target.value })
                  }
                  className="w-full rounded border bg-[var(--background)] p-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm">الحد الأدنى للتبرع</label>
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
                  className="w-full rounded border bg-[var(--background)] p-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm">المبالغ المقترحة</label>
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
                  className="w-full rounded border bg-[var(--background)] p-2"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-md bg-primary p-2 text-white hover:bg-primary disabled:opacity-50">
                {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </button>
            </div>
          </Card>
        </div>

        <div className="sticky top-6">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">معاينة</h3>
            <PreviewDonation />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DonationsPage;
