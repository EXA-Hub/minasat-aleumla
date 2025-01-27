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
    fetch('/docs/markdown-guide.txt')
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
      <div className="p-4 bg-20muted rounded-md shadow-md space-y-2">
        {user && (
          <div className="text-lg font-medium text-muted-foreground">
            حسابك: <Username username={user.username} />
          </div>
        )}
        <div className="text-lg font-medium text-muted-foreground">
          حساب المؤسس: <Username username="zampx" />
        </div>
      </div>
      <MarkdownDisplay
        title="نشرة إخبارية"
        content={content}
        loading={loading}
        className="bg-gray-50/10 p-6 rounded-lg shadow-md"
      />
    </div>
  );
};

export default OverviewPage;
