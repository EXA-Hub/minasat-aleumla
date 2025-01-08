import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import CoinIcon from '../../../components/ui/CoinIcon';
import api from '../../../utils/api';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';

const CreateGiftDialog = ({ onSuccess, open, onOpenChange }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    coins: '',
    max: '',
    url: '',
  });
  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      coins: parseInt(formData.coins),
      max: parseInt(formData.max),
    };

    if (!formData.url.trim()) {
      delete payload.url;
    }

    try {
      const data = await api.airdrop.createGift(payload);
      toast.success(data.message);
      if (data.balance !== undefined) {
        toast.success(`رصيدك الحالي: ${data.balance} عملة`);
      }
      onSuccess();
      onOpenChange(false);
      setFormData({ title: '', coins: '', max: '', url: '' });
    } catch (error) {
      toast.error(error.data?.error || 'حدث خطأ أثناء إنشاء الهدية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle>إنشاء هدية جديدة</DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full p-2 hover:bg-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              عنوان الهدية
            </label>
            <Input
              required
              minLength={3}
              maxLength={100}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="عنوان الهدية"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">عدد العملات</label>
            <Input
              required
              type="number"
              min={1}
              max={1000000}
              value={formData.coins}
              onChange={(e) =>
                setFormData({ ...formData, coins: e.target.value })
              }
              placeholder="عدد العملات"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              الحد الأقصى للمستخدمين
            </label>
            <Input
              required
              type="number"
              min={1}
              max={10000}
              value={formData.max}
              onChange={(e) =>
                setFormData({ ...formData, max: e.target.value })
              }
              placeholder="الحد الأقصى للمستخدمين"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              الرابط (اختياري)
            </label>
            <Input
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder="https://example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-primary-foreground hover:bg-blue-900 disabled:opacity-50 h-10 rounded-md"
          >
            {loading ? 'جاري الإنشاء...' : 'إنشاء الهدية'}
          </button>
          <span className="text-xs text-red-700">سيتم فرض الرسوم</span>
        </form>
      </DialogContent>
    </Dialog>
  );
};

CreateGiftDialog.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
};

const AirdropPage = () => {
  const [gifts, setGifts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [claimingId, setClaimingId] = useState(null);

  const fetchGifts = async () => {
    try {
      const { data } = await api.airdrop.getGifts();
      setGifts(data.gifts || []);
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء جلب الهدايا');
    }
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  const handleGiftClaim = async (gift) => {
    if (claimingId || gift.claimed) return;
    setClaimingId(gift.id);
    toast('جاري تقديم الهدية...', { icon: '🎁' });

    // Warn the user if the gift has a URL
    if (gift.url) {
      const confirmed = window.confirm(
        'سيتم توجيهك إلى رابط خارجي. هل تريد المتابعة؟\n' + gift.url
      );
      if (!confirmed) {
        setClaimingId(null);
        return;
      }
    }

    try {
      if (gift.url) window.open(gift.url, '_blank');
      const data = await api.airdrop.claimGift(gift.id);
      toast.success(data.message);
      fetchGifts();
    } catch (error) {
      toast.error(error.data?.error || 'حدث خطأ أثناء تقديم الهدية');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">الهدايا المتاحة</h2>
        <button
          onClick={() => setDialogOpen(true)}
          className="bg-blue-500 text-primary-foreground hover:bg-blue-900 px-4 py-2 rounded-md"
        >
          إنشاء هدية جديدة
        </button>
      </div>

      <CreateGiftDialog
        onSuccess={fetchGifts}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {gifts.map((gift) => (
          <Card key={gift.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {gift.title}
                <CoinIcon amount={gift.coins} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gift.url && (
                <a
                  href={gift.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline block mb-4"
                >
                  تفاصيل إضافية
                </a>
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                المتبقي: {gift.max - gift.claimedCount} / {gift.max}
              </span>
              <button
                onClick={() => handleGiftClaim(gift)}
                disabled={claimingId === gift.id || gift.claimed}
                className="bg-blue-500 text-primary-foreground hover:bg-blue-900 disabled:opacity-50 px-4 py-2 rounded-md"
              >
                {claimingId === gift.id
                  ? 'جاري تقديم الهدية...'
                  : gift.claimed
                    ? 'تم الحصول على الهدية'
                    : 'احصل على الهدية'}
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AirdropPage;
