// app/src/pages/explore/support/codes.jsx
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
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
    fetchCodes();
  }, [page]);

  const copyToClipboard = async (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        toast.success('تم النسخ');
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (successful) toast.success('تم النسخ');
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
    <div className="p-6 max-w-4xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">الرموز</h1>
        <Button
          className="p-2 hover:bg-muted rounded-full transition-colors"
          onClick={() =>
            copyToClipboard(codes.map((code) => code.code).join('\n'))
          }>
          <Copy className="w-5 h-5 ml-1" />
          <span>نسخ كل الرموز</span>
        </Button>
      </div>

      {loading && (
        <div className="text-center p-4 animate-pulse">جاري التحميل...</div>
      )}

      {error && <div className="text-red-500 text-center p-4">{error}</div>}

      <div className="grid gap-4">
        {codes.map((code, index) => (
          <Card
            key={code.code}
            className="animate-slideUp hover:shadow-lg transition-all"
            style={{ animationDelay: `${index * 50}ms` }}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="font-bold text-lg">{code.code}</div>
                  <div className="text-sm text-muted-foreground">
                    الخطة: {planTranslations[code.plan]}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    تاريخ الإنشاء: {getLocalDate(code.createdAt)}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(code.code)}
                  className="p-2 hover:bg-muted rounded-full transition-colors">
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasMore && !loading && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="w-full mt-4 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
          تحميل المزيد
        </button>
      )}

      {!loading && codes.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          لا توجد أكواد متاحة
        </div>
      )}
    </div>
  );
};

export default CodesPage;
