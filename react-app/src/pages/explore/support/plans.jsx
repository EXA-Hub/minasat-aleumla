// react-app/src/pages/explore/support/plans.jsx
import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import CoinIcon from '@/components/ui/CoinIcon';
import api from '../../../utils/api';
import { useTheme } from '../../../context/ThemeContext';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const featureTranslations = {
  apps: 'التطبيقات',
  products: 'المنتجات',
  gifts: 'الهدايا',
  cheque: 'الشيكات',
  tasks: 'المهام',
  airdrop: 'الإيردروب',
  wallet: 'المحفظة',
  slots: 'الفتحات',
  maxCoins: 'الحد الأقصى للعملات',
  maxUsers: 'الحد الأقصى للمستخدمين',
  maxSend: 'الحد الأقصى للإرسال',
  fee: 'الرسوم',
  daily: 'يومي',
  limit: 'الحد',
  bonus: 'المكافأة',
};

const planTranslations = {
  free: 'مجاني',
  basic: 'أساسي',
  professional: 'محترف',
  elite: 'نخبة',
};

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

const SubscriptionDialog = ({ plan, plans, user, onClose, onSuccess }) => {
  const [action, setAction] = useState('subscribe');
  const [code, setCode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const calculateFee = () => {
    if (!user || action === 'subscribe') return 0;
    return plans[user.tier]?.features?.wallet?.fee || 0;
  };

  const calculateTotal = () => {
    const baseCost = plans[plan]?.coins || 0;
    const fee = calculateFee();
    return baseCost + (baseCost * fee) / 100;
  };

  const canAfford = () => {
    return (
      user?.balance >= calculateTotal() * (action === 'generate' ? quantity : 1)
    );
  };

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canAfford()) {
      setError('رصيدك غير كافي لإتمام العملية');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      switch (action) {
        case 'subscribe':
          await api.plans.subscribe(plan);
          break;
        case 'code':
          await api.plans.claim(code);
          break;
        case 'generate':
          await api.plans.generateCode(plan, quantity);
          break;
        case 'cancel':
          await api.plans.cancel();
          break;
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogContent className="sm:max-w-2xl" dir="rtl">
        <div className="flex justify-between items-center mb-4">
          <DialogTitle className="text-2xl">
            إدارة الاشتراك - {planTranslations[plan]}
          </DialogTitle>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-muted hover:bg-muted-foreground transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {action !== 'cancel' && action !== 'code' && (
          <div className="mb-6">
            <div className="bg-muted p-4 rounded-lg mb-4">
              <h4 className="font-bold mb-4 text-lg">تفاصيل الخطة</h4>
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between items-center border-b border-border/30 pb-2">
                  <span className="text-muted-foreground text-sm">
                    التكلفة الأساسية
                  </span>
                  <span className="font-bold">
                    <CoinIcon amount={plans[plan]?.coins} />
                  </span>
                </div>

                {user && (
                  <>
                    <div className="flex justify-between items-center border-b border-border/30 pb-2">
                      <span className="text-muted-foreground text-sm">
                        الرسوم ({calculateFee()}%)
                      </span>
                      <span className="font-bold">
                        <CoinIcon
                          amount={(plans[plan]?.coins * calculateFee()) / 100}
                        />
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-b border-border/30 pb-2">
                      <span className="text-muted-foreground text-sm">
                        رصيدك الحالي
                      </span>
                      <span className="font-bold">
                        <CoinIcon amount={user.balance} />
                      </span>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center pt-2">
                  <span className="text-muted-foreground text-sm">المجموع</span>
                  <span className="font-bold text-lg text-primary">
                    {calculateTotal()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAction('subscribe')}
              className={`p-3 rounded-lg font-semibold transition-colors ${
                action === 'subscribe'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}>
              اشتراك جديد
            </button>
            <button
              type="button"
              onClick={() => setAction('code')}
              className={`p-3 rounded-lg font-semibold transition-colors ${
                action === 'code'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}>
              استخدام كود
            </button>
            <button
              type="button"
              onClick={() => setAction('generate')}
              className={`p-3 rounded-lg font-semibold transition-colors ${
                action === 'generate'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}>
              إنشاء كود
            </button>
            <button
              type="button"
              onClick={() => setAction('cancel')}
              className={`p-3 rounded-lg font-semibold transition-colors ${
                action === 'cancel'
                  ? 'bg-red-600 text-foreground'
                  : 'bg-muted hover:bg-opacity-80'
              }`}>
              إلغاء الاشتراك
            </button>
          </div>

          {action === 'code' && (
            <div className="space-y-2">
              <Input
                placeholder="ادخل كود الاشتراك"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-lg p-6"
                required
              />
              <p className="text-sm text-muted-foreground">
                أدخل الكود الذي حصلت عليه لتفعيل الاشتراك
              </p>
            </div>
          )}

          {action === 'generate' && (
            <div className="space-y-2">
              <Input
                type="number"
                min="1"
                placeholder="عدد الأكواد"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="text-lg p-6"
                required
              />
              <p className="text-sm text-muted-foreground">
                سيتم تطبيق رسوم {calculateFee()}% على كل كود يتم إنشاؤه
              </p>
              <p className="text-sm text-muted-foreground">
                التكلفة الإجمالية: {calculateTotal() * quantity}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-900 text-foreground p-4 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !canAfford()}
            className={`w-full p-6 rounded-lg transition-all duration-300 font-bold text-lg disabled:opacity-50 ${
              action === 'cancel'
                ? 'bg-red text-foreground'
                : 'bg-primary text-primary-foreground hover:opacity-80'
            }`}>
            {loading ? 'جاري التنفيذ...' : 'تأكيد'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

SubscriptionDialog.propTypes = {
  plan: PropTypes.string.isRequired,
  plans: PropTypes.object.isRequired,
  user: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

const PlansPage = () => {
  const { theme } = useTheme();
  const { user } = useOutletContext();
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Add these state variables at the top of the component
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.plans.getAll();
        setPlans(response);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading)
    return (
      <div className="p-6 text-center text-foreground animate-pulse">
        جاري تحميل الخطط...
      </div>
    );
  if (error)
    return <div className="p-6 text-center text-red-500">خطأ: {error}</div>;
  if (!plans)
    return (
      <div className="p-6 text-center text-foreground">لا توجد خطط متاحة.</div>
    );

  // Update the handlePlanSelection function in plans.jsx
  const handlePlanSelection = (planName) => {
    setSelectedPlan(planName);
    setDialogOpen(true);
  };

  const planColors = {
    free: {
      light: '--secondary-50',
      dark: '--muted',
    },
    basic: {
      light: '--primary-30',
      dark: '--primary-35',
    },
    professional: {
      light: '--accent-10',
      dark: '--accent-5',
    },
    elite: {
      light: '--primary-50',
      dark: '--accent-50',
    },
  };

  const renderFeatureValue = (value, key) => {
    if (typeof value === 'number') {
      if (key === 'fee') return `${value}%`;
      return value;
    }
    if (typeof value === 'object') {
      return Object.entries(value).map(([subKey, val]) => (
        <div key={subKey} className="text-sm text-muted-foreground">
          {featureTranslations[subKey]}: {renderFeatureValue(val, subKey)}
        </div>
      ));
    }
    return value;
  };

  // Add the dialog component before the return statement
  const handleSubscriptionSuccess = () => {
    setDialogOpen(false);
    // Refresh user data
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      {dialogOpen && (
        <SubscriptionDialog
          plan={selectedPlan}
          plans={plans}
          user={user}
          onClose={() => setDialogOpen(false)}
          onSuccess={handleSubscriptionSuccess}
        />
      )}

      {user && (
        <div className="text-center animate-fadeIn">
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            خطتك الحالية: {planTranslations[user.tier]}
          </h2>
        </div>
      )}

      <h1 className="text-4xl font-bold mb-12 text-center text-foreground animate-fadeIn">
        اختر خطتك المناسبة
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(plans).map(([planName, planDetails], index) => (
          <Card
            key={planName}
            className="border-2 border-border transition-all duration-300 hover:scale-105 animate-slideUp"
            style={{
              animationDelay: `${index * 150}ms`,
              background:
                index === Object.entries(plans).length - 1
                  ? `linear-gradient(75deg, var(${theme === 'dark' ? planColors[planName].dark : planColors[planName].light}), var(--background))`
                  : index === 1
                    ? `linear-gradient(45deg, var(${planColors[planName].dark}), var(${planColors[planName].light}))`
                    : `var(${theme === 'dark' ? planColors[planName].dark : planColors[planName].light})`,
            }}>
            <CardHeader className="relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-foreground">
                  {planTranslations[planName]}
                </h2>
                <div className="flex items-center gap-2">
                  <CoinIcon amount={planDetails.coins} />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {Object.entries(planDetails.features).map(
                ([category, features]) => (
                  <div key={category} className="mb-6 last:mb-0">
                    <h3 className="font-semibold mb-3 text-lg text-foreground border-b border-border pb-2">
                      {featureTranslations[category]}
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(features).map(([feature, value]) => (
                        <div
                          key={feature}
                          className="flex justify-between items-start">
                          <span className="text-sm text-muted-foreground">
                            {featureTranslations[feature]}
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {renderFeatureValue(value, feature)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </CardContent>

            {index !== 0 ? (
              <CardFooter className="justify-center pt-4">
                <button
                  onClick={() => handlePlanSelection(planName)}
                  className="w-full px-6 py-3 rounded-full bg-primary text-primary-foreground opacity-70 hover:opacity-100 transition-all duration-300 hover:shadow-lg text-lg font-bold">
                  اختيار الخطة
                </button>
              </CardFooter>
            ) : (
              <CardFooter className="justify-center pt-4">
                <button
                  className="w-full px-6 py-3 bg-red-600 rounded-full text-foreground bg-opacity-10 hover:bg-opacity-100 transition-all duration-300 hover:shadow-lg text-lg font-bold"
                  onClick={async () => {
                    if (user.tier === 'free')
                      return toast.error('ليس لديك خطة أصلا');
                    // prompt to assure cancel subscription
                    const confirmCancel = window.confirm(
                      'هل تريد ان تلغي خطتك الحالية؟'
                    );
                    if (!confirmCancel) return;
                    // Cancel the subscription
                    try {
                      await api.plans.cancel();
                      toast.success('تم إلغاء الاشتراك بنجاح');
                    } catch (error) {
                      console.error(error);
                      toast.error(error.data?.error || 'حدث خطاء');
                    }
                  }}>
                  إلغاء الخطة
                </button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      <style>{`
        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default PlansPage;
