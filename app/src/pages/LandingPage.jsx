import './landing.css';

import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Config = {
  APP_NAME: 'منصة العملة',
  APP_DOMAIN_NAME: window.location.hostname,
  CONTACT_EMAIL: import.meta.env.VITE_EMAIL,
  SUBSCRIPTION_PRICES: {
    plus: {
      monthly: 6,
    },
  },
};

import {
  Menu,
  MapPin,
  Zap,
  Puzzle,
  X,
  Moon,
  Sun,
  Settings,
  Github,
  Mail,
  Twitter,
  Coins,
  Share2,
  Gift,
  ShoppingCart,
  BadgePercent,
  CheckCircle,
  CreditCard,
  Check,
  Lock,
  Scale,
  Headset,
  Building2,
  Sparkles,
  Shield,
  MessageSquare,
  Wallet,
  LucideTimer,
  LinkIcon,
  Briefcase,
  BarChart,
} from 'lucide-react';

import { Discord, Telegram, Paypal } from '../components/ui/CustomIcons';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 shadow-lg backdrop-blur-lg dark:bg-gray-900/80'
          : 'bg-transparent'
      }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="#home" className="flex items-center space-x-2">
            <img
              src="/icon.svg"
              className="text-primary-600 dark:text-primary-400 h-7 w-7"
            />
            <span className="text-primary-600 dark:text-primary-400 text-xl font-bold">
              {Config.APP_NAME}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            <Link
              to="#features"
              className="hover:text-primary-600 dark:hover:text-primary-400 text-gray-600 transition-colors dark:text-gray-300">
              وسائل الدخل
            </Link>
            <Link
              to="#comparison"
              className="hover:text-primary-600 dark:hover:text-primary-400 text-gray-600 transition-colors dark:text-gray-300">
              وسائل الدفع
            </Link>
            <Link
              to="#pricing"
              className="hover:text-primary-600 dark:hover:text-primary-400 text-gray-600 transition-colors dark:text-gray-300">
              الخطط
            </Link>
            <Link
              to="#about"
              className="hover:text-primary-600 dark:hover:text-primary-400 text-gray-600 transition-colors dark:text-gray-300">
              الوصول
            </Link>
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle theme">
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>
            <Link
              to="/login"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              تسجيل الدخول
            </Link>
            <Link
              to="/dashboard"
              className="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 text-white transition-colors">
              البدء
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle theme">
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hover:text-primary-600 dark:hover:text-primary-400 text-gray-600 dark:text-gray-300">
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="bg-white py-4 md:hidden dark:bg-gray-900">
            <div className="flex flex-col space-y-4">
              <Link
                to="#features"
                className="hover:text-primary-600 dark:hover:text-primary-400 px-4 text-gray-600 transition-colors dark:text-gray-300">
                الربح
              </Link>
              <Link
                to="#pricing"
                className="hover:text-primary-600 dark:hover:text-primary-400 px-4 text-gray-600 transition-colors dark:text-gray-300">
                الخطط
              </Link>
              <Link
                to="#about"
                className="hover:text-primary-600 dark:hover:text-primary-400 px-4 text-gray-600 transition-colors dark:text-gray-300">
                المحفظة
              </Link>
              <Link
                to="/login"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 px-4 transition-colors">
                تسجيل الدخول
              </Link>
              <Link
                to="/dashboard"
                className="bg-primary-600 hover:bg-primary-700 mx-4 rounded-lg px-4 py-2 text-center text-white transition-colors">
                التسجيل
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export function HeroSection() {
  return (
    <div
      id="home"
      className="from-primary-200 to-primary-100 bg-linear-to-b pt-24 pb-16 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-6 flex justify-center">
          <div className="animate-float relative">
            <div className="from-primary-500 to-accent-500 absolute inset-0 rounded-full bg-linear-to-r opacity-20 blur-2xl"></div>
            <Wallet className="text-primary-600 dark:text-primary-400 animate-pulse-slow relative h-20 w-20" />
          </div>
        </div>
        <h1 className="animated-gradient-text mb-6 text-4xl font-bold md:text-6xl">
          الدخل الرقمي,
          <br />
          <span className="text-2xl md:text-3xl">
            كل طرق الربح من الإنترنت في مكان واحد
          </span>
        </h1>
        <p className="animate-slide-up mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">
          منصة شاملة تجمع كل طرق الربح من الإنترنت في مكان واحد.
          <br className="hidden md:block" />
          <span className="text-primary-600 dark:text-primary-400 font-semibold">
            توفر أدوات مبتكرة وفرصًا متنوعة لزيادة الدخل الرقمي.
          </span>
        </p>
        <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/dashboard"
            className="from-primary-500 to-accent-500 hover:bg-primary-700 rounded-lg bg-linear-to-tr px-8 py-3 font-semibold text-white shadow-lg transition-colors hover:shadow-xl">
            البدء مجانا
          </Link>
          <Link
            to="/login"
            className="border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg border-2 px-8 py-3 font-semibold transition-colors">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <div
      id="features"
      className="from-primary-100 bg-linear-to-b to-gray-50 py-24 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="mb-16 flex flex-row-reverse items-center justify-center text-center text-3xl font-bold md:text-4xl">
          <span className="text-primary-600 dark:text-primary-400 px-2">6</span>
          <span>طرق للربح والمزيد قادم</span>
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="feature-card from-primary-100 to-accent-100 bg-linear-to-br dark:from-gray-800 dark:to-gray-800">
            <div className="mb-4 flex items-center">
              <div className="bg-primary-100 dark:bg-primary-900 rounded-lg p-2">
                <LucideTimer className="text-primary-600 dark:text-primary-400 h-6 w-6" />
              </div>
              <h3 className="ml-3 text-xl font-semibold">المهمات الدورية</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              مهمات يمكنك القيام بها يوميا اسبوعيا شهريا وسنويا للحصول على رصيد
              إضافي داخل محفظتك
            </p>
          </div>
          <div className="feature-card from-primary-100 to-accent-100 bg-linear-to-br dark:from-gray-800 dark:to-gray-800">
            <div className="mb-4 flex items-center">
              <div className="bg-primary-100 dark:bg-primary-900 rounded-lg p-2">
                <Share2 className="text-primary-600 dark:text-primary-400 h-6 w-6" />
              </div>
              <h3 className="ml-3 text-xl font-semibold">برنامج الإحالة</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              قم بدعوة أصدقائك وأحصل على نصف عمولة المحاليين من خلالك مدى الحياة
            </p>
          </div>
          <div className="feature-card from-primary-100 to-accent-100 bg-linear-to-br dark:from-gray-800 dark:to-gray-800">
            <div className="mb-4 flex items-center">
              <div className="bg-primary-100 dark:bg-primary-900 rounded-lg p-2">
                <Gift className="text-primary-600 dark:text-primary-400 h-6 w-6" />
              </div>
              <h3 className="ml-3 text-xl font-semibold">الهدايا الجوية</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              كن أول من يحصل على الهدية الجوية الجديدة أو أنشا هديتك الخاصة
            </p>
          </div>
          <div className="feature-card from-primary-100 to-accent-100 bg-linear-to-br dark:from-gray-800 dark:to-gray-800">
            <div className="mb-4 flex items-center">
              <div className="bg-primary-100 dark:bg-primary-900 rounded-lg p-2">
                <LinkIcon className="text-primary-600 dark:text-primary-400 h-6 w-6" />
              </div>
              <h3 className="ml-3 text-xl font-semibold">روابط الدعم</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              إجمع هدايا الدعم المادي من كل متابعينك عبر منصات التواصل بسهولة
              كبيرة
            </p>
          </div>
          <div className="feature-card from-primary-100 to-accent-100 bg-linear-to-br dark:from-gray-800 dark:to-gray-800">
            <div className="mb-4 flex items-center">
              <div className="bg-primary-100 dark:bg-primary-900 rounded-lg p-2">
                <ShoppingCart className="text-primary-600 dark:text-primary-400 h-6 w-6" />
              </div>
              <h3 className="ml-3 text-xl font-semibold">
                التجارة الالكترونية
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              قم بتقديم خدماتك او منتجاتك عبر موقعنا للحصول على أرباح أعلى
            </p>
          </div>
          <div className="feature-card from-primary-100 to-accent-100 bg-linear-to-br dark:from-gray-800 dark:to-gray-800">
            <div className="mb-4 flex items-center">
              <div className="bg-primary-100 dark:bg-primary-900 rounded-lg p-2">
                <Briefcase className="text-primary-600 dark:text-primary-400 h-6 w-6" />
              </div>
              <h3 className="ml-3 text-xl font-semibold">العمل معنا</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              يمكنك العمل مع المنصة عبر إكتشاف الثغرات أو العمل كإداري للحصول
              على دخل إضافي
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ComparisonSection() {
  return (
    <div
      id="comparison"
      className="border-y border-gray-100 bg-white/80 py-24 backdrop-blur-xs dark:border-gray-800 dark:bg-gray-800/50">
      <div className="container mx-auto px-4">
        <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
          وسائل الإيداع والسحب
        </h2>
        <p className="mx-auto mb-16 max-w-2xl text-center text-gray-600 dark:text-gray-400">
          نوفر وسائل دفع عالمية ومحلية، بالإضافة إلى عملة رقمية مشفرة تم تطويرها
          خصيصًا من قبل فريق المنصة لتسهيل المعاملات بأمان وسرعة
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <Paypal className="h-8 w-8 text-blue-500" />
                <h3 className="ml-2 text-xl font-semibold">الوسائل العالمية</h3>
              </div>
              <span className="text-sm text-gray-500">
                بايبال, بيتكوين, وتيثر
              </span>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start">
                <X className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-red-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  رسوم تحويل مرتفعة
                </span>
              </li>
              <li className="flex items-start">
                <X className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-red-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  يتم مراجعتها يدويا
                </span>
              </li>
              <li className="flex items-start">
                <X className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-red-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  قد تخترق خصوصيتك
                </span>
              </li>
              <li className="flex items-start">
                <X className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-red-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  حد أدنى للسحب
                </span>
              </li>
            </ul>
          </div>
          <div className="from-primary-500 to-accent-500 transform rounded-xl bg-linear-to-br p-8 shadow-lg md:-translate-y-4 md:scale-110">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <Coins className="h-8 w-8 text-white" />
                <h3 className="ml-2 text-xl font-semibold text-white">
                  عملة EXAMINE
                </h3>
              </div>
              <span className="text-sm text-white/80">عملتنا الرقمية</span>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start">
                <CheckCircle className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-white" />
                <span className="text-white">بدون رسوم تحويل</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-white" />
                <span className="text-white">سحب فوري تلقائي</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-white" />
                <span className="text-white">درجة عالية من الخصوصية</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-white" />
                <span className="text-white">بدون حد أدنى للسحب</span>
              </li>
            </ul>
          </div>
          <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-gray-400" />
                <h3 className="ml-2 text-xl font-semibold">الوسائل المحلية</h3>
              </div>
              <span className="text-sm text-gray-500">
                جنيه مصري, ريال, إلخ
              </span>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start">
                <CheckCircle className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  رسوم تحويل منخفضة
                </span>
              </li>
              <li className="flex items-start">
                <X className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-red-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  يتم مراجعتها يدويا
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  خصوصية متوسطة
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  حد أدنى منخفض
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WhyChooseUsSection() {
  return (
    <div id="about" className="bg-gray-50 py-24 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="mb-16 text-center text-3xl font-bold md:text-4xl">
          محفظتك دائما معك
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="from-primary-50 to-accent-50 rounded-xl bg-linear-to-br p-6 transition-shadow hover:shadow-xl dark:from-gray-800 dark:to-gray-800">
            <div className="mb-4 flex items-center">
              <div className="bg-primary-100 dark:bg-primary-900 rounded-lg p-2">
                <Discord className="text-primary-600 dark:text-primary-400 h-6 w-6" />
              </div>
              <h3 className="ml-3 text-xl font-semibold">بوت الديسكورد</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              تحكم بمحفظتك بسهولة عبر بوت الديسكورد. نفذ المعاملات وتابع رصيدك
              مباشرة من خوادمك. استفد من إشعارات فورية وآمنة.
            </p>
          </div>
          <div className="from-primary-50 to-accent-50 rounded-xl bg-linear-to-br p-6 transition-shadow hover:shadow-xl dark:from-gray-800 dark:to-gray-800">
            <div className="mb-4 flex items-center">
              <div className="bg-primary-100 dark:bg-primary-900 rounded-lg p-2">
                <Telegram className="text-primary-600 dark:text-primary-400 h-6 w-6" />
              </div>
              <h3 className="ml-3 text-xl font-semibold">بوت التيليجرام</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              أدر محفظتك بسرعة عبر بوت التيليجرام. قم بإجراء المعاملات واستقبال
              الإشعارات الفورية. كل ذلك بسهولة وأمان تام.
            </p>
          </div>
          <div className="from-primary-50 to-accent-50 rounded-xl bg-linear-to-br p-6 transition-shadow hover:shadow-xl dark:from-gray-800 dark:to-gray-800">
            <div className="mb-4 flex items-center">
              <div className="bg-primary-100 dark:bg-primary-900 rounded-lg p-2">
                <Puzzle className="text-primary-600 dark:text-primary-400 h-6 w-6" />
              </div>
              <h3 className="ml-3 text-xl font-semibold">إضافة المتصفح</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              وصول سريع لمحفظتك من أي موقع إلكتروني. إدارة المعاملات بسهولة عبر
              إضافة المتصفح. مع حماية متقدمة وأداء موثوق.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PricingSection() {
  return (
    <div id="pricing" className="relative overflow-hidden py-24">
      {/* Background Elements */}
      <div className="via-primary-50/30 dark:via-primary-900/10 absolute inset-0 bg-linear-to-b from-gray-50 to-gray-50 dark:from-gray-900 dark:to-gray-900" />
      <div className="absolute inset-0">
        <div className="bg-primary-500/10 animate-pulse-slow absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-accent-500/10 animate-pulse-slow absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full blur-3xl delay-1000" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="bg-primary-100 dark:bg-primary-900/50 mb-4 inline-flex items-center justify-center rounded-2xl p-2">
            <Sparkles className="text-primary-600 dark:text-primary-400 mr-2 h-5 w-5" />
            <span className="text-primary-600 dark:text-primary-400 text-sm font-medium">
              إختر خطتك, عزز تجربتك
            </span>
          </div>
          <h2 className="via-primary-600 dark:via-primary-400 mb-4 bg-linear-to-r from-gray-900 to-gray-900 bg-clip-text text-4xl font-bold text-transparent md:text-5xl dark:from-white dark:to-white">
            إختر الخطة المناسبة لك
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            إبدا بالخطة المجانية، احصد الأرباح، وارتقِ بتجربتك مع الخطط
            المدفوعة.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          {/* Free Plan */}
          <div className="group relative">
            <div className="absolute inset-0 rounded-2xl bg-linear-to-b from-gray-100 to-white transition-transform duration-300 group-hover:scale-[1.02] dark:from-gray-800 dark:to-gray-900"></div>
            <div className="relative flex h-full flex-col rounded-2xl border border-gray-200/50 bg-white/90 p-8 shadow-lg backdrop-blur-xs dark:border-gray-700/50 dark:bg-gray-800/90">
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    مجانا
                  </h3>
                  <Shield className="h-6 w-6 text-gray-400" />
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    0
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">/شهر</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  خطة تناسب جميع المستخدمين الجدد
                </p>
              </div>

              <ul className="mb-8 grow space-y-4">
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                  مجانية بالكامل
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                  مميزات محدودة
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900/30">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <span className="text-gray-400">%رسوم المنصة 2</span>
                </li>
              </ul>

              <Link
                to="/dashboard"
                className="text-primary-600 bg-primary-50 hover:bg-primary-100 dark:text-primary-400 dark:bg-primary-900/50 dark:hover:bg-primary-900/80 block w-full rounded-xl px-6 py-3 text-center text-sm font-medium transition-all duration-200 hover:shadow-md">
                إبدا الآن مجانا
              </Link>
            </div>
          </div>

          {/* Plus Plan */}
          <div className="group relative md:-mt-4">
            <div className="from-primary-500 to-accent-500 absolute inset-0 rounded-2xl bg-linear-to-br opacity-100 blur-[2px] transition-all duration-300 group-hover:scale-[1.02] group-hover:blur-[3px]"></div>
            <div className="relative flex h-full flex-col rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
              <div className="absolute top-0 right-6 -translate-y-1/2">
                <div className="relative">
                  <div className="from-primary-500 to-accent-500 absolute inset-0 rounded-full bg-linear-to-r opacity-50 blur-sm"></div>
                  <div className="from-primary-500 to-accent-500 relative rounded-full bg-linear-to-r px-4 py-1">
                    <span className="text-xs font-medium text-white">
                      الأكثر تقدما
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    نخبة
                  </h3>
                  <Zap className="text-primary-500 h-6 w-6" />
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    50000
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">/شهر</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  الخطة المفضلة من المحترفين داخل المنصة
                </p>
              </div>

              <ul className="mb-8 grow space-y-4">
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="bg-primary-100 dark:bg-primary-900/30 mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    <Settings className="text-primary-500 h-4 w-4" />
                  </div>
                  مميزات متقدمة
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="bg-primary-100 dark:bg-primary-900/30 mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    <BadgePercent className="text-primary-500 h-4 w-4" />
                  </div>
                  بدون عمولات
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="bg-primary-100 dark:bg-primary-900/30 mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    <BarChart className="text-primary-500 h-4 w-4" />
                  </div>
                  سعة أكبر
                </li>
              </ul>

              <Link
                to="/explore/support/subscriptions"
                className="from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 hover:shadow-primary-500/20 block w-full rounded-xl bg-linear-to-r px-6 py-3 text-center text-sm font-medium text-white transition-all duration-200 hover:shadow-lg">
                إبدا رحلة النخبة
              </Link>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="group relative">
            <div className="absolute inset-0 rounded-2xl bg-linear-to-b from-gray-100 to-white transition-transform duration-300 group-hover:scale-[1.02] dark:from-gray-800 dark:to-gray-900"></div>
            <div className="relative flex h-full flex-col rounded-2xl border border-gray-200/50 bg-white/90 p-8 shadow-lg backdrop-blur-xs dark:border-gray-700/50 dark:bg-gray-800/90">
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    أساسي
                  </h3>
                  <Building2 className="h-6 w-6 text-gray-400" />
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    5000
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">/شهر</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  أفضل خطة للمبتدئين
                </p>
              </div>

              <ul className="mb-8 grow space-y-4">
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Scale className="h-4 w-4 text-blue-500" />
                  </div>
                  خيارات متوازنة
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Coins className="h-4 w-4 text-blue-500" />
                  </div>
                  رسوم منخفضة
                </li>
                <li className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Headset className="h-4 w-4 text-blue-500" />
                  </div>
                  مع مزايا إضافية
                </li>
              </ul>

              <a
                href={`mailto:${Config.CONTACT_EMAIL}?subject=Enterprise%20Inquiry`}
                className="text-primary-600 bg-primary-50 hover:bg-primary-100 dark:text-primary-400 dark:bg-primary-900/50 dark:hover:bg-primary-900/80 block w-full rounded-xl px-6 py-3 text-center text-sm font-medium transition-all duration-200 hover:shadow-md">
                تواصل معنا
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <div className="py-20 backdrop-blur-xs">
      <div className="container mx-auto px-4">
        <h2 className="mb-16 text-center text-3xl font-bold md:text-4xl">
          منصة كل التقنيين
        </h2>
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <div className="group relative rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
            <div className="bg-primary-500/10 absolute top-0 left-0 -z-10 h-24 w-24 rounded-br-3xl transition-transform group-hover:scale-110"></div>
            <div className="bg-accent-500/10 absolute right-0 bottom-0 -z-10 h-24 w-24 rounded-tl-3xl transition-transform group-hover:scale-110"></div>
            <MessageSquare className="text-primary-500 mb-4 h-8 w-8" />
            <p className="mb-6 text-gray-600 italic dark:text-gray-300">
              &quot;منصة رائعة تجمع بين البساطة والكفاءة. منذ انضمامي، أصبحت
              قادراً على إدارة مهامي اليومية بكل سهولة بفضل واجهتها البسيطة
              والخيارات المتعددة التي تقدمها. كما أن نظام المكافآت والمهام
              اليومية يحفزني على الاستمرار. أوصي بها بشدة لكل من يبحث عن تجربة
              سلسة ومربحة!&quot;
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  u/zampx
                </p>
              </div>
              <span className="bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-full px-2 py-1 text-center text-xs">
                المستخدمين العاديين
              </span>
            </div>
          </div>
          <div className="group relative rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
            <div className="bg-primary-500/10 absolute top-0 left-0 -z-10 h-24 w-24 rounded-br-3xl transition-transform group-hover:scale-110"></div>
            <div className="bg-accent-500/10 absolute right-0 bottom-0 -z-10 h-24 w-24 rounded-tl-3xl transition-transform group-hover:scale-110"></div>
            <MessageSquare className="text-primary-500 mb-4 h-8 w-8" />
            <p className="mb-6 text-gray-600 italic dark:text-gray-300">
              &quot;واجهة المستخدم السلسة وتجربة الاستخدام الممتازة جعلت عملي
              أكثر تنظيمًا. تمكنت من تتبع مشاريعي بكل دقة وفعالية، بالإضافة إلى
              سهولة التعاون مع الفريق. المنصة توفر أدوات متقدمة تناسب احتياجات
              أصحاب الأعمال وتوفر بيئة عمل مرنة وفعالة.&quot;
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  u/EXA
                </p>
              </div>
              <span className="bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-full px-2 py-1 text-center text-xs">
                أصحاب الأعمال
              </span>
            </div>
          </div>
          <div className="group relative rounded-xl bg-gray-50 p-8 transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
            <div className="bg-primary-500/10 absolute top-0 left-0 -z-10 h-24 w-24 rounded-br-3xl transition-transform group-hover:scale-110"></div>
            <div className="bg-accent-500/10 absolute right-0 bottom-0 -z-10 h-24 w-24 rounded-tl-3xl transition-transform group-hover:scale-110"></div>
            <MessageSquare className="text-primary-500 mb-4 h-8 w-8" />
            <p className="mb-6 text-gray-600 italic dark:text-gray-300">
              &quot;توفر المنصة مجموعة متنوعة من طرق الربح مثل المهام اليومية،
              والهدايا، مما يمنح المستخدمين فرصًا متعددة لزيادة أرباحهم بسهولة.
              أعجبتني بساطة التقديم على المهام وسرعة تلقي المكافآت، فهي بالفعل
              خيار مثالي لمن يبحث عن دخل إضافي بطريقة سهلة وآمنة.&quot;
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  u/Proffesor
                </p>
              </div>
              <span className="bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-full px-2 py-1 text-center text-xs">
                التقنيين
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-white py-12 dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <h3 className="mb-4 text-lg font-bold">{Config.APP_DOMAIN_NAME}</h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              صُممت بحب ❤️ لتقنيين العرب.
            </p>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="text-primary-500 mr-1.5 h-4 w-4" />
              صُنعت في مصر
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 3 2"
                className="ml-2 h-6 w-6">
                <rect width="3" height="2" fill="#ce1126" />
                <rect width="3" height="0.6667" y="0.6667" fill="#fff" />
                <rect width="3" height="0.6667" y="1.3333" fill="#000" />
                <g transform="translate(1.5,1)">
                  <path
                    fill="#c09300"
                    d="M0,-0.2l0.05,0.2l-0.05,0.2l-0.05,-0.2z"
                  />
                  <circle fill="#c09300" r="0.05" />
                </g>
              </svg>
            </div>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">الأقسام</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="#features"
                  className="hover:text-primary-600 text-gray-600 dark:text-gray-400">
                  الربح
                </Link>
              </li>
              <li>
                <Link
                  to="#comparison"
                  className="hover:text-primary-600 text-gray-600 dark:text-gray-400">
                  وسائل الدفع
                </Link>
              </li>
              <li>
                <Link
                  to="#pricing"
                  className="hover:text-primary-600 text-gray-600 dark:text-gray-400">
                  الإشتراكات
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">روابط مفيدة</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms"
                  className="hover:text-primary-600 text-gray-600 dark:text-gray-400">
                  الشروط والأحكام
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-primary-600 text-gray-600 dark:text-gray-400">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${Config.CONTACT_EMAIL}`}
                  className="hover:text-primary-600 text-gray-600 dark:text-gray-400">
                  البريد الإلكتروني
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">حساب المطور</h4>
            <div className="flex space-x-4">
              <a
                href="https://x.com/ExaTube"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-600 text-gray-600 dark:text-gray-400">
                <Twitter className="h-6 w-6" />
              </a>
              <a
                href="https://github.com/EXA-Hub"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-600 text-gray-600 dark:text-gray-400">
                <Github className="h-6 w-6" />
              </a>
              <a
                href={`mailto:${Config.CONTACT_EMAIL}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-600 text-gray-600 dark:text-gray-400">
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-gray-600 dark:border-gray-800 dark:text-gray-400">
          <p>
            © {new Date().getFullYear()}{' '}
            <a href="/" className="text-primary-600 underline">
              {Config.APP_DOMAIN_NAME}
            </a>
            . جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  const { theme } = useTheme();
  return (
    <div className="overscroll-none">
      <div className={theme}>
        <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="ltr">
            <Navbar />
            <HeroSection />
            <FeaturesSection />
            <ComparisonSection />
            <WhyChooseUsSection />
            <PricingSection />
            <Testimonials />
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
