import { useState, useRef, useEffect, memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import {
  ArrowRightCircleIcon,
  User as UserIcon,
  ChevronDown,
  Settings,
  LogOut,
  Globe2,
  Bell,
} from 'lucide-react';

import dashboardMenuItems from '../dashboard/DashboardRoutes';
import exploreMenuItems from '../explore/ExploreRoutes';
import wss from '../../services/wss';
import { Button } from './button';

// Extracted constants for improved maintainability
const SECTIONS = {
  MAIN: 'main',
  NOTIFICATIONS: 'notifications',
  EXPLORE: 'explore',
  SETTINGS: 'settings',
  EXPLORE_PAGES: 'explorePages',
  SETTINGS_PAGES: 'settingsPages',
};

// Extracted styles to a separate object
const styles = {
  notificationItem: {
    wrapper:
      'px-3 py-3 hover:bg-accent transition-colors duration-200 cursor-pointer',
    text: 'text-sm',
    time: 'text-xs text-muted-foreground mt-1',
  },
  dropdown: {
    base: 'absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-border bg-background shadow-lg transition-all duration-200',
    open: 'scale-100 opacity-100',
    closed: 'pointer-events-none scale-95 opacity-0',
  },
};

// Extracted notification item to a separate component
const NotificationItem = memo(({ notification, onClick, formatTimeDiff }) => (
  <div onClick={onClick} className={styles.notificationItem.wrapper}>
    <div className={styles.notificationItem.text}>{notification.text}</div>
    <div className={styles.notificationItem.time}>
      {formatTimeDiff(notification.date)}
    </div>
  </div>
));

NotificationItem.displayName = 'NotificationItem';
NotificationItem.propTypes = {
  notification: PropTypes.shape({
    text: PropTypes.string.isRequired,
    date: PropTypes.number.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  formatTimeDiff: PropTypes.func.isRequired,
};

// Extracted time formatting logic to a custom hook
const useTimeDiffFormatter = () =>
  useCallback((time) => {
    const diffInSeconds = Math.floor((Date.now() - time) / 1000);
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

// Extracted notification management to a custom hook
const useNotificationManager = () => {
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const updateNotifications = useCallback((updater) => {
    setNotifications((current) => {
      const newNotifications =
        typeof updater === 'function' ? updater(current) : updater;

      if (Array.isArray(newNotifications)) {
        localStorage.setItem('notifications', JSON.stringify(newNotifications));
        return newNotifications;
      }
      return current;
    });
  }, []);

  return { notifications, updateNotifications };
};

export const User = ({ ThemeToggle, user, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sectionID, setSectionID] = useState(null);
  const [activeSection, setActiveSection] = useState(SECTIONS.MAIN);
  const dropdownRef = useRef(null);

  const { notifications, updateNotifications } = useNotificationManager();
  const formatTimeDiff = useTimeDiffFormatter();

  // Memoized menu items to prevent unnecessary re-renders
  const mainMenuItems = useMemo(
    () => [
      {
        icon: <Bell className="h-4 w-4" />,
        label: 'الإشعارات',
        action: () => setActiveSection(SECTIONS.NOTIFICATIONS),
        badge: notifications.length,
      },
      {
        icon: <UserIcon className="h-4 w-4" />,
        label: 'الملف الشخصي',
        action: () => window.location.replace('/@' + user.username),
      },
      {
        icon: <Globe2 className="h-4 w-4" />,
        label: 'التصفح',
        action: () => setActiveSection(SECTIONS.EXPLORE),
      },
      {
        icon: <Settings className="h-4 w-4" />,
        label: 'الإعدادات',
        action: () => setActiveSection(SECTIONS.SETTINGS),
      },
      {
        icon: <LogOut className="h-4 w-4" />,
        label: 'تسجيل الخروج',
        action: () => {
          localStorage.removeItem('notifications');
          handleLogout();
        },
      },
    ],
    [notifications.length, user.username, handleLogout]
  );

  // Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // WebSocket notifications listener
  useEffect(() => {
    const wsListener = (event, data) => {
      if (event === 'message') {
        const newNotification = JSON.parse(data);
        if (!['notify', 'broadcast'].includes(newNotification.type)) return;
        toast('لديك إشعار جديد', { icon: '🔔' });
        updateNotifications((prev) => [newNotification, ...prev]);
      } else if (event === 'max_reconnect_attempts') {
        toast.error('فشل الاتصال بخدمات الإشعارات.');
      }
    };

    const unsubscribe = wss.addListener(wsListener);
    wss.connect();

    return () => {
      unsubscribe();
    };
  }, [updateNotifications]);

  // Render notifications section
  const renderNotificationsSection = () => (
    <div className="translate-x-0 py-2 transition-transform duration-200">
      <div className="flex items-center border-b border-border px-3 pb-2">
        <button
          onClick={() => setActiveSection(SECTIONS.MAIN)}
          className="text-sm transition-colors duration-200 hover:text-primary">
          <ArrowRightCircleIcon className="h-4 w-4" />
        </button>
        <span className="mr-2 font-medium">الإشعارات</span>
      </div>
      {notifications
        .sort((a, b) => b.time - a.time)
        .map((notification, index) => (
          <NotificationItem
            key={index}
            notification={notification}
            onClick={() => {
              updateNotifications(notifications.filter((_n, i) => i !== index));
            }}
            formatTimeDiff={formatTimeDiff}
          />
        ))}
      {notifications.length === 0 && (
        <div className="p-1 pt-1 text-center text-sm text-muted">
          لا توجد إشعارات جديدة
        </div>
      )}
    </div>
  );

  // Render explore section
  const renderExploreSection = () => (
    <div className="translate-x-0 py-2 transition-transform duration-200">
      <div className="flex items-center border-b border-border px-3 pb-2">
        <button
          onClick={() => setActiveSection(SECTIONS.MAIN)}
          className="text-sm transition-colors duration-200 hover:text-primary">
          <ArrowRightCircleIcon className="h-4 w-4" />
        </button>
        <span className="mr-2 font-medium">التصفح</span>
      </div>
      {exploreMenuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setActiveSection(SECTIONS.EXPLORE_PAGES);
            setSectionID(item.id);
          }}
          className="group flex w-full items-center justify-end gap-3 px-3 py-2.5 text-sm transition-colors duration-200 hover:bg-accent">
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            {item.title}
          </span>
        </button>
      ))}
    </div>
  );

  // Render settings section
  const renderSettingsSection = () => (
    <div className="translate-x-0 py-2 transition-transform duration-200">
      <div className="flex items-center border-b border-border px-3 pb-2">
        <button
          onClick={() => setActiveSection(SECTIONS.MAIN)}
          className="text-sm transition-colors duration-200 hover:text-primary">
          <ArrowRightCircleIcon className="h-4 w-4" />
        </button>
        <span className="mr-2 font-medium">الإعدادات</span>
      </div>
      {dashboardMenuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setActiveSection(SECTIONS.SETTINGS_PAGES);
            setSectionID(item.id);
          }}
          className="group flex w-full items-center justify-end gap-3 px-3 py-2.5 text-sm transition-colors duration-200 hover:bg-accent">
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            {item.title}
          </span>
        </button>
      ))}
    </div>
  );

  // Render explore pages section
  const renderExplorePagesSection = () => {
    const targetSection = exploreMenuItems.find(
      (item) => item.id === sectionID
    );
    return (
      <div className="translate-x-0 py-2 transition-transform duration-200">
        <div className="flex items-center border-b border-border px-3 pb-2">
          <button
            onClick={() => setActiveSection(SECTIONS.EXPLORE)}
            className="text-sm transition-colors duration-200 hover:text-primary">
            <ArrowRightCircleIcon className="h-4 w-4" />
          </button>
          <span className="mr-2 font-medium">{targetSection?.title}</span>
        </div>
        {targetSection?.items?.map((item) => (
          <button
            key={item.path}
            onClick={() => window.location.replace(item.path)}
            className="group flex w-full items-center justify-end gap-3 px-3 py-2.5 text-sm transition-colors duration-200 hover:bg-accent">
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              {item.name}
            </span>
            <item.icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    );
  };

  // Render settings pages section
  const renderSettingsPagesSection = () => {
    const targetSection = dashboardMenuItems.find(
      (item) => item.id === sectionID
    );
    return (
      <div className="translate-x-0 py-2 transition-transform duration-200">
        <div className="flex items-center border-b border-border px-3 pb-2">
          <button
            onClick={() => setActiveSection(SECTIONS.SETTINGS)}
            className="text-sm transition-colors duration-200 hover:text-primary">
            <ArrowRightCircleIcon className="h-4 w-4" />
          </button>
          <span className="mr-2 font-medium">{targetSection?.title}</span>
        </div>
        {targetSection?.items?.map((item) => (
          <button
            key={item.path}
            onClick={() => window.location.replace(item.path)}
            className="group flex w-full items-center justify-end gap-3 px-3 py-2.5 text-sm transition-colors duration-200 hover:bg-accent">
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              {item.name}
            </span>
            <item.icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    );
  };

  // Render main menu items section
  const renderMainSection = () => (
    <div className="py-2">
      {mainMenuItems.map((item) => (
        <button
          key={item.label}
          onClick={item.action}
          className="group flex w-full items-center justify-end gap-3 px-3 py-2.5 text-sm transition-colors duration-200 hover:bg-accent">
          {item.badge && (
            <span className="mr-auto rounded-full bg-primary bg-red-500 px-2 py-0.5 text-xs text-primary-foreground">
              {item.badge}
            </span>
          )}
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            {item.label}
          </span>
          {item.icon}
        </button>
      ))}
    </div>
  );

  // Render dropdown content based on active section
  const renderDropdownContent = () => {
    const sectionRenderers = {
      [SECTIONS.NOTIFICATIONS]: renderNotificationsSection,
      [SECTIONS.EXPLORE]: renderExploreSection,
      [SECTIONS.SETTINGS]: renderSettingsSection,
      [SECTIONS.EXPLORE_PAGES]: renderExplorePagesSection,
      [SECTIONS.SETTINGS_PAGES]: renderSettingsPagesSection,
      [SECTIONS.MAIN]: renderMainSection,
    };

    return sectionRenderers[activeSection]
      ? sectionRenderers[activeSection]()
      : null;
  };

  return (
    <div dir="rtl" className="flex items-center gap-4">
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="default"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className="flex items-center gap-2 transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
          onClick={() => setIsOpen(!isOpen)}>
          <img
            src={user.profile?.profilePicture || '/avatar.jpg'}
            alt={user.username}
            className="h-8 w-8 rounded-full"
          />
          {mainMenuItems.reduce((acc, item) => acc + (item.badge || 0), 0) >
            0 && (
            <div className="absolute right-4 top-1 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
          )}
          <span className="text-sm font-medium">{user.username}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </Button>

        <div
          className={`${styles.dropdown.base} ${
            isOpen ? styles.dropdown.open : styles.dropdown.closed
          }`}>
          {renderDropdownContent()}
        </div>
      </div>
      <ThemeToggle />
    </div>
  );
};

User.displayName = 'User';

User.propTypes = {
  ThemeToggle: PropTypes.func.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    profile: PropTypes.shape({
      profilePicture: PropTypes.string,
    }),
  }).isRequired,
  handleLogout: PropTypes.func.isRequired,
};

export default User;
