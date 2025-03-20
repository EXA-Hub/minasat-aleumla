// app/src/pages/explore/overview.jsx
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Username from '../../components/explore/widgets/Username';
import MarkdownDisplay from '../../components/ui/markdown';

import AdBanner from '../../services/ads/aads/AdBanner';
import Referral from '../../services/ads/aads/Referral';

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
        <div className="flex items-center justify-center">
          <iframe
            width="560"
            height="315"
            className="border-0"
            frameBorder="0"
            title="YouTube video player"
            referrerPolicy="strict-origin-when-cross-origin"
            src="https://www.youtube-nocookie.com/embed/kk1ta5A3nlU?si=w2QWTqxnjMy0tsHp"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen></iframe>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <Referral />
        <AdBanner />
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
