import { Link } from 'react-router-dom';
import { ArrowRightSquareIcon } from 'lucide-react';
import MarkdownDisplay from '../../components/ui/markdown';
import { useEffect, useState } from 'react';

const PolicyPage = () => {
  const email = import.meta.env.VITE_EMAIL;
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/docs/privacy.md')
      .then((response) => response.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen p-8">
      <Link
        to="/"
        className="mb-4 flex items-center gap-2 border-b border-border pb-2 text-primary transition-all duration-500 hover:text-accent">
        <ArrowRightSquareIcon className="h-6 w-6" />
        <span className="text-lg font-semibold">الرجوع للصفحة الرئيسية</span>
      </Link>
      <div className="mx-auto max-w-3xl rounded-lg p-6 shadow-lg">
        <MarkdownDisplay
          title="سياسة الخصوصية"
          content={content.replace('${email}', email)}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default PolicyPage;
