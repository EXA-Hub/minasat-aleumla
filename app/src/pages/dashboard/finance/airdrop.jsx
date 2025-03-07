import { X } from 'lucide-react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import CoinIcon from '../../../components/ui/CoinIcon';
import { Input } from '../../../components/ui/input';
import api from '../../../utils/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '../../../components/ui/card';

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

    if (!formData.url.trim()) delete payload.url;

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
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle>إنشاء هدية جديدة</DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="hover:bg-muted-foreground rounded-full p-2">
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-y-2">
            <label className="text-muted-foreground text-sm">
              عنوان الهدية
            </label>
            <Input
              type="text"
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
          <div className="flex flex-col gap-y-2">
            <label className="text-muted-foreground text-sm">عدد العملات</label>
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
          <div className="flex flex-col gap-y-2">
            <label className="text-muted-foreground text-sm">
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
          <div className="flex flex-col gap-y-2">
            <label className="text-muted-foreground text-sm">
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
            className="bg-primary text-primary-foreground hover:bg-primary h-10 w-full rounded-md disabled:opacity-50">
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
      setGifts((gifts) =>
        gifts.map((g) => (g.id === gift.id ? { ...g, claimed: true } : g))
      );
    } catch (error) {
      toast.error(error.data?.error || 'حدث خطأ أثناء تقديم الهدية');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">الهدايا المتاحة</h2>
        <button
          onClick={() => setDialogOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary rounded-md px-4 py-2">
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
          <Card
            key={gift.id}
            className={
              'transition-shadow hover:shadow-lg' +
              (gift.claimed ? ' bg-muted' : '')
            }>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {gift.title}
                <CoinIcon amount={gift.coins} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gift.url && (
                <a className="text-primary mb-4 block hover:underline">
                  ثمة تفاصيل إضافية
                </a>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                المتبقي: {gift.max - gift.claimedCount} / {gift.max}
              </span>
              <button
                onClick={() => handleGiftClaim(gift)}
                disabled={claimingId === gift.id || gift.claimed}
                className="bg-primary text-primary-foreground hover:bg-primary rounded-md px-4 py-2 disabled:opacity-50">
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
