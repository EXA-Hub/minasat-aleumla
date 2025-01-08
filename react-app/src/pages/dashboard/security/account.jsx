import { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/card';
import api from '../../../utils/api';
import { toast } from 'react-hot-toast';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { useNavigate } from 'react-router-dom';
import {
  Loader2,
  Shield,
  Smartphone,
  Mail,
  X,
  AlertTriangle,
  Download,
  Copy,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const VerificationModal = ({
  type,
  isOpen,
  onClose,
  onVerify,
  loading,
  qrData,
  secret,
}) => {
  const [code, setCode] = useState('');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      style={{
        marginTop: '-calc(1.5rem * calc(1 - var(--tw-space-y-reverse)))',
      }}
    >
      <div className="bg-[var(--background)] p-6 rounded-lg w-96 relative">
        <button
          onClick={() => {
            setCode('');
            onClose();
          }}
          className="absolute left-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-semibold mb-4 text-right">
          {type === '2fa' ? 'إعداد المصادقة الثنائية' : 'التحقق من الرمز'}
        </h3>

        {type === '2fa' && qrData && (
          <div className="mb-4 flex flex-col items-center">
            <div className="p-2 border-4 border-foreground rounded-lg inline-block">
              <QRCodeSVG
                value={qrData}
                size={200}
                fgColor="var(--foreground)" // Foreground color
                bgColor="var(--background)" // Background color
                className="rounded-md"
              />
            </div>
            <p className="mt-2 text-sm text-gray-600 break-all">
              الرمز السري: {secret}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="أدخل رمز التحقق"
            className="w-full p-2 border rounded-md text-right bg-background text-foreground"
          />

          <button
            onClick={() => {
              setCode('');
              onVerify(code);
            }}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 relative"
          >
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin absolute left-3 top-1/2 transform -translate-y-1/2" />
            )}
            تحقق
          </button>
        </div>
      </div>
    </div>
  );
};

// Create new BackupCodesModal.jsx component

const BackupCodesModal = ({ isOpen, onClose, codes }) => {
  if (!isOpen) return null;

  const handleCopy = () => {
    const textToCopy = [
      'الرموز الإحتطياطية لحسابك في منصة العملة\n',
      ...codes,
    ].join('\n');

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          toast.success('تم نسخ الرموز');
        })
        .catch((err) => {
          toast.error('فشل النسخ: ' + err.message);
        });
    } else {
      // Fallback for unsupported environments
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        toast.success('تم نسخ الرموز');
      } catch (err) {
        toast.error('فشل النسخ: ' + err.message);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const handleDownload = () => {
    const textToDownload = [
      'الرموز الإحتطياطية لحسابك في منصة العملة\n',
      ...codes,
    ].join('\n');
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        marginTop: '-calc(1.5rem * calc(1 - var(--tw-space-y-reverse)))',
      }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-[var(--background)] p-6 rounded-lg w-96 relative">
        <button onClick={onClose} className="absolute left-4 top-4">
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-semibold mb-4 text-right">
          الرموز الإحتياطية
        </h3>

        <div className="bg-[var(--muted)] p-4 rounded-md mb-4">
          <div className="grid grid-cols-2 gap-2 text-center">
            {codes.map((code, index) => (
              <div
                key={index}
                className="font-mono bg-[var(--background)] p-2 rounded"
              >
                {code}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Copy className="h-4 w-4" />
            نسخ
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            تحميل
          </button>
        </div>
      </div>
    </div>
  );
};

const AccountSecurity = () => {
  const [loadingStates, setLoadingStates] = useState({
    password: false,
    username: false,
    twoFactor: false,
    email: false,
    phone: false,
    remove: false,
    request: false,
    initial: true,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [type, seType] = useState('email');
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [backupCodes, setBackupCodes] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSecuritySettings();
  }, []);

  const fetchSecuritySettings = async () => {
    try {
      const response = await api.security.getSettings();
      setTwoFactorEnabled(response.twoFactorEnabled);
      setRecoveryEmail(response.recoveryEmail);
      setRecoveryPhone(response.recoveryPhone);
    } catch (error) {
      console.log(error);
      toast.error('خطأ في تحميل الإعدادات');
    } finally {
      setLoadingStates((prev) => ({ ...prev, initial: false }));
    }
  };

  const setLoading = (key, value) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    // Show a toast message
    toast('سيتم تسجيل الخروج بعد 5 ثوان', {
      icon: '🚪', // Add an icon if needed
      duration: 5000, // Display toast for 5 seconds
      style: {
        direction: 'rtl', // Ensure RTL alignment for Arabic
        textAlign: 'right',
      },
    });

    // Delay the logout action for 5 seconds
    setTimeout(() => {
      // Remove the token from localStorage
      localStorage.removeItem('token');

      // Redirect to the login page
      navigate('/login');
    }, 5000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading('password', true);
    try {
      const data = {
        currentPassword: e.target.currentPassword.value,
        newPassword: e.target.newPassword.value,
        confirmPassword: e.target.confirmPassword.value,
      };
      const response = await api.security.changePassword(data);
      toast.success(response.message);
      if (response.requireRelogin) {
        handleLogout();
      }
    } catch (error) {
      toast.error(error.data?.error || 'حدث خطأ أثناء تحديث كلمة المرور');
    }
    setLoading('password', false);
  };

  const handleUsernameChange = async (e) => {
    e.preventDefault();
    setLoading('username', true);
    try {
      const data = {
        newUsername: e.target.username.value,
        password: e.target.password.value,
      };
      const response = await api.security.changeUsername(data);
      toast.success(response.message);
      if (response.requireRelogin) {
        handleLogout();
      }
    } catch (error) {
      toast.error(error.data?.error || 'حدث خطأ أثناء تحديث اسم المستخدم');
    }
    setLoading('username', false);
  };

  const [verificationModal, setVerificationModal] = useState({
    isOpen: false,
    type: null,
    qrData: null,
    secret: null,
    value: null,
  });

  const handleToggle2FA = async () => {
    setLoading('twoFactor', true);
    try {
      if (!twoFactorEnabled) {
        const response = await api.security.verify({
          action: '2fa',
          type: 'setup',
        });
        setVerificationModal({
          isOpen: true,
          type: '2fa',
          qrData: response.otpauth,
          secret: response.secret,
        });
      } else {
        setVerificationModal({
          isOpen: true,
          type: '2fa',
        });
      }
    } catch (error) {
      toast.error(error.data?.error || 'حدث خطأ في المصادقة الثنائية');
    }
    setLoading('twoFactor', false);
  };

  const handleEmailRecovery = async (e) => {
    e.preventDefault();
    setLoading('email', true);
    try {
      const email = e.target.email.value;
      await api.security.verify({
        action: 'email',
        type: 'setup',
        value: email,
      });
      setVerificationModal({
        isOpen: true,
        type: 'email',
        value: email,
      });
    } catch (error) {
      toast.error(error.data?.error || 'حدث خطأ في إرسال الرمز');
    }
    setLoading('email', false);
  };

  const handlePhoneRecovery = async (e) => {
    e.preventDefault();
    setLoading('phone', true);
    try {
      const phone = e.target.phone.value;
      await api.security.verify({
        action: 'phone',
        type: 'setup',
        value: phone,
      });
      setVerificationModal({
        isOpen: true,
        type: 'phone',
        value: phone,
      });
    } catch (error) {
      toast.error(error.data?.error || 'حدث خطأ في إرسال الرمز');
    }
    setLoading('phone', false);
  };

  const handleVerification = async (code) => {
    const { type, value } = verificationModal;
    setLoading(type, true);
    try {
      if (type === '2fa') {
        const action = twoFactorEnabled ? 'disable' : 'verify';
        const response = await api.security.verify({
          action: '2fa',
          type: action,
          token: code,
        });
        setTwoFactorEnabled(response.enabled);
      } else {
        await api.security.verify({
          action: type,
          type: 'verify',
          value,
          token: code,
        });
        if (type === 'email') setRecoveryEmail(value);
        if (type === 'phone') setRecoveryPhone(value);
      }
      toast.success('تم التحقق بنجاح');
      setVerificationModal({ isOpen: false });
    } catch (error) {
      toast.error(error.data?.error || 'رمز غير صالح');
    }
    setLoading(type, false);
  };

  if (loadingStates.initial) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const LoadingButton = ({ loading, children, ...props }) => (
    <button
      {...props}
      disabled={loading}
      className={`${props.className || ''} relative`}
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin absolute left-3 top-1/2 transform -translate-y-1/2" />
      )}
      {children}
    </button>
  );

  return (
    <div className="space-y-6 rtl text-right">
      <h2 className="text-3xl font-bold">أمان الحساب</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-[var(--background)] text-[var(--foreground)]">
          <h3 className="text-xl font-semibold mb-4">تغيير كلمة المرور</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                كلمة المرور الحالية
              </label>
              <input
                name="currentPassword"
                type="password"
                className="w-full p-2 border rounded-md bg-[var(--background)] text-[var(--foreground)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                كلمة المرور الجديدة
              </label>
              <input
                name="newPassword"
                type="password"
                className="w-full p-2 border rounded-md bg-[var(--background)] text-[var(--foreground)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                تأكيد كلمة المرور الجديدة
              </label>
              <input
                name="confirmPassword"
                type="password"
                className="w-full p-2 border rounded-md bg-[var(--background)] text-[var(--foreground)]"
                required
              />
            </div>
            <LoadingButton
              type="submit"
              loading={loadingStates.password}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              تحديث كلمة المرور
            </LoadingButton>
          </form>
        </Card>

        <Card className="p-6 bg-[var(--background)] text-[var(--foreground)]">
          <h3 className="text-xl font-semibold mb-4">تغيير اسم المستخدم</h3>
          <form onSubmit={handleUsernameChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                اسم المستخدم الجديد
              </label>
              <input
                name="username"
                type="text"
                className="w-full p-2 border rounded-md bg-[var(--background)] text-[var(--foreground)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                كلمة المرور
              </label>
              <input
                name="password"
                type="password"
                className="w-full p-2 border rounded-md bg-[var(--background)] text-[var(--foreground)]"
                required
              />
            </div>
            <LoadingButton
              type="submit"
              loading={loadingStates.username}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              تحديث اسم المستخدم
            </LoadingButton>
          </form>
        </Card>

        <Card className="p-6 bg-[var(--background)] text-[var(--foreground)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">المصادقة الثنائية</h3>
            <Shield
              className={`h-6 w-6 ${twoFactorEnabled ? 'text-green-500' : 'text-gray-400'}`}
            />
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              أضف طبقة أمان إضافية لحسابك من خلال تمكين المصادقة الثنائية.
            </p>
            <LoadingButton
              onClick={handleToggle2FA}
              loading={loadingStates.twoFactor}
              className={`w-full py-2 px-4 rounded-md ${
                twoFactorEnabled
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {twoFactorEnabled
                ? 'تعطيل المصادقة الثنائية'
                : 'تمكين المصادقة الثنائية'}
            </LoadingButton>
          </div>
        </Card>

        <Card className="p-6 bg-[var(--background)] text-[var(--foreground)]">
          <h3 className="text-xl font-semibold mb-4">خيارات الاسترداد</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-reverse space-x-4">
              <Mail className="h-6 w-6" />
              <div className="flex-1">
                <form
                  onSubmit={handleEmailRecovery}
                  className="flex space-x-reverse space-x-2"
                >
                  <input
                    name="email"
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    style={{ width: '100%' }}
                    placeholder="البريد الإلكتروني للاسترداد"
                    className="flex-1 p-2 border rounded-md bg-[var(--background)] text-[var(--foreground)]"
                  />
                  <LoadingButton
                    type="submit"
                    loading={loadingStates.email}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    حفظ
                  </LoadingButton>
                </form>
              </div>
            </div>
            <div className="flex items-center space-x-reverse space-x-4">
              <Smartphone className="h-6 w-6" />
              <div className="flex-1">
                <form
                  onSubmit={handlePhoneRecovery}
                  className="flex space-x-reverse space-x-2"
                >
                  <input
                    name="phone"
                    type="tel"
                    style={{ width: '100%' }}
                    value={recoveryPhone}
                    onChange={(e) => setRecoveryPhone(e.target.value)}
                    placeholder="رقم الهاتف للاسترداد"
                    className="flex-1 p-2 border rounded-md bg-[var(--background)] text-[var(--foreground)]"
                  />
                  <LoadingButton
                    type="submit"
                    loading={loadingStates.phone}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    حفظ
                  </LoadingButton>
                </form>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-[var(--background)] text-[var(--foreground)]">
          <h3 className="text-xl font-semibold mb-4">الرموز الإحتياطية</h3>
          <Alert
            variant="warning"
            className="mb-4"
            style={{
              display: 'flex',
            }}
          >
            <AlertTriangle className="h-5 w-5 ml-2 rtl:ml-2 rtl:mr-0" />
            <AlertDescription className="ml-1">
              سيتم تجديد الرمز الإحتياطية عند كل طلب (إحتفظ بها في مكان آمن)
            </AlertDescription>
          </Alert>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading('request', true);
              try {
                const formData = new FormData(e.target);
                const data = {
                  password: formData.get('currentPassword'),
                  twoFactorCode: formData.get('twoFactorCode'),
                };

                const response = await api.security.getBackupCodes(data);
                setBackupCodes(response.backupCodes);
              } catch (error) {
                toast.error(
                  error.data?.error || 'حدث خطأ في إنشاء الرموز الاحتياطية'
                );
              }
              setLoading('request', false);
            }}
          >
            {twoFactorEnabled && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  رمز المصادقة الثنائية
                </label>
                <input
                  name="twoFactorCode"
                  type="password"
                  className="w-full p-2 border rounded-md bg-[var(--background)] text-[var(--foreground)]"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                كلمة المرور الحالية
              </label>
              <input
                name="currentPassword"
                type="password"
                className="w-full p-2 border rounded-md bg-[var(--background)] text-[var(--foreground)]"
                required
              />
            </div>

            <LoadingButton
              loading={loadingStates.request}
              type="submit"
              className={`w-full py-2 px-4 rounded-md bg-yellow-600 hover:bg-yellow-700 text-black`}
            >
              طلب الرموز الإحتياطية ⚠️
            </LoadingButton>
          </form>
        </Card>

        <Card className="p-6 bg-[var(--background)] text-[var(--foreground)]">
          <h3 className="text-xl font-semibold mb-4">حذف خيارات الاسترداد</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading('remove', true);
              try {
                const formData = new FormData(e.target);
                const data = {
                  type: formData.get('type'),
                  password: formData.get('currentPassword'),
                  twoFactorCode: formData.get('twoFactorCode'),
                };

                const response = await api.security.removeRecovery(data);
                toast.success(response.message);
                // Update the state to reflect the removal
                if (data.type === 'email') setRecoveryEmail('');
                else setRecoveryPhone('');
              } catch (error) {
                toast.error(
                  error.data?.error || 'حدث خطأ في حذف خيار الاسترداد'
                );
              }
              setLoading('remove', false);
            }}
          >
            <div className="space-y-2">
              <select
                className="w-full p-2 rounded-md border bg-background mb-4"
                name="type"
                value={type}
                onChange={(e) => {
                  seType(e.currentTarget.value);
                }}
              >
                <option value="email">البريد الإلكتروني</option>
                <option value="phone">رقم الهاتف</option>
              </select>
            </div>

            {twoFactorEnabled && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  رمز المصادقة الثنائية
                </label>
                <input
                  name="twoFactorCode"
                  type="password"
                  className="w-full p-2 border rounded-md bg-[var(--background)] text-[var(--foreground)]"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                كلمة المرور الحالية
              </label>
              <input
                name="currentPassword"
                type="password"
                className="w-full p-2 border rounded-md bg-[var(--background)] text-[var(--foreground)]"
                required
              />
            </div>

            <LoadingButton
              loading={loadingStates.remove}
              type="submit"
              className={`w-full py-2 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white`}
            >
              حذف خيار الاسترداد ⚠️
            </LoadingButton>
          </form>
        </Card>
      </div>

      <VerificationModal
        isOpen={verificationModal.isOpen}
        type={verificationModal.type}
        qrData={verificationModal.qrData}
        secret={verificationModal.secret}
        onClose={() => setVerificationModal({ isOpen: false })}
        onVerify={handleVerification}
        loading={loadingStates[verificationModal.type]}
      />
      <BackupCodesModal
        isOpen={backupCodes !== null}
        onClose={() => setBackupCodes(null)}
        codes={backupCodes || []}
      />
    </div>
  );
};

export default AccountSecurity;
