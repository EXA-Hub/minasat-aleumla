// app/src/pages/LandingPage.jsx
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, Suspense } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import {
  Wallet,
  Moon,
  Sun,
  Globe,
  Gift,
  Bitcoin,
  Chrome,
  Smartphone,
} from 'lucide-react';
import { Discord, Telegram, Paypal } from '../components/ui/CustomIcons';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import User from '../components/ui/user';
import api from '../utils/api';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="bg-background/20 hover:bg-background/30 h-9 w-9 rounded-full backdrop-blur-sm"
      aria-label="Toggle theme">
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const { origin } = window.location;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (localStorage.getItem('token')) {
          const userData = await api.auth.getMe();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const AuthSection = () => {
    if (loading) return null;
    return user ? (
      <Suspense fallback={<div>جاري التحميل...</div>}>
        <User
          user={user}
          handleLogout={handleLogout}
          ThemeToggle={ThemeToggle}
        />
      </Suspense>
    ) : (
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button
          variant="outline"
          onClick={() => navigate('/login')}
          className="bg-background/20 hover:bg-background/30 border-border/20 backdrop-blur-sm">
          تسجيل الدخول
        </Button>
      </div>
    );
  };

  return (
    <div
      dir="rtl"
      className={`relative min-h-screen transition-colors duration-700 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-black' : 'bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200'}`}>
      {/* Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="circle top-[-50px] left-[15%] bg-indigo-400"></div>
        <div className="circle right-[20%] bottom-[10%] bg-pink-400"></div>
        <div className="circle bottom-[30%] left-[5%] bg-cyan-400"></div>
        <div className="circle top-[20%] right-[10%] bg-purple-400"></div>
      </div>

      {/* SEO */}
      <HelmetProvider>
        <Helmet>
          <title>منصة العملة - نظام متكامل للمحافظ الرقمية والتداول</title>
          <meta
            name="description"
            content="منصة العملة لإدارة محفظتك الرقمية وتداول العملات بسهولة."
          />
          <meta property="og:title" content="منصة العملة" />
          <meta property="og:url" content={origin} />
        </Helmet>
      </HelmetProvider>

      {/* Header */}
      <header className="relative z-30 flex items-center justify-between bg-black/20 p-5 backdrop-blur-lg">
        <h1 className="text-3xl font-bold text-white">منصة العملة</h1>
        <AuthSection />
      </header>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-20 flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <motion.h1
          className="text-5xl font-extrabold text-white drop-shadow-lg md:text-6xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}>
          بوابتك للدخل أونلاين
        </motion.h1>

        <motion.p
          className="mt-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-xl text-transparent md:text-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}>
          كل طرق الربح من الإنترنت في مكان واحد
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col justify-center gap-4 md:flex-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}>
          {!user ? (
            <Button
              size="xl"
              className="rounded-full bg-purple-600 px-8 py-4 text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-xl"
              onClick={() => navigate('/login')}>
              ابدأ الآن مجانًا <Gift className="ml-2" />
            </Button>
          ) : (
            <Button
              size="xl"
              className="rounded-full bg-purple-600 px-8 py-4 text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-xl"
              onClick={() => navigate('/dashboard')}>
              الذهاب إلى المحفظة <Wallet className="ml-2" />
            </Button>
          )}

          <button
            className="relative rounded-full border border-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 p-[2px] transition-all hover:scale-105"
            onClick={() => navigate('/explore')}>
            <span className="flex items-center justify-center rounded-full bg-transparent text-white backdrop-blur-sm">
              اكتشف المميزات <Globe className="ml-2" />
            </span>
          </button>
        </motion.div>
      </motion.div>

      {/* Profit Methods */}
      <motion.div className="mx-4 my-8 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 py-16">
        <h2 className="text-center text-3xl font-bold text-white">
          ٦ طرق رئيسية لربح المال
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'مهام يومية وأسبوعية', desc: 'مكافآت تصل إلى $500' },
            { title: 'برنامج الإحالة', desc: '50% عمولة مدى الحياة' },
            { title: 'هدايا AirDrop', desc: 'هدايا عشوائية من المستخدمين' },
            { title: 'نصائح للمؤثرين', desc: 'دليل للستريمرز وصناع المحتوى' },
            { title: 'التجارة الحرة', desc: 'بيع المنتجات أو العمل كمستقل' },
            {
              title: 'برنامج المكافآت',
              desc: 'احصل على مكافآت مقابل المشاركة',
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="rounded-xl bg-white/10 p-6 text-white shadow-lg backdrop-blur-sm">
              <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
              <p>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Cashout Section */}
      <motion.div className="py-16 text-center">
        <h2 className="text-3xl font-bold text-white">سحب الأرباح بكل سهولة</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-8">
          {[
            { icon: Paypal, label: 'PayPal', color: 'text-blue-400' },
            { icon: Wallet, label: 'عملتنا الرقمية', color: 'text-purple-400' },
            { icon: Bitcoin, label: 'BTC/Tether', color: 'text-orange-400' },
          ].map(({ icon: Icon, label, color }, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.1 }}
              className={`rounded-xl bg-white/10 p-6 backdrop-blur-md ${color}`}>
              <Icon className="mx-auto h-12 w-12" />
              <h3 className="mt-4 text-lg font-bold">{label}</h3>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Apps Section */}
      <motion.div className="bg-primary/40 mb-16 rounded-xl p-8 text-center shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-white">
          محفظتك معك أينما كنت
        </h2>
        <p className="mb-6 text-white/80">
          تصفح محفظتك واكسب النقاط بسهولة عبر جميع الأجهزة
        </p>

        <div className="grid grid-cols-2 justify-center gap-6 sm:grid-cols-4">
          {[
            { icon: Discord, label: 'بوت Discord', color: 'text-indigo-400' },
            { icon: Telegram, label: 'بوت Telegram', color: 'text-blue-400' },
            { icon: Chrome, label: 'إضافة المتصفح', color: 'text-yellow-400' },
            {
              icon: Smartphone,
              label: 'تطبيق الجوال',
              color: 'text-green-400',
            },
          ].map(({ icon: Icon, label, color }, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.1, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              className={`rounded-lg bg-white/10 p-6 backdrop-blur-md transition-transform hover:bg-white/20 ${color}`}>
              <Icon className="mx-auto mb-3 h-10 w-10" />
              <p className="text-white">{label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="relative bg-black/40 py-8 text-center text-white">
        <div className="mb-4 flex justify-center gap-6">
          <a href="/terms" className="hover:underline">
            الشروط والأحكام
          </a>
          <a href="/privacy-policy" className="hover:underline">
            سياسة الخصوصية
          </a>
          <a href="/docs" className="hover:underline">
            الدليل الإرشادي
          </a>
        </div>
        <p className="text-sm">
          © {new Date().getFullYear()} جميع الحقوق محفوظة
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
