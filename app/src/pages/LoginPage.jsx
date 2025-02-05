import { useState, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import api from '../utils/api';

function generatePassword(length = 12) {
  const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?/';

  const allChars = lowerCaseChars + upperCaseChars + numbers + symbols;

  let password = '';

  // Ensure the password has at least one of each type
  password += lowerCaseChars[Math.floor(Math.random() * lowerCaseChars.length)];
  password += upperCaseChars[Math.floor(Math.random() * upperCaseChars.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Add remaining random characters to meet the length requirement (minimum 8 characters)
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password to ensure randomness
  password = password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');

  return password;
}

const LoginPage = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const referralId = searchParams.get('referral');
  const [show2FA, setShow2FA] = useState(false);
  const [tfaCode, setTfaCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(!referralId);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const captchaRef = useRef(); // Create a ref to access the captcha instance

  const handleResetCaptcha = () => {
    if (captchaRef.current) {
      captchaRef.current.resetCaptcha(); // Reset the captcha
      setCaptchaToken(''); // Clear the token state
    }
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (!isLogin && !acceptedTerms) {
      setError('يجب الموافقة على الشروط والأحكام وسياسة الخصوصية');
      return;
    }

    e.preventDefault();
    setError('');
    setIsLoading(true);

    const usernameRegex = /^[A-Za-z0-9]+$/;
    if (!usernameRegex.test(formData.username)) {
      setError('اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط');
      setIsLoading(false);
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      setIsLoading(false);
      return;
    }

    if (!captchaToken) {
      setError('يرجى التحقق من أنك لست روبوتًا.');
      setIsLoading(false);
      return;
    }

    try {
      const credentials = {
        username: formData.username,
        password: formData.password,
        token: captchaToken,
        ...(show2FA && { tfaCode }),
        referralId,
      };

      const data = await (isLogin
        ? api.auth.login(credentials)
        : api.auth.signup(credentials));

      if (data.requiresMFA) {
        setShow2FA(true);
        setIsLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);

      await api.auth.getMe();

      navigate('/dashboard');
    } catch (err) {
      console.log(err);

      if (err.data?.error === 'Invalid username or password.') {
        setError('إسم المستخدم أو كلمة المرور غير صحيح');
      } else {
        setError(
          err.message ||
            err.data?.error ||
            err.data.errors ||
            err.data.errors[0].msg ||
            'حدث خطأ. الرجاء المحاولة لاحقآ.'
        );
      }
    } finally {
      handleResetCaptcha();
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const theme = (() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  })();

  return (
    <div
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {isLogin ? 'مرحباً بعودتك!' : 'انضم إلينا اليوم'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-sm bg-red-100 p-3 text-sm text-red-500 dark:bg-red-900/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              اسم المستخدم
            </label>
            <Input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 bg-background p-2 text-foreground dark:border-gray-600"
              required
              pattern="[A-Za-z0-9]+"
              title="فقط الأحرف والأرقام مسموح بها"
            />
          </div>

          <div className="relative">
            <label className="mb-2 block flex items-center gap-2 text-sm font-medium">
              كلمة المرور
              {!isLogin && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const length =
                        parseInt(
                          document.getElementById('passwordLength').value
                        ) || 12;
                      const newPassword = generatePassword(
                        Math.max(8, Math.min(32, length))
                      );
                      setFormData((prev) => ({
                        ...prev,
                        password: newPassword,
                        confirmPassword: newPassword,
                      }));
                    }}
                    className="inline-flex items-center text-primary hover:text-80primary">
                    <RefreshCw size={16} className="mx-1" />
                    توليد كلمة مرور:
                  </button>
                  <Input
                    type="number"
                    min="8"
                    max="32"
                    defaultValue={12}
                    className="w-16 rounded-none border-none bg-transparent px-0 text-sm focus:outline-hidden focus:ring-0 focus:ring-offset-0"
                    id="passwordLength"
                  />
                </>
              )}
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 bg-background p-2 pr-10 text-foreground dark:border-gray-600"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={
                  showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'
                }>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="relative">
              <label className="mb-2 block text-sm font-medium">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 bg-background p-2 pr-10 text-foreground dark:border-gray-600"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label={
                    showConfirmPassword
                      ? 'إخفاء تأكيد كلمة المرور'
                      : 'إظهار تأكيد كلمة المرور'
                  }>
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>
          )}

          {show2FA && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                رمز المصادقة الثنائية
              </label>
              <Input
                type="text"
                value={tfaCode}
                onChange={(e) => setTfaCode(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-background p-2 text-foreground dark:border-gray-600"
                required
                pattern="[0-9]{6}"
              />
            </div>
          )}

          {/* hCaptcha */}
          <div className="my-6 flex justify-center">
            <HCaptcha
              ref={captchaRef} // Attach the ref to the HCaptcha component
              sitekey="3afe6d04-5c50-4094-8306-6350c67e250c"
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken('')}
              languageOverride="ar"
              theme={theme}
              size="normal"
            />
          </div>

          {!isLogin && (
            <div className="flex items-start space-x-3">
              <Input
                type="checkbox"
                id="acceptTerms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="ml-2 mt-1 h-4 w-4 max-w-fit rounded-sm border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                required
              />
              <label
                htmlFor="acceptTerms"
                className="text-sm text-gray-600 dark:text-gray-300">
                أوافق على{' '}
                <Link
                  to="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary hover:underline dark:text-primary dark:hover:text-primary">
                  الشروط والأحكام
                </Link>{' '}
                و{' '}
                <Link
                  to="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary hover:underline dark:text-primary dark:hover:text-primary">
                  سياسة الخصوصية
                </Link>
              </label>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary"
            disabled={isLoading}>
            {isLoading
              ? 'جاري التحميل...'
              : isLogin
                ? 'تسجيل الدخول'
                : 'إنشاء حساب'}
            <ArrowRight className="mr-2 h-5 w-5" />
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ username: '', password: '', confirmPassword: '' });
            }}
            className="text-primary hover:underline">
            {isLogin
              ? 'ليس لديك حساب؟ سجل الآن'
              : 'لديك حساب بالفعل؟ سجل دخولك'}
          </button>
        </div>
        <button
          onClick={() => navigate('/recoverAccount')}
          className="mx-auto mt-4 block text-sm text-gray-600 hover:underline dark:text-gray-300">
          هل فقدت حسابك؟
        </button>
        <button
          onClick={() => navigate('/')}
          className="mx-auto mt-4 block text-sm text-gray-600 hover:underline dark:text-gray-300">
          العودة إلى الصفحة الرئيسية
        </button>
      </Card>
    </div>
  );
};

export default LoginPage;
