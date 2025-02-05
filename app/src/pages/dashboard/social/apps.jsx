import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';

const AppIconWithName = ({ app }) => {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-8 w-8"
        style={{
          WebkitMask: `url(${app.svg}) center/contain no-repeat`,
          mask: `url(${app.svg}) center/contain no-repeat`,
          backgroundColor: app.bgColor,
        }}
      />
      <span className="font-medium" style={{ color: app.bgColor }}>
        {app.name}
      </span>
    </div>
  );
};

// Prop types validation
AppIconWithName.propTypes = {
  app: PropTypes.shape({
    svg: PropTypes.string.isRequired,
    bgColor: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

const ConnectedApps = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadInitialData = async () => {
    try {
      const fetchedApps = await api.apps.getApps();
      setApps(fetchedApps);
    } catch (error) {
      console.error('Failed to load apps:', error);
      setApps([]);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleDisconnect = async (appId, account) => {
    setLoading(true);
    try {
      await api.apps.disconnect({ appId, account });
      toast.success('تم إلغاء ربط الحساب بنجاح');
      loadInitialData();
    } catch (error) {
      console.log(error);
      toast.error(error.data.error || 'فشل إلغاء الربط');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-2xl font-semibold">التطبيقات المتصلة</h2>
        <p className="text-muted-foreground">
          قم بربط حساباتك على وسائل التواصل الاجتماعي
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => (
          <div key={app.id} className="bg-card h-full rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between">
              <AppIconWithName app={app} />
              {`${app.connectedAccounts.length}/${app.slots}`}
              <Button
                disabled={loading || app.connectedAccounts.length >= app.slots}
                onClick={() => {
                  setLoading(true);
                  const width = 500;
                  const height = 600;
                  const left = (window.innerWidth - width) / 2;
                  const top = (window.innerHeight - height) / 2;
                  const popup = window.open(
                    `${api.API_BASE_URL}/api/public/app/connect/${app.id}`,
                    '_blank',
                    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
                  );
                  if (popup) {
                    const popupCheckInterval = setInterval(() => {
                      if (popup.closed) {
                        clearInterval(popupCheckInterval);
                        loadInitialData();
                        setLoading(false);
                      }
                    }, 500); // Check every 500ms
                  } else {
                    console.error('Failed to open popup');
                  }
                }}
                size="sm"
                className="gap-2">
                <Plus className="h-4 w-4" />
                ربط حساب
              </Button>
            </div>

            {app.connectedAccounts.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <h3 className="text-muted-foreground text-sm font-medium">
                  الحسابات المتصلة
                </h3>
                <div className="space-y-1">
                  {app.connectedAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="bg-muted-light flex items-center justify-between rounded-sm p-2 text-sm">
                      <span>{account.name}</span>
                      <Button
                        disabled={loading}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect(app.id, account)}
                        className="h-7 text-red-600 hover:text-red-700">
                        إلغاء الربط
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectedApps;
