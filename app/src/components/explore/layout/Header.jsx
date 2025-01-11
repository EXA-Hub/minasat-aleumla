// react-app/src/components/explore/layout/Header.jsx
import PropTypes from 'prop-types';
import { Menu } from 'lucide-react';
import { Button } from '../../ui/button';
import User from '../../ui/user';
import ThemeToggle from '../../ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useModal } from '../../../context/ModalManager'; // Import useModal

const Header = ({ user, onToggleSidebar }) => {
  const navigate = useNavigate();
  const [isHidden, setIsHidden] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const { modal } = useModal(); // Get the current modal state

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      if (currentScrollPos > prevScrollPos && currentScrollPos > 100)
        setIsHidden(true);
      else setIsHidden(false);

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  // Hide the header if a modal is open
  const shouldHideHeader = isHidden || modal !== null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full bg-background/30 backdrop-blur-xl border-b border-white/10 z-30 transition-transform duration-300 ease-in-out ${shouldHideHeader ? '-translate-y-full' : 'translate-y-0'}`}
      >
        <div className="px-6 h-16 flex items-center justify-between">
          {user ? (
            <div className="flex items-center gap-4">
              <User
                user={user}
                ThemeToggle={ThemeToggle}
                handleLogout={handleLogout}
              />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-background/50 backdrop-blur-sm border border-white/10 shadow-sm">
                <ThemeToggle />
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="relative overflow-hidden bg-gradient-to-r from-primary to-blue-600 text-white py-2 px-6 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
              >
                تسجيل الدخول
              </Button>
            </div>
          )}

          <h1 className="font-bold text-xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mr-4">
            منصة العملة
          </h1>

          <div className="flex items-center gap-4">
            <div className="p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
                className="rounded-full text-foreground hover:bg-primary/10"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Add a spacer to push content down */}
      <div className="h-16" />
    </>
  );
};

Header.propTypes = {
  user: PropTypes.object,
  onToggleSidebar: PropTypes.func.isRequired,
};

export default Header;
