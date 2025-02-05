// app/src/components/shared/commentDialog.jsx
import PropTypes from 'prop-types';
import Confetti from 'react-confetti';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import api from '../../utils/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

const CommentDialog = ({
  productId,
  onSuccess,
  otherId,
  action = 'create',
}) => {
  const [comment, setComment] = useState(undefined);
  const [rating, setRating] = useState(0);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thx, setThx] = useState(false);

  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const { width, height } = size;

  useEffect(() => {
    function handleResize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  const handleSubmit = async () => {
    if (!comment?.trim() && rating === 0) {
      setError('يجب إضافة تعليق أو تقييم');
      return;
    }

    if (comment?.trim().length > 100) {
      setError('التعليق يجب ألا يتجاوز 100 حرف');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      switch (action) {
        case 'update':
          await api.commentsAndRatings.updateComment(productId, otherId, {
            comment: comment?.trim(),
            rating,
          });
          break;
        default:
          await api.commentsAndRatings.createComment(productId, {
            comment: comment?.trim(),
            tradeId: otherId,
            rating,
          });
          break;
      }

      onSuccess();
      setComment('');
      setRating(0);
      setError('');
      toast.success('تم ارسال التعليق بنجاح');
      setThx(true);
    } catch (err) {
      console.error(err);
      setError('فشل في إرسال التعليق، يرجى المحاولة لاحقًا');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setComment(undefined);
    setRating(0);
    setError('');
  };

  return (
    <Dialog>
      {thx && <Confetti width={width} height={height} />}
      <DialogContent className="max-w-md">
        {action === 'update' && (
          <X
            className="bg-10primary text-muted-foreground hover:bg-10foreground hover:text-primary absolute top-2 right-2 cursor-pointer transition-colors duration-300"
            onClick={() => onSuccess()}
          />
        )}
        {thx ? (
          <>
            <DialogHeader className="flex flex-row! items-center justify-between gap-4">
              <DialogTitle className="text-2xl font-bold">
                شكراً لك!
              </DialogTitle>
              <DialogTrigger
                asChild
                onClick={() => onSuccess()}
                className="bg-10primary text-muted-foreground hover:bg-10foreground hover:text-primary cursor-pointer transition-colors duration-300">
                <X className="h-4 w-4" />
              </DialogTrigger>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="rounded-full bg-green-100 p-3">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-center text-lg">تم ارسال التعليق بنجاح.</p>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>إرسال تعليق أو تقييم للمنتج</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="comment">التعليق (اختياري)</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    setError('');
                  }}
                  maxLength={100}
                  placeholder="اكتب تعليقك هنا..."
                  className="h-24 resize-none"
                  disabled={isSubmitting}
                  aria-describedby={error ? 'comment-error' : undefined}
                />
                <div className="text-muted-foreground flex justify-between text-xs">
                  <span>{comment?.length}/100</span>
                </div>
              </div>

              <div className="flex flex-col gap-y-2">
                <Label>التقييم (اختياري)</Label>
                <div
                  className="flex gap-1"
                  role="radiogroup"
                  aria-label="Product rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setRating(star);
                        setError('');
                      }}
                      disabled={isSubmitting}
                      className="focus-visible:ring-ring transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
                      role="radio"
                      aria-checked={rating === star}
                      aria-label={`Rate ${star} out of 5 stars`}>
                      <Star
                        className={`h-6 w-6 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground fill-none'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div
                  id="comment-error"
                  role="alert"
                  className="text-center text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                }}
                disabled={isSubmitting}>
                إعادة تعيين
              </Button>

              <DialogTrigger onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  'إرسال'
                )}
              </DialogTrigger>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

CommentDialog.propTypes = {
  productId: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  otherId: PropTypes.string,
  action: PropTypes.oneOf(['create', 'update']),
};

export { CommentDialog as default };
