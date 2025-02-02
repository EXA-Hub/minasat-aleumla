import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../../components/ui/card';
import CoinIcon from '../../../components/ui/CoinIcon';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../../utils/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import Confetti from 'react-confetti';

const TasksPage = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const { width, height } = size;
  const [dailyButton, setDailyButton] = useState(false);
  const [dialogData, setDialogData] = useState({
    open: false,
    message: 'تمت المهمة اليومية',
    daily: 100,
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const dailyCode = searchParams.get('dailyCode');
    navigate(window.location.pathname);
    if (dailyCode) {
      const verifyDaily = async () => {
        try {
          const { message, daily } = await api.tasks.verifyDaily(dailyCode);
          setDialogData({ open: true, message, daily });
        } catch (error) {
          toast.error(error.data?.error || 'حدث خطأ ما');
        }
      };
      verifyDaily();
    }
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

  const handleGetDaily = async () => {
    setDailyButton(true);
    try {
      const { dailyUrl } = await api.tasks.getDaily(window.location.href);
      window.location.href = dailyUrl;
    } catch (error) {
      toast.error(error.data?.error || 'حدث خطأ ما');
    }
  };

  return (
    <div className="space-y-6 p-6">
      {dialogData.open && (
        <Dialog>
          <Confetti width={width} height={height} />
          <DialogContent className="animate-fade-in scale-95 rounded-lg border border-gray-300 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-gray-800 dark:text-gray-200">
                🎁 مبروك لقد حصلت على هديتك
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 text-center text-gray-700 dark:text-gray-300">
              <p className="text-lg">{dialogData.message}</p>
              <div className="mt-3 flex items-center justify-center space-x-2">
                <CoinIcon amount={dialogData.daily} />
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <DialogTrigger
                className="focus:ring-primary-light rounded-md bg-primary px-6 py-2 text-white shadow-lg hover:bg-primary focus:outline-none focus:ring"
                onClick={() => setDialogData({ open: false })}>
                إغلاق
              </DialogTrigger>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Task Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">المهام اليومية</h2>
        </div>
        {/* Task Card - Daily Gift */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-xl font-semibold">الهدية اليومية</h3>
                <p className="text-sm text-gray-500">
                  قم بزيارة موقعنا يومياً لتخطى روابط الإعلانات والحصول على
                  مكافأة عشوائية!
                </p>
              </div>
              <button
                onClick={handleGetDaily}
                disabled={dailyButton}
                className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary disabled:opacity-50">
                {dailyButton ? 'جاري التحميل...' : 'الحصول على الهدية اليومية'}
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-sm text-red-500">
              <p>يجب إتمام المهمة في خلال 15 دقيقة!</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">المهام الحالية</h2>
        </div>
        {/* Task Card - Another Task */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-xl font-semibold">مهمة أخرى</h3>
                <p className="text-sm text-gray-500">وصف المهمة اليومية هنا.</p>
              </div>
              <button
                onClick={handleGetDaily}
                disabled={dailyButton}
                className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary disabled:opacity-50">
                {dailyButton ? 'جاري التحميل...' : 'الحصول على المهمة'}
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-sm text-red-500">
              <p>يجب إتمام المهمة في خلال 15 دقيقة!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TasksPage;
