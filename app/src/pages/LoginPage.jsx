import { useState, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import api from '../utils/api';

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
      className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2 text-foreground">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {isLogin ? 'مرحباً بعودتك!' : 'انضم إلينا اليوم'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              اسم المستخدم
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 
                       bg-background text-foreground"
              required
              pattern="[A-Za-z0-9]+"
              title="فقط الأحرف والأرقام مسموح بها"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 
               bg-background text-foreground pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 
                dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={
                  showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'
                }>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="relative">
              <label className="block text-sm font-medium mb-2">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 
                 bg-background text-foreground pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 
                  dark:text-gray-400 dark:hover:text-gray-200"
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
              <label className="block text-sm font-medium mb-2">
                رمز المصادقة الثنائية
              </label>
              <input
                type="text"
                value={tfaCode}
                onChange={(e) => setTfaCode(e.target.value)}
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 
                     bg-background text-foreground"
                required
                pattern="[0-9]{6}"
              />
            </div>
          )}

          {/* hCaptcha */}
          <div className="flex justify-center my-6">
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
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 ml-2"
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
                  className="text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-500">
                  الشروط والأحكام
                </Link>{' '}
                و{' '}
                <Link
                  to="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-500">
                  سياسة الخصوصية
                </Link>
              </label>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
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
            className="text-blue-600 hover:underline">
            {isLogin
              ? 'ليس لديك حساب؟ سجل الآن'
              : 'لديك حساب بالفعل؟ سجل دخولك'}
          </button>
        </div>
        <button
          onClick={() => navigate('/recoverAccount')}
          className="mt-4 text-gray-600 dark:text-gray-300 hover:underline text-sm block mx-auto">
          هل فقدت حسابك؟
        </button>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-gray-600 dark:text-gray-300 hover:underline text-sm block mx-auto">
          العودة إلى الصفحة الرئيسية
        </button>
      </Card>
    </div>
  );
};

export default LoginPage;
