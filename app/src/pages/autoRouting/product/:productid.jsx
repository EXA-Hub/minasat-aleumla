// app/src/pages/autoRouting/trade/:productid.jsx
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeftIcon, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Username from '../../../components/explore/widgets/Username';
import MarkdownDisplay from '../../../components/ui/markdown';
import { Skeleton } from '../../../components/ui/skeleton';
import { Button } from '../../../components/ui/button';
import CoinIcon from '../../../components/ui/CoinIcon';
import { Input } from '../../../components/ui/input';
import api from '../../../utils/api';
import LoadingPage from '../loading';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';

const TradePage = () => {
  const { productid } = useParams();
  const [product, setProduct] = useState(null);
  const [comments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [seller, setSeller] = useState({
    username: 'Unknown',
    profile: { profilePicture: '/avatar.jpg' },
  });
  const [buyer, setBuyer] = useState(null);

  useEffect(() => {
    try {
      if (productid && /^[0-9a-fA-F]{24}$/.test(productid))
        api.market.getProduct(productid).then((data) => {
          setProduct(data);
          api.market.getUsers([data.userId]).then((users) => {
            setSeller(users[0]);
            api.auth.getMe().then((buyerData) => {
              setBuyer(buyerData);
            });
          });
        });
    } catch (error) {
      console.log(error);
      toast.error('خطاء في تحميل المنتج');
    }
  }, [productid]);

  if (!product) return <LoadingPage />;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      {openDialog && (
        <Dialog>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl">تأكيد بدء الصفقة</DialogTitle>
              <span className="text-red-500 text-sm font-medium block">
                (سيتم دفع المبلغ الإجمالي تلقائيا عندما تقبل الصفقة من البائع)
              </span>
            </DialogHeader>

            <div className="flex flex-col gap-6 py-4">
              <div className="flex items-center gap-6 p-4 bg-10primary rounded-lg">
                <Avatar className="h-14 w-14 border-2 border-border">
                  <AvatarImage
                    src={seller.profile.profilePicture || '/avatar.jpg'}
                  />
                  <AvatarFallback>{seller.username[0]}</AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <CoinIcon amount={product.price} className="text-primary" />
                </div>

                <ChevronLeftIcon className="h-6 w-6 text-muted-foreground mx-2" />

                <Avatar className="h-14 w-14 border-2 border-border">
                  <AvatarImage
                    src={buyer.profile.profilePicture || '/avatar.jpg'}
                  />
                  <AvatarFallback>{buyer.username[0]}</AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">
                    {buyer.profile.username}
                  </h3>
                  <CoinIcon amount={buyer.balance} className="text-primary" />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xl font-semibold">تفاصيل الصفقة:</p>
                <div className="rounded-xl border-2 p-6 space-y-6 bg-5muted shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-muted-foreground font-medium">
                      الكمية المطلوبة:
                    </p>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="الكمية المطلوبة"
                        className="w-24 text-center"
                      />
                      <span className="font-semibold min-w-[2rem] text-center">
                        {quantity}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 pt-4 border-t">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-muted-foreground font-medium">
                        سعر المنتج:
                      </p>
                      <span className="font-semibold text-lg">
                        {product.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-muted-foreground font-medium">
                        السعر الحالي:
                      </p>
                      <span className="font-semibold text-lg">
                        {quantity * product.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-muted-foreground font-medium">
                          الضريبة:
                        </p>
                        <span className="font-semibold">{buyer.fee}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronLeftIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold text-lg">
                          {Math.ceil(
                            (quantity * product.price * buyer.fee) / 100
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-4 border-t">
                      <p className="text-muted-foreground font-medium">
                        السعر شامل الضريبة:
                      </p>
                      <span className="font-bold text-xl text-primary">
                        {quantity * product.price +
                          Math.ceil(
                            (quantity * product.price * buyer.fee) / 100
                          )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {dialogLoading ? (
              <div className="flex justify-end gap-2">
                <Button variant="outline" disabled className="min-w-[120px]">
                  جاري التحميل ...
                </Button>
              </div>
            ) : (
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                  className="min-w-[100px]">
                  إلغاء
                </Button>

                <DialogTrigger
                  variant="default"
                  className="min-w-[120px]"
                  disabled={
                    quantity * product.price +
                      Math.ceil((quantity * product.price * buyer.fee) / 100) >
                    buyer.balance
                  }
                  onClick={() => {
                    setDialogLoading(true);
                    api.trade
                      .create({
                        productId: product._id,
                        quantity,
                      })
                      .then(() => {
                        toast.success('تم إرسال الصفقة إلى التاجر');
                        setOpenDialog(false);
                      })
                      .catch((error) => {
                        console.error(error);
                        toast.error(error.data?.error || 'فشل في بدء الصفقة');
                      })
                      .finally(() => {
                        setDialogLoading(false);
                      });
                  }}>
                  تأكيد الصفقة
                </DialogTrigger>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      <div className="flex flex-col items-stretch justify-center gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full bg-muted rounded-xl p-6 gap-4">
          <div className="flex items-center bg-background border-2 border-border rounded-full px-3 py-1.5 hover:bg-50accent transition-all duration-200 ease-in-out">
            <Avatar className="h-12 w-12 border shadow-sm">
              <AvatarImage src={seller.profile.profilePicture} />
              <AvatarFallback>{seller.username[0]}</AvatarFallback>
            </Avatar>
            <p className="mx-3 font-medium">
              <Username username={seller.username} />
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground font-medium">السعر:</p>
              <CoinIcon amount={product.price} className="scale-110" />
            </div>

            {seller._id && buyer && (
              <Button
                onClick={() => setOpenDialog(true)}
                variant="outline"
                className="min-w-[120px] font-medium">
                بدء صفقة
              </Button>
            )}
          </div>
        </div>

        <div className="bg-muted rounded-xl p-6 space-y-6">
          <MarkdownDisplay
            title={product.name}
            content={product.description}
            className="prose prose-sm md:prose-base max-w-none"
          />

          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground border-t pt-4">
            <p>
              تاريخ الإنشاء:{' '}
              <span className="font-medium">
                {format(new Date(product.createdAt), 'd MMMM yyyy', {
                  locale: ar,
                })}
              </span>
            </p>
            <p>
              تاريخ التحديث:{' '}
              <span className="font-medium">
                {format(new Date(product.updatedAt), 'd MMMM yyyy', {
                  locale: ar,
                })}
              </span>
            </p>
            <p>
              الصفقات المفتوحة:{' '}
              <span className="font-medium">{product.openTrades}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 bg-muted rounded-xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            التعليقات
            <span className="text-muted-foreground font-medium">
              ({comments.filter((c) => c.comment).length})
            </span>
            <span className="text-sm text-primary mr-2">
              سنعمل على قسم التعليقات عما قريب
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i <
                    Math.round(
                      comments
                        .filter((c) => c.rating || c.rating === 0)
                        .reduce((sum, c) => sum + c.rating, 0) /
                        comments.filter((c) => c.rating || c.rating === 0)
                          .length || 0
                    )
                      ? 'fill-primary text-primary'
                      : 'text-25mutedforeground'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">
              ({comments.filter((c) => c.rating || c.rating === 0).length}{' '}
              تقييم)
            </span>
          </div>
        </div>

        {comments.length === 0 ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full bg-40accent" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-32 bg-40accent" />
                    <Skeleton className="h-4 w-16 bg-40accent" />
                  </div>
                  <Skeleton className="h-4 w-full bg-40accent" />
                  <Skeleton className="h-4 w-3/4 bg-40accent" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 divide-y divide-border">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="group flex gap-4 pt-4 first:pt-0">
                <Avatar className="h-10 w-10 border-2 border-border shadow-sm">
                  <AvatarImage
                    src={comment.user.profile.profilePicture || '/avatar.jpg'}
                  />
                  <AvatarFallback>{comment.user.username[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Username username={comment.user.username} />
                      <span className="text-muted-foreground text-sm">
                        {format(new Date(comment.createdAt), 'd MMMM yyyy', {
                          locale: ar,
                        })}
                      </span>
                    </div>
                    {(comment.rating || comment.rating === 0) && (
                      <div className="flex items-center gap-0.5 sm:mr-auto">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(comment.rating || 0)
                                ? 'fill-primary text-primary'
                                : 'text-25mutedforeground'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <p
                    className={
                      'text-sm leading-relaxed ' +
                      (comment.comment ? '' : 'text-muted-foreground')
                    }>
                    {comment.comment || '[لا يوجد تعليق]'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradePage;
