// app/src/pages/explore/overview.jsx
import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Username from '../../components/explore/widgets/Username';
import MarkdownDisplay from '../../components/ui/markdown';

const OverviewPage = () => {
  const { user } = useOutletContext();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/docs/markdown-guide.md')
      .then((response) => response.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading markdown:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="bg-20muted flex flex-col gap-y-2 rounded-md p-4 shadow-md">
        {user && (
          <div className="text-muted-foreground text-lg font-medium">
            حسابك: <Username username={user.username} />
          </div>
        )}
        <div className="text-muted-foreground text-lg font-medium">
          حساب المؤسس: <Username username="zampx" />
        </div>
      </div>
      <MarkdownDisplay
        title="نشرة إخبارية"
        content={content}
        loading={loading}
        className="rounded-lg bg-gray-50/10 p-6 shadow-md"
      />
    </div>
  );
};

export default OverviewPage;
