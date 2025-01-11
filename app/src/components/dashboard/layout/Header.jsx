// src/components/dashboard/layout/Header.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from '../../ThemeToggle';
import menuItems from '../../../components/dashboard/DashboardRoutes';
import { User } from '../../ui/user';
import PropTypes from 'prop-types';

const Header = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract the section based on the current location path
  const findSectionByPath = (path) => {
    // Iterate over menuItems to find the section that contains the path
    return menuItems.find((section) =>
      section.items.some((item) => item.path === path)
    );
  };

  // Call the function with the current location.pathname
  const currentSection = findSectionByPath(location.pathname);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="border-b bg-card">
      <div className="flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold">
            {currentSection.title || 'لوحة التحكم'}
          </h1>
        </div>

        <User
          user={user}
          handleLogout={handleLogout}
          ThemeToggle={ThemeToggle}
        />
      </div>
    </header>
  );
};

Header.propTypes = {
  user: PropTypes.object.isRequired,
};

export default Header;
