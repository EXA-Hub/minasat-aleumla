import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import api from '../utils/api';

const RecoveryPage = () => {
  const [step, setStep] = useState('method');
  const [type, setType] = useState('email');
  const [value, setValue] = useState('');
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.security.recovery.verify({ type, value, username });
      setStep('reset');
    } catch (err) {
      setError(err.data?.error || 'حدث خطأ');
    }
    setIsLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.security.recovery.reset({
        type,
        value,
        code: type === 'backupCode' ? value : code,
        newPassword,
        username,
      });
      navigate('/login');
    } catch (err) {
      setError(err.data?.error || 'حدث خطأ');
    }
    setIsLoading(false);
  };

  return (
    <div
      dir="rtl"
      className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="mb-6 text-center text-2xl font-bold">استعادة الحساب</h1>

        {error && (
          <div className="mb-4 rounded-sm bg-red-100 p-3 text-red-500 dark:bg-red-900/20">
            {error}
          </div>
        )}

        {step === 'method' && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="flex flex-col gap-y-2">
              <label className="block text-sm font-medium">
                طريقة الإستعادة
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-background w-full rounded-md border p-2">
                <option value="email">البريد الإلكتروني</option>
                <option value="phone">رقم الهاتف</option>
                <option value="backupCode">رمز النسخ الاحتياطي</option>
              </select>
            </div>

            <div className="flex flex-col gap-y-2">
              <label className="block text-sm font-medium">إسم المستخدم</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-background w-full rounded-md border p-2"
                required
              />

              <label className="block text-sm font-medium">
                {type === 'email'
                  ? 'البريد الإلكتروني'
                  : type === 'phone'
                    ? 'رقم الهاتف'
                    : 'رمز النسخ الاحتياطي'}
              </label>
              <input
                type={type === 'email' ? 'email' : 'text'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="bg-background w-full rounded-md border p-2"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? 'جاري التحقق...'
                : type === 'backupCode'
                  ? 'التحقق من الرمز'
                  : 'إرسال رمز التحقق'}
            </Button>
          </form>
        )}

        {step === 'reset' && type !== 'backupCode' && (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="flex flex-col gap-y-2">
              <label className="block text-sm font-medium">رمز التحقق</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-background w-full rounded-md border p-2"
                required
                pattern="[0-9]{6}"
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <label className="block text-sm font-medium">
                كلمة المرور الجديدة
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-background w-full rounded-md border p-2"
                required
                minLength={8}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'جاري التحقق...' : 'تغيير كلمة المرور'}
            </Button>
          </form>
        )}

        {step === 'reset' && type === 'backupCode' && (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="flex flex-col gap-y-2">
              <label className="block text-sm font-medium">
                كلمة المرور الجديدة
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-background w-full rounded-md border p-2"
                required
                minLength={8}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'جاري التحقق...' : 'تغيير كلمة المرور'}
            </Button>
          </form>
        )}

        <button
          onClick={() => navigate('/login')}
          className="mx-auto mt-4 block text-sm text-gray-600 hover:underline">
          العودة إلى تسجيل الدخول
        </button>
      </Card>
    </div>
  );
};

export default RecoveryPage;
