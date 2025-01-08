// src/pages/dashboard/index.jsx
import { useLocation, Navigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';

const DashboardPage = () => {
  const location = useLocation();

  // Redirect to overview if accessing /dashboard directly
  if (['/dashboard', '/dashboard/'].includes(location.pathname)) {
    return <Navigate to="/dashboard/overview" replace />;
  }

  return <DashboardLayout />;
};

export default DashboardPage;
