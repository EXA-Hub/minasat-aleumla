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

> [!success]
> \\*\\*✨ 🎉 تم تفعيل نظام الإشعارات 📢\\*\\*

> [!success]
>  \\*\\*✨ 🎉 تم تفعيل نظام المهمات اليومية 🎉\\*\\*

### تحسينات التصميم
- تصميم متجاوب بالكامل مع جميع الأجهزة
- **✨ واجهة مستخدم عصرية** مع تأثيرات حركية
- **💡 تحسين سرعة التحميل** بنسبة 50%

### تحديثات النظام
- **🟢 نظام تسجيل دخول محسّن**
- **🟡 ميزات قيد التطوير**
- \`تحديث v3.0.3\` مع إصلاحات مهمة

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
| البوتات | **🟢 مكتمل** | 1 فبراير |
| السوق | **🟡 قيد التنفيذ** | 15 فبراير |

## روابط مفيدة
- [الشروط والحقوق](/terms)
- [سياسة الخصوصية](/privacy-policy)
- [تواصل معنا](/dashboard/security/help)

> اشترك في حسابتنا لمتابعة آخر التحديثات!


## تواصل معنا
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/EXA-Hub)
[![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://dsc.gg/exa)
[![Twitter](https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/ExaTube)
[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@exatube)
[![TikTok](https://img.shields.io/badge/TikTok-000000?style=for-the-badge&logo=tiktok&logoColor=white)](https://www.tiktok.com/@exatube)


> [!success]
> \\*\\*💡 🎉 تم تفعيل ميزة الأكواد البرمجية في صندوق الوصف 📢\\*\\*

\`\`\`python
import exahub
import exahub.utils as utils

print(exahub.__version__)

class Example:
  def say_hello(self, name):
    print(f"Hello! {name}")

print(utils.get_version())
\`\`\`


\`\`\`ts
// some typescript code
import exahub from 'exahub';

/**
 * Returns the current version of the library.
 * @returns {string} The current version of the library.
 * @example
 * console.log(exahub.__VERSION__);
 */
function get_version(dev: boolean) {
  if (dev) {
    return exahub.__DEV_VERSION__;
  }
  return exahub.__VERSION__;
}

class Example {
  public sayHello(name: string) {
    console.log(\`Hello! \${name}\`);
  }
}

console.log(exahub);
\`\`\`

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
