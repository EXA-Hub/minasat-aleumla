// app/src/pages/LandingPage.jsx
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useState, useEffect, Suspense } from 'react';
import {
  ArrowLeftCircle,
  Wallet,
  Gift,
  ShoppingBag,
  CreditCard,
  Moon,
  Sun,
  Trophy,
  DollarSign,
  Globe,
} from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import User from '../components/ui/user';
import api from '../utils/api';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-full"
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
  const controls = useAnimation();
  const [ref, inView] = useInView();

  // Dynamic website URL
  const { origin } = window.location;

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

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
    if (user)
      return (
        <Suspense fallback={<div>جاري التحميل...</div>}>
          <User
            user={user}
            handleLogout={handleLogout}
            ThemeToggle={ThemeToggle}
          />
        </Suspense>
      );

    return (
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button variant="outline" onClick={() => navigate('/login')}>
          تسجيل الدخول
        </Button>
      </div>
    );
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-background transition-colors duration-300">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>منصة العملة - نظام متكامل للمحافظ الرقمية والتداول</title>
        <meta
          name="description"
          content="انضم إلى منصة العملة لإدارة محفظتك الرقمية، تداول العملات، وكسب المكافآت من خلال إنجاز المهام. حوّل عملاتك إلى أموال حقيقية عند تجاوز الحد الأدنى."
        />
        <meta
          name="keywords"
          content="منصة العملة, محفظة رقمية, تداول عملات, مهام, هدايا, تحويل عملات, أموال حقيقية"
        />
        <meta
          property="og:title"
          content="منصة العملة - نظام متكامل للمحافظ الرقمية والتداول"
        />
        <meta
          property="og:description"
          content="انضم إلى منصة العملة لإدارة محفظتك الرقمية، تداول العملات، وكسب المكافآت من خلال إنجاز المهام. حوّل عملاتك إلى أموال حقيقية عند تجاوز الحد الأدنى."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={origin} />
        <meta property="og:image" content={`${origin}/og-image.png`} />
        <meta property="og:locale" content="ar_AR" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="منصة العملة - نظام متكامل للمحافظ الرقمية والتداول"
        />
        <meta
          name="twitter:description"
          content="انضم إلى منصة العملة لإدارة محفظتك الرقمية، تداول العملات، وكسب المكافآت من خلال إنجاز المهام. حوّل عملاتك إلى أموال حقيقية عند تجاوز الحد الأدنى."
        />
        <meta name="twitter:image" content={`${origin}/twitter-image.png`} />
        <meta name="twitter:site" content="@yourtwitterhandle" />
        <meta name="twitter:creator" content="@yourtwitterhandle" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "منصة العملة",
              "url": "${origin}",
              "description": "منصة العملة هو نظام متكامل يقدم محافظ رقمية، تداول عملات، مهام، هدايا، وتحويل عملات إلى أموال حقيقية.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "${origin}/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          `}
        </script>
      </Helmet>

      {/* Header */}
      <header className="bg-background p-4 shadow-xs">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">منصة العملة</h1>
          <AuthSection />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 50 },
          }}
          className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold text-foreground">
            محفظتك الرقمية الموثوقة
          </h2>
          <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
            امتلك عملات المنصة، تداول بأمان، واكسب المزيد من خلال المهام
            والهدايا
          </p>
          <div className="flex flex-col justify-center gap-4 md:flex-row">
            {!user && (
              <Button
                size="lg"
                className="bg-primary hover:bg-primary"
                onClick={() => navigate('/login')}>
                احصل على محفظتك المجانية
                <Gift className="mr-2 h-5 w-5" />
              </Button>
            )}
            {user && (
              <Button
                size="lg"
                className="bg-primary hover:bg-primary"
                onClick={() => navigate('/dashboard')}>
                الذهاب إلى محفظتي
                <Wallet className="mr-2 h-5 w-5" />
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/explore')}>
              اكتشف المزيد
              <Globe className="mr-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 50 },
          }}
          className="mb-16 grid gap-8 md:grid-cols-4">
          <Card className="bg-background p-6 text-center">
            <Wallet className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 text-xl font-bold">محفظة رقمية</h3>
            <p>احصل على محفظة مجانية فور التسجيل مع رصيد ترحيبي</p>
          </Card>

          <Card className="bg-background p-6 text-center">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 text-xl font-bold">بيع واشتري</h3>
            <p>تداول المنتجات والخدمات باستخدام عملات المنصة</p>
          </Card>

          <Card className="bg-background p-6 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 text-xl font-bold">مهام وهدايا</h3>
            <p>اكسب المزيد من العملات من خلال إكمال المهام</p>
          </Card>

          <Card className="bg-background p-6 text-center">
            <CreditCard className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 text-xl font-bold">تحويل للنقود</h3>
            <p>حول عملاتك إلى أموال حقيقية عند تجاوز الحد الأدنى</p>
          </Card>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 50 },
          }}
          className="mb-16">
          <h2 className="mb-8 text-center text-3xl font-bold">كيف تبدأ؟</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="bg-background p-6 text-center">
              <div className="mb-4 text-3xl font-bold text-primary">1</div>
              <h3 className="mb-2 text-xl font-bold">سجل حساب جديد</h3>
              <p>احصل على محفظتك المجانية ورصيد ترحيبي فور التسجيل</p>
            </Card>

            <Card className="bg-background p-6 text-center">
              <div className="mb-4 text-3xl font-bold text-primary">2</div>
              <h3 className="mb-2 text-xl font-bold">اكسب العملات</h3>
              <p>أكمل المهام اليومية واحصل على الهدايا لزيادة رصيدك</p>
            </Card>

            <Card className="bg-background p-6 text-center">
              <div className="mb-4 text-3xl font-bold text-primary">3</div>
              <h3 className="mb-2 text-xl font-bold">تداول أو اسحب</h3>
              <p>استخدم عملاتك للتداول أو حولها إلى أموال حقيقية</p>
            </Card>
          </div>
        </motion.div>

        {/* Explore Section */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 50 },
          }}
          className="mb-16 rounded-lg bg-primary p-8 text-center dark:bg-50primary">
          <Globe className="mx-auto mb-4 h-16 w-16 text-white" />
          <h3 className="mb-4 text-2xl font-bold">اكتشف المزيد</h3>
          <p className="mb-6">
            استكشف المستخدمين، المنتجات، والأكثر نشاطاً على المنصة
          </p>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/explore')}
            className="hover:bg-primary">
            اكتشف الآن
            <ArrowLeftCircle className="mr-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* CTA Section */}
        {!user && (
          <motion.div
            initial="hidden"
            animate={controls}
            variants={{
              visible: { opacity: 1, y: 0 },
              hidden: { opacity: 0, y: 50 },
            }}
            className="rounded-lg bg-primary p-8 text-center dark:bg-50primary">
            <DollarSign className="mx-auto mb-4 h-16 w-16 text-white" />
            <h3 className="mb-4 text-2xl font-bold">ابدأ الآن مجاناً</h3>
            <p className="mb-6">احصل على محفظتك الرقمية وابدأ في كسب العملات</p>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="hover:bg-primary">
              إنشاء حساب
              <ArrowLeftCircle className="mr-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-gray-50 py-8 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-300">
          <p>جميع الحقوق محفوظة © {new Date().getFullYear()} منصة العملة</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
