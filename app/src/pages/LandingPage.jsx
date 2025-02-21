// app/src/pages/LandingPage.jsx

import { useNavigate } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useState, useEffect, Suspense } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
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
import './LandingPage.css';

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
  const controls = useAnimation();
  const [ref, inView] = useInView();
  const { theme } = useTheme();

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
      className={`gradient-background min-h-screen transition-colors duration-1000 ${theme === 'dark' ? 'dark' : 'light'}`}>
      {/* Animated background circles */}
      <div className="circle circle-1"></div>
      <div className="circle circle-2"></div>
      <div className="circle circle-3"></div>
      <div className="circle circle-4"></div>

      {/* SEO Meta Tags */}
      <HelmetProvider>
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
      </HelmetProvider>

      {/* Header */}
      <header className="relative z-30 bg-transparent p-4 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-foreground text-2xl font-bold">منصة العملة</h1>
          <AuthSection />
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 50 },
          }}
          className="mb-16 text-center">
          <h2 className="text-foreground mb-6 text-5xl font-bold">
            محفظتك الرقمية الموثوقة
          </h2>
          <p className="text-foreground/80 mb-8 text-xl">
            امتلك عملات المنصة، تداول بأمان، واكسب المزيد من خلال المهام
            والهدايا
          </p>
          <div className="flex flex-col justify-center gap-4 md:flex-row">
            {!user && (
              <Button
                size="lg"
                className="bg-primary/90 hover:bg-primary backdrop-blur-sm"
                onClick={() => navigate('/login')}>
                احصل على محفظتك المجانية
                <Gift className="mr-2 h-5 w-5" />
              </Button>
            )}
            {user && (
              <Button
                size="lg"
                className="bg-primary/90 hover:bg-primary backdrop-blur-sm"
                onClick={() => navigate('/dashboard')}>
                الذهاب إلى محفظتي
                <Wallet className="mr-2 h-5 w-5" />
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/explore')}
              className="bg-background/20 hover:bg-background/30 border-border/20 backdrop-blur-sm">
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
          <Card className="bg-card/30 border-border/20 hover:bg-card/50 p-6 text-center backdrop-blur-md transition-all hover:shadow-lg">
            <Wallet className="text-primary mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-xl font-bold">محفظة رقمية</h3>
            <p className="text-foreground/80">
              احصل على محفظة مجانية فور التسجيل مع رصيد ترحيبي
            </p>
          </Card>

          <Card className="bg-card/30 border-border/20 hover:bg-card/50 p-6 text-center backdrop-blur-md transition-all hover:shadow-lg">
            <ShoppingBag className="text-primary mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-xl font-bold">بيع واشتري</h3>
            <p className="text-foreground/80">
              تداول المنتجات والخدمات باستخدام عملات المنصة
            </p>
          </Card>

          <Card className="bg-card/30 border-border/20 hover:bg-card/50 p-6 text-center backdrop-blur-md transition-all hover:shadow-lg">
            <Trophy className="text-primary mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-xl font-bold">مهام وهدايا</h3>
            <p className="text-foreground/80">
              اكسب المزيد من العملات من خلال إكمال المهام
            </p>
          </Card>

          <Card className="bg-card/30 border-border/20 hover:bg-card/50 p-6 text-center backdrop-blur-md transition-all hover:shadow-lg">
            <CreditCard className="text-primary mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-xl font-bold">تحويل للنقود</h3>
            <p className="text-foreground/80">
              حول عملاتك إلى أموال حقيقية عند تجاوز الحد الأدنى
            </p>
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
            <Card className="bg-card/30 border-border/20 hover:bg-card/50 p-6 text-center backdrop-blur-md transition-all hover:shadow-lg">
              <div className="text-primary mb-4 text-3xl font-bold">1</div>
              <h3 className="mb-2 text-xl font-bold">سجل حساب جديد</h3>
              <p className="text-foreground/80">
                احصل على محفظتك المجانية ورصيد ترحيبي فور التسجيل
              </p>
            </Card>

            <Card className="bg-card/30 border-border/20 hover:bg-card/50 p-6 text-center backdrop-blur-md transition-all hover:shadow-lg">
              <div className="text-primary mb-4 text-3xl font-bold">2</div>
              <h3 className="mb-2 text-xl font-bold">اكسب العملات</h3>
              <p className="text-foreground/80">
                أكمل المهام اليومية واحصل على الهدايا لزيادة رصيدك
              </p>
            </Card>

            <Card className="bg-card/30 border-border/20 hover:bg-card/50 p-6 text-center backdrop-blur-md transition-all hover:shadow-lg">
              <div className="text-primary mb-4 text-3xl font-bold">3</div>
              <h3 className="mb-2 text-xl font-bold">تداول أو اسحب</h3>
              <p className="text-foreground/80">
                استخدم عملاتك للتداول أو حولها إلى أموال حقيقية
              </p>
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
          className="bg-primary/40 border-primary/30 hover:bg-primary/50 mb-16 rounded-lg border p-8 text-center backdrop-blur-md transition-all">
          <Globe className="mx-auto mb-4 h-16 w-16 text-white" />
          <h3 className="mb-4 text-2xl font-bold text-white">اكتشف المزيد</h3>
          <p className="mb-6 text-white/90">
            استكشف المستخدمين، المنتجات، والأكثر نشاطاً على المنصة
          </p>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/explore')}
            className="border-white/30 bg-white/10 text-white hover:bg-white/20">
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
            className="bg-accent/40 border-accent/30 hover:bg-accent/50 rounded-lg border p-8 text-center backdrop-blur-md transition-all">
            <DollarSign className="mx-auto mb-4 h-16 w-16 text-white" />
            <h3 className="mb-4 text-2xl font-bold text-white">
              ابدأ الآن مجاناً
            </h3>
            <p className="mb-6 text-white/90">
              احصل على محفظتك الرقمية وابدأ في كسب العملات
            </p>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              إنشاء حساب
              <ArrowLeftCircle className="mr-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-16 bg-transparent py-8 backdrop-blur-sm">
        <div className="text-foreground/70 container mx-auto px-4 text-center">
          <p>جميع الحقوق محفوظة © {new Date().getFullYear()} منصة العملة</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
