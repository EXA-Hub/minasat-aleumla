// my-react-app/src/components/ui/user.jsx
import { useState, useRef, useEffect, memo, useCallback, useMemo } from 'react';
import { Button } from './button';
import {
  LogOut,
  Bell,
  Settings,
  User as UserIcon,
  ChevronDown,
  ArrowRightCircleIcon,
  Globe2,
} from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';

const notificationItemStyles = {
  wrapper:
    'px-3 py-3 hover:bg-accent transition-colors duration-200 cursor-pointer',
  text: 'text-sm',
  time: 'text-xs text-muted-foreground mt-1',
};

const NotificationItem = memo(({ notification, onClick, formatTimeDiff }) => (
  <div onClick={onClick} className={notificationItemStyles.wrapper}>
    <div className={notificationItemStyles.text}>{notification.text}</div>
    <div className={notificationItemStyles.time}>
      {formatTimeDiff(notification.time)}
    </div>
  </div>
));

NotificationItem.displayName = 'NotificationItem';

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    text: PropTypes.string.isRequired,
    time: PropTypes.number.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  formatTimeDiff: PropTypes.func.isRequired,
};

function wss() {
  return new WebSocket(
    api.API_BASE_URL.replace(/^https?/, 'ws') +
      '/?token=' +
      localStorage.getItem('token')
  );
}

const RECONNECT_MAX_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY = 1000;

export const User = ({ ThemeToggle, user, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('main');
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const dropdownRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mainMenuItems = useMemo(
    () => [
      {
        icon: <Bell className="h-4 w-4" />,
        label: 'الإشعارات',
        action: () => setActiveSection('notifications'),
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
        action: () => window.location.replace('/explore'),
      },
      {
        icon: <Settings className="h-4 w-4" />,
        label: 'الإعدادات',
        action: () => window.location.replace('/dashboard/social/profile'),
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

  const formatTimeDiff = useCallback((time) => {
    const diffInSeconds = Math.floor((Date.now() - time) / 1000);
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const wsRef = useRef(null);

  const reconnectWebSocket = useCallback(() => {
    if (reconnectAttempts.current >= RECONNECT_MAX_ATTEMPTS) {
      toast.error('فشل الاتصال بالخادم. يرجى تحديث الصفحة.');
      return;
    }

    if (wsRef.current) {
      wsRef.current.close();
    }

    const delay = RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts.current);
    reconnectTimeout.current = setTimeout(() => {
      const ws = wss();
      wsRef.current = ws;

      ws.onmessage = (event) => {
        toast('لديك إشعار جديد', { icon: '🔔' });
        const newNotification = JSON.parse(event.data);
        updateNotifications((prev) => [newNotification, ...prev]);
      };

      ws.onclose = () => {
        reconnectAttempts.current++;
        reconnectWebSocket();
      };

      ws.onerror = () => {
        ws.close();
      };
    }, delay);
  }, [updateNotifications]);

  useEffect(() => {
    reconnectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      reconnectAttempts.current = 0;
    };
  }, [reconnectWebSocket]);

  return (
    <div dir="rtl" className="flex items-center gap-4">
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="default"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200"
          onClick={() => setIsOpen(!isOpen)}>
          <img
            src={user.profile?.profilePicture || '/avatar.jpg'}
            alt={user.username}
            className="w-8 h-8 rounded-full"
          />
          {mainMenuItems.reduce((acc, item) => acc + (item.badge || 0), 0) >
            0 && (
            <div className="absolute top-1 right-4 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          )}
          <span className="text-sm font-medium">{user.username}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </Button>

        <div
          className={`absolute right-0 mt-2 w-48 bg-background rounded-lg shadow-lg border border-border overflow-hidden transition-all duration-200 z-50 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          {(() => {
            switch (activeSection) {
              case 'notifications':
                return (
                  <div className="py-2 translate-x-0 transition-transform duration-200">
                    <div className="flex items-center px-3 pb-2 border-b border-border">
                      <button
                        onClick={() => setActiveSection('main')}
                        className="text-sm hover:text-primary transition-colors duration-200">
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
                            updateNotifications(
                              notifications.filter((_n, i) => i !== index)
                            );
                          }}
                          formatTimeDiff={formatTimeDiff}
                        />
                      ))}
                    {notifications.length === 0 && (
                      <div className="text-sm text-muted p-1 pt-1 text-center">
                        لا توجد إشعارات جديدة
                      </div>
                    )}
                  </div>
                );
              default:
                return (
                  <div className="py-2">
                    {mainMenuItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="w-full px-3 py-2.5 text-sm flex items-center justify-end gap-3 hover:bg-accent transition-colors duration-200 group">
                        {item.badge && (
                          <span className="mr-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 bg-red-500">
                            {item.badge}
                          </span>
                        )}
                        <span className="group-hover:translate-x-1 transition-transform duration-200">
                          {item.label}
                        </span>
                        {item.icon}
                      </button>
                    ))}
                  </div>
                );
            }
          })()}
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
