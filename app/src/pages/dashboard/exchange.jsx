import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { Bitcoin, CopyIcon, InfoIcon } from 'lucide-react';
import BalanceCard from '../../components/dashboard/widgets/BalanceCard';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Textarea } from '../../components/ui/textarea';
import CoinIcon from '../../components/ui/CoinIcon';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import LoadingPage from '../core/loading';
import api from '../../utils/api';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '../../components/ui/card';

const Exchange = () => {
  const [open, setOpen] = useState(false);
  const [exchangeData, setExchangeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [formData, setFormData] = useState({
    action: '',
    currency: '',
    amount: 0,
    walletAddress: '',
    feePriority: 'normal',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [balanceData, exchange] = await Promise.all([
          api.wallet.getBalance(),
          api.wallet.getRates(),
        ]);
        setBalance(balanceData.balance);
        setExchangeData(exchange);
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

  const information = formData.currency
    ? {
        isBTC: formData.currency.toLowerCase() === 'bitcoin',
        currencyToCoin:
          exchangeData.data[formData.currency].usd /
          exchangeData.exchange.coinToUsdRate,
        min: {
          coins:
            exchangeData.exchange.minUsd / exchangeData.exchange.coinToUsdRate,
          currency:
            exchangeData.exchange.minUsd /
            exchangeData.data[formData.currency].usd,
        },
        max: {
          coins:
            exchangeData.exchange.maxUsd / exchangeData.exchange.coinToUsdRate,
          currency:
            exchangeData.exchange.maxUsd /
            exchangeData.data[formData.currency].usd,
        },
      }
    : {};

  const textToCopy =
    exchangeData?.currencies[formData.currency] ||
    'سيتم توفير عنوان المحفظة عما قريب';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success('تم النسخ');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('فشل النسخ');
    }
  };

  const handleSubmit = () => {
    setOpen(true);
    setFormData({ action: false });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold">
        الحوالة{' '}
        <span className="text-xs text-muted-foreground">
          (لتبديل العملات الرقمية)
        </span>
      </h2>

      <BalanceCard balance={{ amount: balance }} />

      {open && (
        <Dialog>
          <DialogContent className="text-center">
            <DialogHeader>
              <DialogTitle>تنبيه</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-lg">سيتم توفير الخدمة عما قريب</p>
            </div>
            <DialogTrigger onClick={() => setOpen(false)}>إغلاق</DialogTrigger>
          </DialogContent>
        </Dialog>
      )}

      <Tabs
        defaultValue="sell_coins"
        value={formData.action}
        onValueChange={(value) =>
          setFormData((prev) => ({ ...prev, action: value }))
        }>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sell_coins">البيع</TabsTrigger>
          <TabsTrigger value="buy_coins">الشراء</TabsTrigger>
        </TabsList>
      </Tabs>

      {formData.action && (
        <Tabs
          value={formData.currency}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, currency: value }))
          }>
          <TabsList className="grid w-full grid-cols-2">
            {Object.keys(exchangeData.data).map((currency) => (
              <TabsTrigger value={currency} key={currency}>
                {currency}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {formData.currency && (
        <Card>
          <CardHeader className="m-3 overflow-x-auto whitespace-nowrap rounded-md bg-background px-3 py-2 sm:px-6 sm:py-4">
            <CardTitle className="text-base sm:text-lg">
              معلومات العملية
            </CardTitle>
            <div className="space-y-2 text-xs sm:text-sm">
              {/* Price Row */}
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="whitespace-nowrap">
                  السعر: 1 {formData.currency} =
                </span>
                <CoinIcon
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  amount={Math.round(information.currencyToCoin)}
                />
              </div>

              {/* Min/Max Rows */}
              {['min', 'max'].map((type) => (
                <div key={type} className="flex items-center gap-1 sm:gap-2">
                  <span className="whitespace-nowrap">
                    {type === 'min' ? 'الحد الأدنى' : 'الحد الأقصى'}:{' '}
                    {exchangeData.exchange[`${type}Usd`]}$ =
                  </span>
                  <div className="flex items-center gap-1">
                    <CoinIcon
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      amount={Math[type === 'min' ? 'ceil' : 'floor'](
                        information[type].coins
                      )}
                    />
                    <span>=</span>
                    {information.isBTC ? (
                      <Bitcoin className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      <span>$</span>
                    )}
                    <span className="break-all">
                      {information[type].currency.toFixed(
                        information.isBTC ? 8 : 2
                      )}
                    </span>
                  </div>
                </div>
              ))}

              {/* Amount Row */}
              <div className="flex items-center gap-1 sm:gap-2">
                <span>المبلغ:</span>
                <div className="flex items-center gap-1">
                  <CoinIcon
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    amount={Number.parseInt(formData.amount)}
                  />
                  <span>=</span>
                  {information.isBTC ? (
                    <Bitcoin className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <span>$</span>
                  )}
                  <span className="break-all">
                    {(formData.amount / information.currencyToCoin).toFixed(
                      information.isBTC ? 8 : 2
                    )}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                min={Math.ceil(information.min.coins)}
                max={Math.floor(information.max.coins)}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet" className="flex items-center gap-2">
                معلومات التحويل
                <span className="text-xs text-muted-foreground">
                  (الرجاء التأكد من المعلومات قبل إدخالها)
                </span>
              </Label>
              <Textarea
                id="wallet"
                value={formData.walletAddress}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    walletAddress: e.target.value,
                  }))
                }
              />
            </div>

            {formData.action === 'sell_coins' ? (
              <div className="space-y-2">
                <Label htmlFor="fee">الرسوم</Label>
                <Select
                  value={formData.feePriority}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, feePriority: value }))
                  }>
                  <SelectTrigger id="fee">
                    <SelectValue placeholder="اختر نوع الرسوم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">عادي</SelectItem>
                    <SelectItem value="fast">سريع (رسوم تحويل أعلى)</SelectItem>
                    <SelectItem value="economic">
                      إقتصادي (رسوم منخفضة وتأخير عند الوصول)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>قم بالتحويل على هذه المحفظة</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    readOnly
                    value={textToCopy}
                    className="rounded-none font-mono"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={copyToClipboard}
                    className="shrink-0 rounded-none border border-border">
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex-col gap-5">
            <Alert
              variant="warning"
              className="flex items-center rounded-lg bg-yellow-100 p-4 text-yellow-800 shadow-md">
              <InfoIcon className="mr-3 h-6 w-6" />
              <AlertDescription className="text-sm">
                كامل العمليات تكون شاملة رسوم التحويل من طرف المستخدم
              </AlertDescription>
            </Alert>
            <Button className="w-full" variant="outline" onClick={handleSubmit}>
              إرسال الطلب
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default Exchange;
