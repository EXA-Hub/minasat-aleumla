import { useNavigate } from 'react-router-dom';
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
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect, lazy, Suspense } from 'react';
import api from '../utils/api';
import { Helmet } from 'react-helmet';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const User = lazy(() => import('../components/ui/user'));

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="w-9 h-9 rounded-full"
      aria-label="Toggle theme"
    >
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
    if (inView) {
      controls.start('visible');
    }
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
      <div className="flex gap-4 items-center">
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
      className="min-h-screen bg-background transition-colors duration-300"
    >
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
      <header className="p-4 bg-background shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">منصة العملة</h1>
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
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            محفظتك الرقمية الموثوقة
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            امتلك عملات المنصة، تداول بأمان، واكسب المزيد من خلال المهام
            والهدايا
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            {!user && (
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/login')}
              >
                احصل على محفظتك المجانية
                <Gift className="mr-2 h-5 w-5" />
              </Button>
            )}
            {user && (
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate('/dashboard')}
              >
                الذهاب إلى محفظتي
                <Wallet className="mr-2 h-5 w-5" />
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/explore')}
            >
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
          className="grid md:grid-cols-4 gap-8 mb-16"
        >
          <Card className="p-6 text-center bg-background">
            <Wallet className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">محفظة رقمية</h3>
            <p>احصل على محفظة مجانية فور التسجيل مع رصيد ترحيبي</p>
          </Card>

          <Card className="p-6 text-center bg-background">
            <ShoppingBag className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">بيع واشتري</h3>
            <p>تداول المنتجات والخدمات باستخدام عملات المنصة</p>
          </Card>

          <Card className="p-6 text-center bg-background">
            <Trophy className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">مهام وهدايا</h3>
            <p>اكسب المزيد من العملات من خلال إكمال المهام</p>
          </Card>

          <Card className="p-6 text-center bg-background">
            <CreditCard className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">تحويل للنقود</h3>
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
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">كيف تبدأ؟</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center bg-background">
              <div className="text-3xl font-bold text-blue-600 mb-4">1</div>
              <h3 className="text-xl font-bold mb-2">سجل حساب جديد</h3>
              <p>احصل على محفظتك المجانية ورصيد ترحيبي فور التسجيل</p>
            </Card>

            <Card className="p-6 text-center bg-background">
              <div className="text-3xl font-bold text-blue-600 mb-4">2</div>
              <h3 className="text-xl font-bold mb-2">اكسب العملات</h3>
              <p>أكمل المهام اليومية واحصل على الهدايا لزيادة رصيدك</p>
            </Card>

            <Card className="p-6 text-center bg-background">
              <div className="text-3xl font-bold text-blue-600 mb-4">3</div>
              <h3 className="text-xl font-bold mb-2">تداول أو اسحب</h3>
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
          className="text-center bg-blue-50 dark:bg-blue-950 rounded-lg p-8 mb-16"
        >
          <Globe className="mx-auto h-16 w-16 text-blue-600 mb-4" />
          <h3 className="text-2xl font-bold mb-4">اكتشف المزيد</h3>
          <p className="mb-6">
            استكشف المستخدمين، المنتجات، والأكثر نشاطاً على المنصة
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/explore')}
            className="hover:bg-blue-700"
          >
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
            className="text-center bg-blue-50 dark:bg-blue-950 rounded-lg p-8"
          >
            <DollarSign className="mx-auto h-16 w-16 text-blue-600 mb-4" />
            <h3 className="text-2xl font-bold mb-4">ابدأ الآن مجاناً</h3>
            <p className="mb-6">احصل على محفظتك الرقمية وابدأ في كسب العملات</p>
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="hover:bg-blue-700"
            >
              إنشاء حساب
              <ArrowLeftCircle className="mr-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-300">
          <p>جميع الحقوق محفوظة © {new Date().getFullYear()} منصة العملة</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
