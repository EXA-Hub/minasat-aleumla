// app/src/pages/dashboard/security/privacy.jsx
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Lock, Unlock, Shield, Info, Save } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import api from '../../../utils/api';

const PrivacyToggle = ({ label, description, isEnabled = false, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative rtl">
      <div
        className={`p-4 rounded-lg border-2 transition-all duration-300 ${
          isEnabled
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-3">
            <div
              className={`p-2 rounded-full transition-colors ${
                isEnabled ? 'bg-blue-500' : 'bg-gray-200'
              }`}>
              {isEnabled ? (
                <Lock className="h-5 w-5 text-white" />
              ) : (
                <Unlock className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <div>
              <h3 className="font-medium">{label}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>

          <button
            onClick={onClick}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none ${
              isEnabled ? 'bg-blue-500' : 'bg-gray-200'
            }`}>
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform duration-300 transform ${
                isEnabled ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {isHovered && (
          <div className="mt-4 text-sm text-gray-500 animate-fadeIn rtl:text-right">
            <div className="flex items-start space-x-reverse space-x-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                عند التفعيل، تساعدك هذه الإعدادات في حماية معلوماتك من خلال
                {isEnabled ? ' تقييد ' : ' السماح بـ'}الوصول إلى ميزات محددة.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

PrivacyToggle.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  isEnabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

const PrivacyPage = () => {
  const [disabled, setDisabled] = useState(false);
  const [privacySettings, setPrivacy] = useState([]);

  useEffect(() => {
    // Fetch the privacy settings from the API
    const fetchPrivacySettings = async () => {
      try {
        const settingsTemplate = [
          {
            id: 'showProfile',
            label: 'غلق رؤية الملف الشخصي',
            description: 'تحكم في من يمكنه رؤية معلومات ملفك الشخصي',
            enabled: true,
          },
          {
            id: 'showWallet',
            label: 'غلق رؤية المحفظة',
            description: 'تحكم في من يمكنه رؤية معلومات محفظتك',
            enabled: true,
          },
        ];
        // Fetch the privacy settings from the API
        const data = await api.privacy.getSettings();
        // Update the privacy settings state
        setPrivacy(
          settingsTemplate.map((setting) => ({
            ...setting,
            enabled: data[setting.id.toString()],
          }))
        );
      } catch (error) {
        console.error(error);
      }
    };
    fetchPrivacySettings();
  }, []);

  const savePrivacySettings = async () => {
    try {
      setDisabled(true);
      // Dynamically create the object from the privacySettings array
      const privacyObject = privacySettings.reduce((acc, setting) => {
        acc[setting.id] = setting.enabled;
        return acc;
      }, {});
      // Log the dynamically created object
      await api.privacy.updateSettings(privacyObject);
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error(error);
    } finally {
      setDisabled(false);
    }
  };

  return (
    <div className="space-y-6 rtl text-right">
      <h2 className="text-3xl font-bold">
        إعدادات الخصوصية
        <Button
          onClick={savePrivacySettings}
          disabled={disabled}
          className="bg-blue-500 hover:bg-blue-600 text-white mr-6">
          حفظ التغييرات
          {disabled ? (
            // spinner
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
        </Button>
      </h2>

      <Alert className="mb-6 flex" style={{ display: 'ruby-base' }}>
        <Shield className="h-5 w-5" />
        <AlertDescription className="mx-1">
          الخصوصية تهمنا. قم بتخصيص هذه الإعدادات للتحكم في كيفية التعامل مع
          معلوماتك.
        </AlertDescription>
        <Link
          className="text-blue-500 hover:underline"
          to="/dashboard/security/privacy-policy">
          تعرف على المزيد
        </Link>
      </Alert>

      {privacySettings.length > 0 && (
        <Card className="p-6">
          <div className="space-y-6">
            {privacySettings.map((setting) => (
              <PrivacyToggle
                key={setting.id}
                label={setting.label}
                description={setting.description}
                isEnabled={!setting.enabled}
                onClick={() => {
                  setPrivacy((prev) =>
                    prev.map((prevSetting) =>
                      prevSetting.id === setting.id
                        ? { ...prevSetting, enabled: !prevSetting.enabled }
                        : prevSetting
                    )
                  );
                }}
              />
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-start space-x-reverse space-x-4">
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
            {privacySettings.length > 0 ? (
              <Shield className="h-6 w-6 text-blue-500" />
            ) : (
              // spinner
              <svg
                className="animate-spin h-5 w-5 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-medium mb-2">حول إعدادات الخصوصية</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              تساعدك هذه الإعدادات في إدارة كيفية استخدام معلوماتك عبر منصتنا.
              ننصح بمراجعة كل إعداد بعناية للتأكد من تهيئة تفضيلات الخصوصية بشكل
              صحيح.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PrivacyPage;
