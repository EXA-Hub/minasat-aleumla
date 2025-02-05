// app/src/pages/autoRouting/docs.jsx
import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowRightSquareIcon,
  AlertCircleIcon,
  BookOpenIcon,
  SearchIcon,
} from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/alert';
import MarkdownDisplay from '../../components/ui/markdown';
import { Skeleton } from '../../components/ui/skeleton';

// Error content in Markdown format
const errorContent = `
# 🚨 حدث خطأ غير متوقع

تعذر تحميل المستند المطلوب، يرجى التحقق من:

- صحة عنوان المستند
- اتصال الإنترنت
- إعادة المحاولة لاحقًا

\`\`\`bash
# الخطأ المفصل:
404 - Document Not Found
\`\`\`

[العودة لفهرس المستندات >](/docs) | [الصفحة الرئيسية >](/)
`;

const DocsPage = () => {
  const [searchParams] = useSearchParams();
  const route = searchParams.get('q');
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [docIndex, setDocIndex] = useState([]);
  const [isIndexLoading, setIsIndexLoading] = useState(true);
  const [docs, setDocs] = useState({
    title: 'جار التحميل...',
    content: '',
    loading: true,
    error: false,
  });

  useEffect(() => {
    const fetchIndex = async () => {
      try {
        const response = await fetch(
          `${window.location.origin}/docs/docs-index.json`
        );
        const data = await response.json();
        setDocIndex(data);
      } catch (error) {
        console.error('Failed to load document index:', error);
        setDocIndex([]);
        setIsIndexLoading(false);
        setDocs({
          title: 'خطاء في التحميل',
          content: errorContent,
          loading: false,
          error: true,
        });
      } finally {
        setIsIndexLoading(false);
      }
    };

    if (!route) fetchIndex();
  }, [route]);

  useEffect(() => {
    const FetchDocs = async () => {
      try {
        setDocs((prev) => ({ ...prev, loading: true, error: false }));

        const response = await fetch(
          `${window.location.origin}/docs/${route}.md`
        );

        if (!response.ok) throw new Error('Document not found');

        const text = await response.text();
        const title = text.match(/#\s+(.*)/)?.[1] || 'مستند بدون عنوان';

        setDocs({
          title,
          content: text,
          loading: false,
          error: false,
        });
      } catch (error) {
        console.error('Error fetching document:', error);
        setDocs({
          title: 'خطأ في التحميل',
          content: errorContent,
          loading: false,
          error: true,
        });
      }
    };

    if (route) FetchDocs();
    else navigate('/docs');
  }, [navigate, route]);

  const filteredDocs = docIndex.filter((doc) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(searchLower) ||
      doc.content.toLowerCase().includes(searchLower)
    );
  });

  const renderIndex = () => (
    <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
      <div className="mb-8">
        <h1 className="mb-6 flex items-center gap-3 text-3xl font-bold text-primary">
          <BookOpenIcon className="h-8 w-8" />
          فهرس المستندات
        </h1>

        <div className="relative">
          <input
            type="text"
            placeholder="ابحث في المستندات..."
            className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-20primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchIcon className="absolute right-4 top-4 h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {isIndexLoading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 bg-muted-foreground" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <Link
                key={doc.slug}
                to={`/docs?q=${doc.slug}`}
                className="flex items-center justify-between rounded-lg border border-border p-6 transition-all hover:border-primary hover:shadow-md">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {doc.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-muted-foreground">
                    {doc.excerpt}
                  </p>
                </div>
                <ArrowRightSquareIcon className="ml-4 h-6 w-6 text-muted-foreground" />
              </Link>
            ))
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              لا توجد نتائج بحث.
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to={route ? '/docs' : '/'}
          className="group mb-8 flex items-center gap-2 text-primary transition-colors duration-300 hover:text-accent">
          <ArrowRightSquareIcon className="h-6 w-6 transform transition-transform group-hover:translate-x-1" />
          <span className="text-lg font-semibold">العودة للصفحة الرئيسية</span>
        </Link>

        {route ? (
          docs.loading ? (
            <div className="grid gap-4 rounded-xl bg-card p-8">
              {[...Array(50)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-6 bg-muted-foreground"
                  style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
              {docs.error && (
                <Alert
                  dir="rtl"
                  className="mb-6 flex items-center gap-3 rounded-lg border border-20primary bg-10primary p-4 text-primary">
                  <AlertCircleIcon className="h-5 w-5" />
                  <AlertTitle dir="rtl">تحذير:</AlertTitle>
                  <AlertDescription dir="rtl">
                    هناك مشكلة في تحميل المستند
                  </AlertDescription>
                </Alert>
              )}

              <MarkdownDisplay
                title={docs.title}
                content={docs.content}
                loading={docs.loading}
                trusted
              />

              {!docs.error && (
                <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                  <span className="text-sm text-muted-foreground">
                    آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
                  </span>
                </div>
              )}
            </div>
          )
        ) : (
          renderIndex()
        )}
      </div>
    </div>
  );
};

export default DocsPage;
