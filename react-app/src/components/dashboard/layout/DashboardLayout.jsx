// src/components/dashboard/layout/DashboardLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import api from '../../../utils/api';

const DashboardLayout = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!localStorage.getItem('token')) {
          navigate('/login');
          return;
        }
        const userData = await api.auth.getMe();
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <MobileNav
        onToggle={() => setIsMobileNavOpen(!isMobileNavOpen)}
        isMobileNavOpen={isMobileNavOpen}
      />
      <Sidebar isOpen={isMobileNavOpen} />
      <div className="lg:mr-64 pt-16 lg:pt-0">
        <Header user={user} />
        <main className="p-6">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
