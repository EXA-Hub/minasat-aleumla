import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { ChevronLeftIcon, Star, ShoppingBag } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Username from '../../../components/explore/widgets/Username';
import MarkdownDisplay from '../../../components/ui/markdown';
import { Skeleton } from '../../../components/ui/skeleton';
import { Button } from '../../../components/ui/button';
import CoinIcon from '../../../components/ui/CoinIcon';
import { Input } from '../../../components/ui/input';
import LoadingPage from '../../core/loading.jsx';
import api from '../../../utils/api';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';

const ProductPage = () => {
  const navigate = useNavigate();
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

  // Existing useEffect and logic remains unchanged
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
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:space-y-8 md:p-8">
      {openDialog && (
        <Dialog>
          <DialogContent className="p-4 sm:max-w-[600px] md:p-6">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl md:text-2xl">
                تأكيد بدء الصفقة
              </DialogTitle>
              <span className="block text-xs font-medium text-red-500 md:text-sm">
                (سيتم دفع المبلغ الإجمالي تلقائيا عندما تقبل الصفقة من البائع)
              </span>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4 md:gap-6">
              <div className="flex flex-col gap-4 rounded-lg bg-10primary p-4 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-border md:h-14 md:w-14">
                    <AvatarImage
                      src={seller.profile.profilePicture || '/avatar.jpg'}
                    />
                    <AvatarFallback>{seller.username[0]}</AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <h3 className="text-base font-semibold md:text-lg">
                      {product.name}
                    </h3>
                    <CoinIcon amount={product.price} className="text-primary" />
                  </div>
                </div>

                <ChevronLeftIcon className="mx-2 hidden h-6 w-6 text-muted-foreground md:block" />

                <div className="mt-4 flex items-center gap-4 md:mt-0">
                  <Avatar className="h-12 w-12 border-2 border-border md:h-14 md:w-14">
                    <AvatarImage
                      src={buyer.profile.profilePicture || '/avatar.jpg'}
                    />
                    <AvatarFallback>{buyer.username[0]}</AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <h3 className="text-base font-semibold md:text-lg">
                      {buyer.profile.username}
                    </h3>
                    <CoinIcon amount={buyer.balance} className="text-primary" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-lg font-semibold md:text-xl">
                  تفاصيل الصفقة:
                </p>
                <div className="space-y-4 rounded-xl border-2 bg-5muted p-4 shadow-sm md:space-y-6 md:p-6">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <p className="font-medium text-muted-foreground">
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
                      <span className="min-w-[2rem] text-center font-semibold">
                        {quantity}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 border-t pt-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-muted-foreground">
                        سعر المنتج:
                      </p>
                      <span className="text-base font-semibold md:text-lg">
                        {product.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-muted-foreground">
                        السعر الحالي:
                      </p>
                      <span className="text-base font-semibold md:text-lg">
                        {quantity * product.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-muted-foreground">
                          الضريبة:
                        </p>
                        <span className="font-semibold">{buyer.fee}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronLeftIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-base font-semibold md:text-lg">
                          {Math.ceil(
                            (quantity * product.price * buyer.fee) / 100
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t pt-4">
                      <p className="font-medium text-muted-foreground">
                        السعر شامل الضريبة:
                      </p>
                      <span className="text-lg font-bold text-primary md:text-xl">
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
              <div className="mt-6 flex flex-col justify-end gap-3 md:flex-row">
                <Button
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                  className="min-w-[100px]">
                  إلغاء
                </Button>

                <DialogTrigger
                  variant="default"
                  className="min-w-[120px] rounded-lg bg-primary text-white shadow-lg transition duration-200 ease-in hover:bg-60primary"
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

      <div className="flex flex-col items-stretch justify-center gap-4 md:gap-6">
        <div className="flex w-full flex-col justify-between gap-4 rounded-xl bg-muted p-4 sm:flex-row sm:items-center md:p-6">
          <div className="flex items-center rounded-full border-2 border-border bg-background px-3 py-1.5 transition-all duration-200 ease-in-out hover:bg-50accent">
            <Avatar className="h-10 w-10 border shadow-sm md:h-12 md:w-12">
              <AvatarImage src={seller.profile.profilePicture} />
              <AvatarFallback>{seller.username[0]}</AvatarFallback>
            </Avatar>
            <p className="mx-3 text-sm font-medium md:text-base">
              <Username username={seller.username} />
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground md:text-base">
                السعر:
              </p>
              <CoinIcon amount={product.price} className="scale-110" />
            </div>

            <Button
              onClick={() => navigate('/explore/transfers/market')}
              variant="outline"
              className="w-full min-w-[120px] font-medium sm:w-auto">
              <ShoppingBag className="ml-1 h-4 w-4" />
              الذهاب إلى السوق
            </Button>

            {seller._id && buyer && (
              <Button
                onClick={() => setOpenDialog(true)}
                variant="outline"
                className="w-full min-w-[120px] font-medium sm:w-auto">
                بدء صفقة
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-xl bg-muted p-4 md:space-y-6 md:p-6">
          <MarkdownDisplay
            title={product.name}
            content={product.description}
            className="prose prose-sm md:prose-base max-w-none"
          />

          <div className="flex flex-col flex-wrap gap-x-8 gap-y-2 border-t pt-4 text-xs text-muted-foreground sm:flex-row md:text-sm">
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

      <div className="space-y-4 rounded-xl bg-muted p-4 md:space-y-6 md:p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-xl font-bold md:text-2xl">
            التعليقات
            <span className="font-medium text-muted-foreground">
              ({comments.filter((c) => c.comment).length})
            </span>
            <span className="mt-1 block text-xs text-primary sm:mr-2 sm:mt-0 sm:inline md:text-sm">
              سنعمل على قسم التعليقات عما قريب
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 md:h-5 md:w-5 ${
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
            <span className="text-xs font-medium md:text-sm">
              ({comments.filter((c) => c.rating || c.rating === 0).length}{' '}
              تقييم)
            </span>
          </div>
        </div>

        {comments.length === 0 ? (
          <div className="space-y-4 md:space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-8 w-8 rounded-full bg-40accent md:h-10 md:w-10" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-24 bg-40accent md:h-4 md:w-32" />
                    <Skeleton className="h-3 w-12 bg-40accent md:h-4 md:w-16" />
                  </div>
                  <Skeleton className="h-3 w-full bg-40accent md:h-4" />
                  <Skeleton className="h-3 w-3/4 bg-40accent md:h-4" />
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
                <Avatar className="h-8 w-8 border-2 border-border shadow-sm md:h-10 md:w-10">
                  <AvatarImage
                    src={comment.user.profile.profilePicture || '/avatar.jpg'}
                  />
                  <AvatarFallback>{comment.user.username[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                      <Username username={comment.user.username} />
                      <span className="text-xs text-muted-foreground md:text-sm">
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
                            className={`h-3 w-3 md:h-4 md:w-4 ${
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
                      'text-xs leading-relaxed md:text-sm ' +
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

export default ProductPage;
