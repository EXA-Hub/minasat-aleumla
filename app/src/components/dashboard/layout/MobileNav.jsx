// src/components/dashboard/layout/MobileNav.jsx
import { Menu, X } from 'lucide-react';
import { Button } from '../../ui/button';

const MobileNav = ({ onToggle, isMobileNavOpen }) => {
  return (
    <div className="lg:hidden fixed top-0 right-0 left-0 z-50 bg-background border-b px-4">
      <div className="flex justify-between items-center h-16">
        <h1 className="font-semibold">لوحة التحكم</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onToggle}>
            {isMobileNavOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
