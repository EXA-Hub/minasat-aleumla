// app/src/pages/explore/overview.jsx
import { useOutletContext } from 'react-router-dom';
import Username from '../../components/explore/widgets/Username';
import MarkdownDisplay from '../../components/ui/markdown';

const content = `

| **🔴 تحديث: "⚠️ قد تستغرق بعض التحديثات فترة تتراوح من 10 دقائق إلى 24 ساعة ⚠️"** |
|---------------------------------------------------------------------------------|


# مرحباً بكم في منصتنا المطورة! 🌟

نحن نعمل حاليًا على تطوير وتحسين صفحات _السوق والتجارة_ لتقديم تجربة أفضل وأكثر سهولة.

## المميزات الجديدة

### تحسينات التصميم
- تصميم متجاوب بالكامل مع جميع الأجهزة
- **✨ واجهة مستخدم عصرية** مع تأثيرات حركية
- **💡 تحسين سرعة التحميل** بنسبة 50%

### تحديثات النظام
- **🟢 نظام تسجيل دخول محسّن**
- **🟡 ميزات قيد التطوير**
- \`تحديث v2.0.3\` مع إصلاحات مهمة

> [!info]
> تم إطلاق واجهة المستخدم بالكامل! استكشف المميزات الجديدة.

> [!warning]
> ⚠️ قاعدة البيانات تحتاج إلى 24 ساعة للتحديث بعد إجراء التغييرات.

> [!success]
> ✅ تم إطلاق نظام المدفوعات الجديد بنجاح!

## جدول المميزات

| الميزة | الحالة | التاريخ المتوقع |
|--------|--------|-----------------|
| نظام الدفع | **🟢 مكتمل** | 15 يناير |
| البوتات | **🟡 قريباً** | 1 فبراير |
| السوق | **🔴 قريباً** | 15 فبراير |

## روابط مفيدة
- [الشروط والحقوق](/terms)
- [سياسة الخصوصية](/privacy-policy)
- [تواصل معنا](/dashboard/security/help)

> اشترك في حسابتنا لمتابعة آخر التحديثات!

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/EXA-Hub)

🎉 **تم تفعيل نظام الإشعارات** 📢✨

`;

const OverviewPage = () => {
  const { user } = useOutletContext();

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
        className="bg-gray-50/10 p-6 rounded-lg shadow-md"
      />
    </div>
  );
};

export default OverviewPage;
