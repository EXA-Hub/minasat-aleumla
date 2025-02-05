// react-app/src/pages/explore/support/plans.jsx
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { useTheme } from '../../../context/ThemeContext';
import CoinIcon from '@/components/ui/CoinIcon';
import api from '../../../utils/api';

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

  const canAfford = () =>
    user?.balance >= calculateTotal() * (action === 'generate' ? quantity : 1);

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
          navigate('/explore/support/codes');
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
        <div className="mb-4 flex items-center justify-between">
          <DialogTitle className="text-2xl">
            إدارة الاشتراك - {planTranslations[plan]}
          </DialogTitle>
          <button
            onClick={onClose}
            className="bg-muted hover:bg-muted-foreground rounded-full p-2 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {action !== 'cancel' && action !== 'code' && (
          <div className="mb-6">
            <div className="bg-muted mb-4 rounded-lg p-4">
              <h4 className="mb-4 text-lg font-bold">تفاصيل الخطة</h4>
              <div className="flex flex-col space-y-3">
                <div className="border-30border flex items-center justify-between border-b pb-2">
                  <span className="text-muted-foreground text-sm">
                    التكلفة الأساسية
                  </span>
                  <span className="font-bold">
                    <CoinIcon amount={plans[plan]?.coins} />
                  </span>
                </div>

                {user && (
                  <>
                    <div className="border-30border flex items-center justify-between border-b pb-2">
                      <span className="text-muted-foreground text-sm">
                        الرسوم ({calculateFee()}%)
                      </span>
                      <span className="font-bold">
                        <CoinIcon
                          amount={(plans[plan]?.coins * calculateFee()) / 100}
                        />
                      </span>
                    </div>

                    <div className="border-30border flex items-center justify-between border-b pb-2">
                      <span className="text-muted-foreground text-sm">
                        رصيدك الحالي
                      </span>
                      <span className="font-bold">
                        <CoinIcon amount={user.balance} />
                      </span>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-muted-foreground text-sm">المجموع</span>
                  <span className="text-primary text-lg font-bold">
                    {calculateTotal()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'subscribe', label: 'اشتراك جديد' },
              { key: 'code', label: 'استخدام كود' },
              { key: 'generate', label: 'إنشاء كود' },
              { key: 'cancel', label: 'إلغاء الاشتراك', danger: true },
            ].map(({ key, label, danger }) => (
              <button
                key={key}
                type="button"
                onClick={() => setAction(key)}
                className={`rounded-lg p-3 font-semibold transition-colors ${
                  action === key
                    ? danger
                      ? 'text-foreground bg-red-600'
                      : 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-80muted'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {action === 'code' && (
            <div className="flex flex-col gap-y-2">
              <Input
                placeholder="ادخل كود الاشتراك"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="p-6 text-lg"
                required
              />
              <p className="text-muted-foreground text-sm">
                أدخل الكود الذي حصلت عليه لتفعيل الاشتراك
              </p>
            </div>
          )}

          {action === 'generate' && (
            <div className="flex flex-col gap-y-2">
              <Input
                type="number"
                min="1"
                placeholder="عدد الأكواد"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="p-6 text-lg"
                required
              />
              <p className="text-muted-foreground text-sm">
                سيتم تطبيق رسوم {calculateFee()}% على كل كود يتم إنشاؤه
              </p>
              <p className="text-muted-foreground text-sm">
                التكلفة الإجمالية: {calculateTotal() * quantity}
              </p>
            </div>
          )}

          {error && (
            <div className="text-foreground rounded-lg bg-red-900 p-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading || !['code', 'cancel'].includes(action) & !canAfford()
            }
            className={`w-full rounded-lg p-6 text-lg font-bold transition-all duration-300 hover:opacity-80 disabled:opacity-50 ${
              action === 'cancel'
                ? 'text-foreground'
                : 'bg-primary text-primary-foreground'
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
      <div className="text-foreground animate-pulse p-6 text-center">
        جاري تحميل الخطط...
      </div>
    );
  if (error)
    return <div className="p-6 text-center text-red-500">خطأ: {error}</div>;
  if (!plans)
    return (
      <div className="text-foreground p-6 text-center">لا توجد خطط متاحة.</div>
    );

  // Update the handlePlanSelection function in plans.jsx
  const handlePlanSelection = (planName) => {
    setSelectedPlan(planName);
    setDialogOpen(true);
  };

  const planStyle = {
    free: {
      light: 'bg-black/10', // Light background for free plan
      dark: 'bg-white/10', // Dark background for free plan
    },
    basic: {
      light: 'bg-30primary border-foreground', // Light background for basic plan
      dark: 'bg-30primary border-foreground', // Dark background for basic plan
    },
    professional: {
      light: 'bg-linear-to-tl from-70primary to-background', // Light gradient for professional plan
      dark: 'bg-linear-to-br from-30primary to-background', // Dark gradient for professional plan
    },
    elite: {
      light: 'animate-moving-gradient',
      dark: 'animate-moving-gradient',
    },
  };

  const renderFeatureValue = (value, key) => {
    if (typeof value === 'number')
      if (key === 'fee') return `${value}%`;
      else return value;

    if (typeof value === 'object')
      return Object.entries(value).map(([subKey, val]) => (
        <div key={subKey} className="text-muted-foreground text-sm">
          {featureTranslations[subKey]}: {renderFeatureValue(val, subKey)}
        </div>
      ));

    return value;
  };

  // Add the dialog component before the return statement
  const handleSubscriptionSuccess = () => {
    setDialogOpen(false);
    // Refresh user data
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-7xl p-6" dir="rtl">
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
        <div className="animate-fadeIn text-center">
          <h2 className="text-foreground mb-4 text-2xl font-bold">
            خطتك الحالية: {planTranslations[user.tier]}
          </h2>
        </div>
      )}

      <h1 className="animate-fadeIn text-foreground mb-12 text-center text-4xl font-bold">
        اختر خطتك المناسبة
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(plans).map(([planName, planDetails], index) => (
          <Card
            key={planName}
            className={
              'animate-slideUp border-border border-2 transition-all duration-300 hover:scale-95 ' +
              planStyle[planName][theme]
            }
            style={{
              animationDelay: `${index * 150}ms`,
            }}>
            <CardHeader className="relative">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-foreground text-2xl font-bold">
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
                    <h3 className="border-border text-foreground mb-3 border-b pb-2 text-lg font-semibold">
                      {featureTranslations[category]}
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(features).map(([feature, value]) => (
                        <div
                          key={feature}
                          className="flex items-start justify-between">
                          <span className="text-muted-foreground text-sm">
                            {featureTranslations[feature]}
                          </span>
                          <span className="text-foreground text-sm font-medium">
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
                  className="bg-40primary text-foreground hover:bg-primary w-full rounded-full px-6 py-3 text-lg font-bold transition-all duration-300 hover:shadow-lg">
                  اختيار الخطة
                </button>
              </CardFooter>
            ) : (
              <CardFooter className="justify-center pt-4">
                <button
                  className="text-foreground w-full rounded-full bg-red-600/10 px-6 py-3 text-lg font-bold transition-all duration-300 hover:bg-red-600 hover:shadow-lg"
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

      <style>
        {`
    /* Consolidated styles for elite plan card */
    .animate-moving-gradient {
      position: relative;
      overflow: hidden;
      border: 2px solid white;
      box-shadow: 0 0 20px 5px var(--neon-color); /* Neon glow effect */
      border-radius: 12px; /* Match card border radius */
      background-color: rgba(255, 255, 255, 0.9); /* White with 90% opacity for light theme */
    }

    /* Dark theme adjustments */
    .dark .animate-moving-gradient {
      background-color: rgba(0, 0, 0, 0.9); /* Black with 90% opacity for dark theme */
    }

    /* Neon color for light and dark themes */
    :root {
      --neon-color: rgba(79, 70, 229, 0.7); /* Indigo neon for light theme */
    }

    .dark {
      --neon-color: rgba(147, 51, 234, 0.7); /* Purple neon for dark theme */
    }

    /* Gradient animation background */
    .animate-moving-gradient::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        rgba(147, 51, 234, 0.4),
        rgba(79, 70, 229, 0.4),
        rgba(51, 100, 234, 0.4),
        rgba(147, 51, 234, 0.4),
        rgba(79, 70, 229, 0.4),
        rgba(51, 100, 234, 0.4),
        rgba(147, 51, 234, 0.4)
      );
      background-size: 200% 100%;
      animation: moving-gradient 3s linear infinite;
      z-index: -1; /* Place behind card content */
    }

    /* Keyframes for gradient animation */
    @keyframes moving-gradient {
      0% {
        background-position: 0 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `}
      </style>

      <style>{`
/* Animation */
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
