// app/src/pages/explore/overview.jsx
import { useOutletContext } from 'react-router-dom';
import Username from '../../components/explore/widgets/Username';
import MarkdownDisplay from '../../components/ui/markdown';

const content = `
# مرحباً بكم في منصتنا!
نحن نعمل حاليًا على تطوير وتحسين صفحات **السوق والتجارة** لتقديم تجربة أفضل وأكثر سهولة.

## ما الجديد؟
- تحسينات في الأداء وسرعة التصفح.
- **مزايا جديدة** لمساعدتك على التنقل بسهولة.

## أهدافنا
- تعزيز تجربة المستخدم.
- توفير أدوات أكثر كفاءة للتجارة الإلكترونية.
- بناء مجتمع أقوى وأكثر تفاعلاً.

> تابعوا تحديثاتنا لـ[ـمعرفة المزيد](https://www.youtube.com/@EXATUBE)!
`;

const OverviewPage = () => {
  const { user } = useOutletContext();

  return (
    <div>
      <MarkdownDisplay
        title="نشرة إخبارية"
        content={content}
        className="bg-gray-50/10 p-6 rounded-lg shadow-md"
      />
      {user && <Username username={user.username} />}
    </div>
  );
};

export default OverviewPage;
