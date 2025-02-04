// app/src/pages/explore/support/codes.jsx
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '../../../utils/api';

const planTranslations = {
  free: 'مجاني',
  basic: 'أساسي',
  professional: 'محترف',
  elite: 'نخبة',
};

const CodesPage = () => {
  const { user } = useOutletContext();
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const response = await api.plans.getCodes(page);
        setCodes((prev) =>
          page === 1 ? response.codes : [...prev, ...response.codes]
        );
        setHasMore(response.hasMore);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    if (user) fetchCodes();
  }, [page, user]);

  if (!user)
    return (
      <div>
        من فضلك{' '}
        <Link
          to="/login"
          className="text-primary transition-all duration-300 hover:underline">
          سجل دخول
        </Link>{' '}
        للوصول إلى هذه الصفحة.
      </div>
    );

  const copyToClipboard = async (code) => {
    try {
      navigator.clipboard.writeText(code);
      toast.success('تم النسخ');
    } catch (error) {
      console.error(error);
      toast.error('فشل النسخ');
    }
  };

  const getLocalDate = (date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mx-auto max-w-4xl p-6" dir="rtl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">الرموز</h1>
        <Button
          className="rounded-full p-2 transition-colors hover:bg-muted"
          onClick={() =>
            copyToClipboard(codes.map((code) => code.code).join('\n'))
          }>
          <Copy className="ml-1 h-5 w-5" />
          <span>نسخ كل الرموز</span>
        </Button>
      </div>

      {loading && (
        <div className="animate-pulse p-4 text-center">جاري التحميل...</div>
      )}

      {error && <div className="p-4 text-center text-red-500">{error}</div>}

      <div className="grid gap-4">
        {codes.map((code, index) => (
          <Card
            key={code.code}
            className="animate-slideUp transition-all hover:shadow-lg"
            style={{ animationDelay: `${index * 50}ms` }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-lg font-bold">{code.code}</div>
                  <div className="text-sm text-muted-foreground">
                    الخطة: {planTranslations[code.plan]}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    تاريخ الإنشاء: {getLocalDate(code.createdAt)}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(code.code)}
                  className="rounded-full p-2 transition-colors hover:bg-muted">
                  <Copy className="h-5 w-5" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasMore && !loading && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="hover:bg-muted/80 mt-4 w-full rounded-lg bg-muted p-4 transition-colors">
          تحميل المزيد
        </button>
      )}

      {!loading && codes.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          لا توجد أكواد متاحة
        </div>
      )}
    </div>
  );
};

export default CodesPage;
