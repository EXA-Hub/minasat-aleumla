// my-react-app/src/components/explore/layout/ExploreLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import api from '../../../utils/api';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';

const ExploreLayout = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

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
  }, [navigate]);

  const freeUsageTimeKey = 'freeUsageTime';
  const [timeout, seTimeout] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (!user) {
      const allowedTime = 60 * 60 * 1000; // 1 hour in milliseconds
      const freeUsageStart = localStorage.getItem(freeUsageTimeKey);
      const lastResetTimeKey = 'lastResetTime'; // Key to track the last reset time
      const currentTime = Date.now();

      // Get the last reset time from localStorage
      const lastResetTime = localStorage.getItem(lastResetTimeKey);

      // Check if the date has changed since the last reset
      const today = new Date().toDateString();
      const lastResetDate = lastResetTime
        ? new Date(parseInt(lastResetTime)).toDateString()
        : null;

      if (lastResetDate !== today) {
        // Reset the free usage time for a new day
        localStorage.setItem(freeUsageTimeKey, currentTime.toString());
        localStorage.setItem(lastResetTimeKey, currentTime.toString());
        setRemainingTime(allowedTime);
      } else {
        if (!freeUsageStart) {
          // If free usage time is not set, set it now
          localStorage.setItem(freeUsageTimeKey, currentTime.toString());
          setRemainingTime(allowedTime);
        } else {
          // Calculate the remaining time for the day
          const elapsedTime = currentTime - parseInt(freeUsageStart);
          const remaining =
            elapsedTime > allowedTime ? 60 * 1000 : allowedTime - elapsedTime;
          setRemainingTime(remaining);

          // Set a timeout to close the app after the remaining time
          setTimeout(() => {
            seTimeout(true);
          }, remaining);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user & !timeout) {
      const interval = setInterval(() => {
        if (remainingTime > 0) {
          setRemainingTime((prevTime) => prevTime - 1000); // Decrease by 1 second
        }
      }, 1000);

      return () => clearInterval(interval); // Cleanup the interval on unmount
    }
  }, [timeout, remainingTime, user]);

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="w-full">
        <Header
          user={user}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="p-6">
          {!user && timeout && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 opacity-100 backdrop-blur-xs transition-opacity duration-300">
              <Dialog className="z-60 w-full max-w-md rounded-lg bg-white shadow-lg dark:bg-gray-800">
                <DialogHeader className="z-60 p-6 text-center">
                  <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    الرجاء تسجيل الدخول
                  </DialogTitle>
                </DialogHeader>
                <DialogContent className="z-60 p-6">
                  <p className="text-center text-gray-700 dark:text-gray-300">
                    تحتاج تسجيل الدخول للحصول على تلك الميزة
                  </p>
                  <div className="mt-6 flex justify-center">
                    <DialogTrigger
                      onClick={() => (window.location.pathname = '/login')}
                      className="z-60 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      تسجيل الدخول
                    </DialogTrigger>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
          <Outlet context={{ user }} />
        </main>
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-xs transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Floating Sidebar */}
      <div
        className={`fixed bottom-4 right-4 top-4 z-50 w-72 transition-transform duration-500 ease-out ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-[120%]'
        }`}>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Timer Card */}
      {!user && !timeout && remainingTime > 0 && (
        <div className="fixed bottom-4 left-4 z-50 rounded-lg bg-gray-200 p-4 shadow-lg dark:bg-gray-800">
          <p className="text-sm text-gray-800 dark:text-gray-200">
            وقتك المتبقي: {formatTime(remainingTime)}
          </p>
        </div>
      )}
    </div>
  );
};

export default ExploreLayout;
