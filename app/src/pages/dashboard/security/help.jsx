import { useState } from 'react';
import { Card } from '../../../components/ui/card';
import { AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { toast } from 'react-hot-toast';
import api from '../../../utils/api';

const HelpPage = () => {
  const [dialogData, setDialogData] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    email: '',
    type: 'help',
  });

  const email = import.meta.env.VITE_EMAIL;

  const officialEmails = [email];

  const handleSubmit = async (e) => {
    try {
      setDialogData(true);
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      await api.help(data);
      toast.success('تم إرسال رسالتك بنجاح');
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء إرسال رسالتك');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {dialogData && (
        <Dialog>
          <DialogContent className="animate-fade-in scale-95 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">
                تم إرسال رسالتك بنجاح
              </DialogTitle>
            </DialogHeader>
            <div className="mt-6 flex justify-center">
              سنقوم بالرد عليك في أقرب وقت ممكن عن طريق البريد الإلكتروني الذي
              قمت بإدخاله.
              <DialogTrigger
                className="px-6 py-2 bg-blue-500 hover:bg-blue-900 text-white rounded-md shadow-lg focus:ring focus:ring-primary-light focus:outline-none"
                onClick={() => setDialogData(false)}
              >
                إغلاق
              </DialogTrigger>
            </div>
          </DialogContent>
        </Dialog>
      )}
      <h2 className="text-3xl font-bold">المساعدة والدعم</h2>

      <Alert
        variant="warning"
        className="mb-6"
        style={{
          display: 'ruby-base',
        }}
      >
        <AlertTriangle className="h-5 w-5 ml-2 rtl:ml-2 rtl:mr-2" />
        <AlertDescription>
          البريد الإلكتروني الرسمي للدعم: {officialEmails.join('، ')}. احذر من
          المحتالين الذين ينتحلون هوية فريق الدعم لدينا.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              نوع الطلب
              {formData.type === 'bug' && (
                <div
                  className="mx-2 border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-200/30 dark:bg-blue-900/10 dark:text-blue-200"
                  style={{
                    display: 'ruby-base',
                  }}
                >
                  <Info className="h-5 w-5 mx-2" />
                  <AlertDescription>
                    ستحصل على مكآفأة في حال إكتشافك مشكلة أمنية في المنصة
                  </AlertDescription>
                </div>
              )}
            </label>
            <select
              className="w-full p-2 border rounded-md bg-background text-foreground"
              value={formData.type}
              name="type"
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              <option value="help">طلب مساعدة</option>
              <option value="report">الإبلاغ عن مشكلة</option>
              <option value="bug">الإبلاغ عن خلل</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الموضوع</label>
            <input
              type="text"
              name="subject"
              minLength={3}
              maxLength={25}
              className="w-full p-2 border rounded-md bg-background text-foreground"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الرسالة</label>
            <textarea
              name="message"
              minLength={3}
              maxLength={1000}
              className="w-full p-2 border rounded-md h-32 bg-background text-foreground"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              بريدك الإلكتروني
            </label>
            <input
              type="email"
              name="email"
              className="w-full p-2 border rounded-md bg-background text-foreground"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <button
            type="submit"
            disabled={dialogData}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            إرسال
          </button>
        </form>
      </Card>
    </div>
  );
};

export default HelpPage;
