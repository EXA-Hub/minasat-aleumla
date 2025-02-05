import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Card } from '../../../components/ui/card';
import api from '../../../utils/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';

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
          <DialogContent className="animate-fade-in scale-95 rounded-lg border border-gray-300 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-gray-800 dark:text-gray-200">
                تم إرسال رسالتك بنجاح
              </DialogTitle>
            </DialogHeader>
            <div className="mt-6 flex justify-center">
              سنقوم بالرد عليك في أقرب وقت ممكن عن طريق البريد الإلكتروني الذي
              قمت بإدخاله.
              <DialogTrigger
                className="focus:ring-primary-light bg-primary hover:bg-primary rounded-md px-6 py-2 text-white shadow-lg focus:ring-3 focus:outline-hidden"
                onClick={() => setDialogData(false)}>
                إغلاق
              </DialogTrigger>
            </div>
          </DialogContent>
        </Dialog>
      )}
      <h2 className="text-3xl font-bold">المساعدة والدعم</h2>

      <Alert
        variant="warning"
        className="mb-6 flex"
        style={{
          display: 'ruby-base',
        }}>
        <AlertTriangle className="mr-2 ml-2 h-5 w-5" />
        <AlertDescription>
          البريد الإلكتروني الرسمي للدعم: {officialEmails.join('، ')}. احذر من
          المحتالين الذين ينتحلون هوية فريق الدعم لدينا.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block flex text-sm font-medium">
              نوع الطلب
              {formData.type === 'bug' && (
                <div
                  className="border-primary bg-primary text-primary dark:border-30primary dark:bg-10primary dark:text-primary mx-2 flex"
                  style={{
                    display: 'ruby-base',
                  }}>
                  <Info className="mx-2 h-5 w-5" />
                  <AlertDescription>
                    ستحصل على مكآفأة في حال إكتشافك مشكلة أمنية في المنصة
                  </AlertDescription>
                </div>
              )}
            </label>
            <select
              className="bg-background text-foreground w-full rounded-md border p-2"
              value={formData.type}
              name="type"
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }>
              <option value="help">طلب مساعدة</option>
              <option value="report">الإبلاغ عن مشكلة</option>
              <option value="bug">الإبلاغ عن خلل</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">الموضوع</label>
            <input
              type="text"
              name="subject"
              minLength={3}
              maxLength={25}
              className="bg-background text-foreground w-full rounded-md border p-2"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">الرسالة</label>
            <textarea
              name="message"
              minLength={3}
              maxLength={1000}
              className="bg-background text-foreground h-32 w-full rounded-md border p-2"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              بريدك الإلكتروني
            </label>
            <input
              type="email"
              name="email"
              className="bg-background text-foreground w-full rounded-md border p-2"
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
            className="bg-primary hover:bg-primary w-full rounded-md px-4 py-2 text-white">
            إرسال
          </button>
        </form>
      </Card>
    </div>
  );
};

export default HelpPage;
