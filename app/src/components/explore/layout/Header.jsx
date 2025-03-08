// react-app/src/components/explore/layout/Header.jsx
import PropTypes from 'prop-types';
import { Menu } from 'lucide-react';
import { Button } from '../../ui/button';
import User from '../../ui/user';
import ThemeToggle from '../../ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useModal } from '../../../context/modal-context.js'; // Import useModal

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
        className={`bg-30background fixed top-0 left-0 z-30 w-full border-b border-white/10 backdrop-blur-xl transition-transform duration-300 ease-in-out ${shouldHideHeader ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="flex h-16 items-center justify-between px-6">
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
              <div className="bg-50background rounded-xl border border-white/10 p-2 shadow-xs backdrop-blur-xs">
                <ThemeToggle />
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="from-primary to-primary hover:shadow-30primary relative overflow-hidden rounded-xl bg-linear-to-r px-6 py-2 text-white transition-all duration-300 hover:shadow-lg">
                تسجيل الدخول
              </Button>
            </div>
          )}

          <h1 className="from-primary to-primary mr-4 bg-linear-to-r bg-clip-text text-xl font-bold text-transparent">
            منصة العملة
          </h1>

          <div className="flex items-center gap-4">
            <div className="p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
                className="text-foreground hover:bg-10primary rounded-full">
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
