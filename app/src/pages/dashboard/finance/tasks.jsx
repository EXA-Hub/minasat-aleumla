// app/src/pages/dashboard/finance/tasks.jsx
import PropTypes from 'prop-types';
import Confetti from 'react-confetti';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import CoinIcon from '../../../components/ui/CoinIcon';
import { Button } from '../../../components/ui/button';
import api from '../../../utils/api';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '../../../components/ui/avatar';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '../../../components/ui/card';

export const LastClaimCountdown = ({ lastClaim }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!lastClaim) return;

    const lastClaimTime = new Date(parseInt(lastClaim)).getTime();
    const expirationTime = parseInt(lastClaimTime) + 24 * 60 * 60 * 1000;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const remainingTime = expirationTime - now;

      if (remainingTime > 0) {
        const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
        const seconds = Math.floor((remainingTime / 1000) % 60);
        setTimeLeft(`${hours}س ${minutes}د ${seconds}ث`);
      } else setTimeLeft('يمكنك الحصول على هديتك');
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [lastClaim]);

  return <>{timeLeft}</>;
};

LastClaimCountdown.propTypes = {
  lastClaim: PropTypes.string,
};

const copyToClipboard = (text, setCopied) => {
  navigator.clipboard.writeText(text);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};

export const TelegramDialog = ({ dialogData, setDialogData }) => {
  const [copied, setCopied] = useState(false);

  return (
    <DialogContent className="animate-fade-in scale-95">
      <DialogHeader>
        <DialogTitle className="text-center text-2xl font-bold text-gray-800 dark:text-gray-200">
          قناة التيليجرام 📢
        </DialogTitle>
      </DialogHeader>

      {dialogData.telegramData && (
        <div className="mt-6 space-y-6">
          {/* Channel Status */}
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <p className="mb-4 text-center text-lg font-medium text-gray-700 dark:text-gray-300">
              نحتاج 6000 مشترك في قناة التيليجرام لبدء توزيع الهدايا
            </p>
            {dialogData.telegramData.message && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                {dialogData.telegramData.message}
              </p>
            )}
            {/* Telegram Accounts */}
            {dialogData.telegramData.accounts?.map((account) => {
              // Determine border color and status label based on account.status
              const getStatusDetails = () => {
                switch (account.status) {
                  case 'member':
                    return {
                      borderColor: 'border-green-500',
                      label: 'مشترك',
                      textColor: 'text-green-500',
                    };
                  case 'administrator':
                    return {
                      borderColor: 'border-blue-500',
                      label: 'مدير',
                      textColor: 'text-blue-500',
                    };
                  case 'creator':
                    return {
                      borderColor: 'border-purple-500',
                      label: 'المالك',
                      textColor: 'text-purple-500',
                    };
                  case 'restricted':
                    return {
                      borderColor: 'border-yellow-500',
                      label: 'مقيد',
                      textColor: 'text-yellow-500',
                    };
                  case 'left':
                    return {
                      borderColor: 'border-gray-500',
                      label: 'غير مشترك',
                      textColor: 'text-gray-500',
                    };
                  case 'kicked':
                    return {
                      borderColor: 'border-red-700',
                      label: 'محظور',
                      textColor: 'text-red-700',
                    };
                  default:
                    return {
                      borderColor: 'border-gray-300',
                      label: 'غير معروف',
                      textColor: 'text-gray-500',
                    };
                }
              };

              const { borderColor, label, textColor } = getStatusDetails();

              return (
                <div
                  key={account.id}
                  className="mb-3 flex items-center justify-between rounded-md bg-white p-3 shadow-sm dark:bg-gray-600">
                  {/* Account Info */}
                  <div className="flex items-center gap-3">
                    {/* Avatar with Conditional Border */}
                    <Avatar className={`h-10 w-10 border ${borderColor}`}>
                      <AvatarImage src={account.avatar} alt={account.name} />
                      <AvatarFallback>{account.name[0] || 'ح'}</AvatarFallback>
                    </Avatar>
                    {/* Account Name */}
                    <span className="font-medium">
                      {account.name || 'حساب تيليجرام'}
                    </span>
                  </div>
                  {/* Subscription Status */}
                  <span className={`text-sm ${textColor} font-medium`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Invite Link Section */}
          {dialogData.telegramData.inviteLink && (
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-600">
              <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                رابط الدعوة (صالح لمدة 24 ساعة)
              </p>
              <div className="items-center gap-2 md:flex">
                <a
                  href={dialogData.telegramData.inviteLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group hover:border-primary dark:hover:border-primary mb-1 flex w-full items-center justify-between rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm transition duration-150 ease-in-out hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-800">
                  <span className="flex-grow truncate">
                    {dialogData.telegramData.inviteLink || 'لا يوجد رابط'}
                  </span>
                  <ExternalLink className="group-hover:text-primary h-5 w-5 text-gray-500 transition duration-150 ease-in-out" />
                </a>
                <Button
                  onClick={() =>
                    copyToClipboard(
                      dialogData.telegramData.inviteLink,
                      setCopied
                    )
                  }
                  className="bg-primary hover:bg-accent flex w-full items-center gap-2 rounded-md px-4 py-2 text-white md:w-auto">
                  {copied ? 'تم النسخ ✓' : 'نسخ'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      <CardFooter className="p-0">
        <div className="mt-6 flex w-full justify-center">
          <DialogTrigger
            className="rounded-md bg-gray-200 px-6 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            onClick={() => setDialogData({ open: false })}>
            إغلاق
          </DialogTrigger>
        </div>
      </CardFooter>
    </DialogContent>
  );
};

export const DiscordDialog = ({ dialogData, setDialogData }) => {
  const [copied, setCopied] = useState(false);

  return (
    <DialogContent className="animate-fade-in scale-95">
      <DialogHeader>
        <DialogTitle className="text-center text-2xl font-bold text-gray-800 dark:text-gray-200">
          سيرفر الديسكورد
        </DialogTitle>
      </DialogHeader>

      {dialogData.discordData && (
        <div className="mt-6 space-y-6">
          {/* Invite Link Section */}
          {dialogData.discordData.inviteLink && (
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-600">
              <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                رابط الدعوة (صالح لمدة 24 ساعة)
              </p>
              <div className="items-center gap-2 md:flex">
                <a
                  href={dialogData.discordData.inviteLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group hover:border-primary dark:hover:border-primary mb-1 flex w-full items-center justify-between rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm transition duration-150 ease-in-out hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-800">
                  <span className="flex-grow truncate">
                    {dialogData.discordData.inviteLink || 'لا يوجد رابط'}
                  </span>
                  <ExternalLink className="group-hover:text-primary h-5 w-5 text-gray-500 transition duration-150 ease-in-out" />
                </a>
                <Button
                  onClick={() =>
                    copyToClipboard(
                      dialogData.discordData.inviteLink,
                      setCopied
                    )
                  }
                  className="bg-primary hover:bg-accent flex w-full items-center gap-2 rounded-md px-4 py-2 text-white md:w-auto">
                  {copied ? 'تم النسخ ✓' : 'نسخ'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      <CardFooter className="p-0">
        <div className="mt-6 flex w-full justify-center">
          <DialogTrigger
            className="rounded-md bg-gray-200 px-6 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            onClick={() => setDialogData({ open: false })}>
            إغلاق
          </DialogTrigger>
        </div>
      </CardFooter>
    </DialogContent>
  );
};

TelegramDialog.propTypes = {
  dialogData: PropTypes.object.isRequired,
  setDialogData: PropTypes.func.isRequired,
};

DiscordDialog.propTypes = {
  dialogData: PropTypes.object.isRequired,
  setDialogData: PropTypes.func.isRequired,
};

const TasksPage = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const { width, height } = size;
  const [loading, setLoading] = useState(false);
  const [dialogData, setDialogData] = useState({
    open: false,
    message: 'تمت المهمة اليومية',
    daily: 100,
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const [dailyCode, id] = [
      searchParams.get('dailyCode'),
      searchParams.get('id'),
    ];
    navigate(window.location.pathname);
    const verifyDaily = async () => {
      setLoading(true);
      try {
        const { message, daily } = await api.tasks.verifyDaily({
          dailyCode,
          id,
        });
        setDialogData({ open: true, message, daily });
        localStorage.setItem('lastClaim:id=' + id, Date.now());
      } catch (error) {
        toast.error(error.data?.error || 'حدث خطأ ما');
      } finally {
        setLoading(false);
      }
    };
    if (dailyCode) verifyDaily();
    function handleResize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [navigate, searchParams]);

  const handleGetDaily = async (id) => {
    setLoading(true);
    try {
      const { dailyUrl } = await api.tasks.getDaily({
        host: window.location.href,
        id,
      });
      window.location.href = dailyUrl;
    } catch (error) {
      console.error(error);
      toast.error(error.data?.error || 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  const handleTelegram = async () => {
    setLoading(true);
    try {
      const telegramData = await api.tasks.telegram();
      setDialogData({
        open: true,
        message: 'نحتاج 6000 مشترك في قناة التيليجرام لبدء توزيع الهدايا',
        telegramData,
      });
    } catch (error) {
      console.error(error);
      toast.error(error.data?.error || 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscord = async () => {
    setLoading(true);
    try {
      const discordData = await api.tasks.discord();
      setDialogData({
        open: true,
        message: 'تحتاج أن تربط حسابك في ديسكورد من صفحة التطبيقات المتصلة',
        discordData,
      });
    } catch (error) {
      console.error(error);
      toast.error(error.data?.error || 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  const dailyTasks = [
    {
      id: 1,
      title: 'الهدية اليومية',
      description:
        'قم بزيارة موقعنا كل 24 ساعة لتخطى روابط الإعلانات والحصول على مكافأة عشوائية!',
      buttonLabel: 'الحصول على الهدية اليومية',
      loadingText: 'جاري التحميل...',
      deadline: 'يجب إتمام المهمة في خلال 15 دقيقة!',
      onClick: () => handleGetDaily(1),
      lastClaim: localStorage.getItem('lastClaim:id=1'),
    },
    // {
    //   id: 2,
    //   title: 'الهدية اليومية 2',
    //   description:
    //     'قم بزيارة موقعنا كل 24 ساعة لتخطى روابط الإعلانات والحصول على مكافأة عشوائية!',
    //   buttonLabel: 'الحصول على الهدية اليومية',
    //   loadingText: 'جاري التحميل...',
    //   deadline: 'يجب إتمام المهمة في خلال 15 دقيقة!',
    //   onClick: () => handleGetDaily(2),
    //   lastClaim: localStorage.getItem('lastClaim:id=2'),
    //   special: true,
    // },
    // {
    //   id: 3,
    //   title: 'الهدية اليومية 3',
    //   description:
    //     'قم بزيارة موقعنا كل 24 ساعة لتخطى روابط الإعلانات والحصول على مكافأة عشوائية!',
    //   buttonLabel: 'الحصول على الهدية اليومية',
    //   loadingText: 'جاري التحميل...',
    //   deadline: 'يجب إتمام المهمة في خلال 15 دقيقة!',
    //   onClick: () => handleGetDaily(3),
    //   lastClaim: localStorage.getItem('lastClaim:id=3'),
    // },
    {
      id: 4,
      title: 'الهدية اليومية 4',
      description:
        'قم بزيارة موقعنا كل 24 ساعة لتخطى روابط الإعلانات والحصول على مكافأة عشوائية!',
      buttonLabel: 'الحصول على الهدية اليومية',
      loadingText: 'جاري التحميل...',
      deadline: 'يجب إتمام المهمة في خلال 15 دقيقة!',
      onClick: () => handleGetDaily(4),
      lastClaim: localStorage.getItem('lastClaim:id=4'),
    },
    {
      id: 5,
      title: 'الهدية اليومية 5',
      description:
        'قم بزيارة موقعنا كل 24 ساعة لتخطى روابط الإعلانات والحصول على مكافأة عشوائية!',
      buttonLabel: 'الحصول على الهدية اليومية',
      loadingText: 'جاري التحميل...',
      deadline: 'يجب إتمام المهمة في خلال 15 دقيقة!',
      onClick: () => handleGetDaily(5),
      lastClaim: localStorage.getItem('lastClaim:id=5'),
    },
  ];

  const currentTasks = [
    {
      id: 1,
      title: 'مهمة قناة التيليجرام',
      description:
        'يتم توزيع هدايا عشوائية شبه يومية على المتفاعلين مع منشوراتنا عبر قناة تيليجرام.',
      buttonLabel: 'الحصول على رابط البوت',
      loadingText: 'جاري التحميل...',
      deadline: 'يجب الإنضمام لقناة تيليجرام عبر رابط البوت!',
      onClick: () => handleTelegram(),
    },
    {
      id: 2,
      title: 'مهمة سيرفر الديسكورد',
      description:
        'يتم توزيع هدايا عشوائية شبه يومية على المتفاعلين داخل سيرفر الديسكورد.',
      buttonLabel: 'الحصول على رابط البوت',
      loadingText: 'جاري التحميل...',
      deadline: 'يجب توثيق حسابك عبر البوت!',
      onClick: () => handleDiscord(),
    },
  ];

  return (
    <div className={dialogData.open ? '' : 'space-y-6 p-6'}>
      {dialogData.open && (
        <Dialog>
          {dialogData.telegramData ? (
            <TelegramDialog
              dialogData={dialogData}
              setDialogData={setDialogData}
            />
          ) : dialogData.discordData ? (
            <DiscordDialog
              dialogData={dialogData}
              setDialogData={setDialogData}
            />
          ) : (
            <>
              <Confetti width={width} height={height} />
              <DialogContent className="animate-fade-in scale-95 rounded-lg border border-gray-300 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-center text-2xl font-bold text-gray-800 dark:text-gray-200">
                    🎁 مبروك لقد حصلت على هديتك
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4 text-center text-gray-700 dark:text-gray-300">
                  <p className="text-lg">{dialogData.message}</p>
                  <div className="mt-3 flex items-center justify-center gap-2 space-x-2">
                    <CoinIcon amount={dialogData.daily} />
                  </div>
                </div>
                <div className="mt-6 flex justify-center">
                  <DialogTrigger
                    className="focus:ring-primary-light bg-primary hover:bg-primary rounded-md px-6 py-2 text-white shadow-lg focus:ring-3 focus:outline-hidden"
                    onClick={() => setDialogData({ open: false })}>
                    إغلاق
                  </DialogTrigger>
                </div>
              </DialogContent>
            </>
          )}
        </Dialog>
      )}

      <div className="space-y-8">
        {/* Daily Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold sm:text-xl">المهام اليومية</h2>
            <Link
              to="/docs?q=tasks"
              className="text-primary border-primary hover:bg-35primary rounded-md border px-3 py-1 text-sm font-medium transition">
              الشرح
            </Link>
          </div>
          {dailyTasks.map((task) => (
            <Card
              key={task.id}
              className={`animate-slide-up ${
                task.special
                  ? 'border-primary bg-20primary border-2 shadow-lg'
                  : ''
              }`}>
              <CardHeader>
                <CardTitle className="flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
                  <div className="flex flex-col">
                    <h3 className="text-xl font-semibold sm:text-lg">
                      {task.title}
                    </h3>
                    <p className="text-gray-500">{task.description}</p>
                  </div>

                  <Button
                    onClick={() => task.onClick()}
                    disabled={loading}
                    className="bg-primary hover:bg-accent w-full rounded-md px-4 py-2 text-white disabled:opacity-50 sm:w-auto">
                    {loading ? task.loadingText : task.buttonLabel}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                {/* Special Task Badge */}
                {task.special && (
                  <span className="rounded-md bg-red-500 px-3 py-1 text-sm font-bold text-white shadow sm:text-xs">
                    🎉 2x الهدية! 🎉
                  </span>
                )}

                {/* Last Claim Countdown */}
                {task.lastClaim && (
                  <p className="text-foreground flex items-center gap-2 text-sm sm:order-2 sm:text-xs">
                    <span className="text-secondary-foreground font-semibold">
                      وقت هديتك:
                    </span>
                    <LastClaimCountdown lastClaim={task.lastClaim} />
                  </p>
                )}

                {/* Deadline */}
                <div className="text-sm text-red-500 sm:order-3 sm:text-xs">
                  <p className="m-0">{task.deadline}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold sm:text-xl">المهام الحالية</h2>
          </div>
          {currentTasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <CardTitle className="flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
                  <div className="flex flex-col">
                    <h3 className="text-xl font-semibold sm:text-lg">
                      {task.title}
                    </h3>
                    <p className="text-gray-500">{task.description}</p>
                  </div>
                  <Button
                    onClick={() => task.onClick()}
                    disabled={loading}
                    className="bg-primary hover:bg-accent w-full rounded-md px-4 py-2 text-white disabled:opacity-50 sm:w-auto">
                    {loading ? task.loadingText : task.buttonLabel}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-2 text-sm text-red-500 sm:text-xs">
                  <p>{task.deadline}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
