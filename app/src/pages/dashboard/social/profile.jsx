// my-react-app/src/pages/dashboard/social/profile.jsx
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Camera, Upload, XCircleIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../utils/api';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ImageSelector = ({ type, close }) => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.apps
      .image({ action: 'get' })
      .then((data) => setApps(data))
      .finally(() => setLoading(false));
  }, []);

  const handleImageSelect = async (appId, accountId) => {
    setLoading(true);
    try {
      await api.apps.image({
        action: 'set',
        appId,
        accountId,
        imageType: type,
      });
    } catch (error) {
      console.error('Error setting image:', error);
    } finally {
      setLoading(false);
      toast.success('تم تغيير الصورة بنجاح');
      toast.loading('سنحتاج ساعة لتحديث الصورة');
      close();
    }
  };

  const getImagesForApp = (app) => {
    const imageArray = [];
    const imageType =
      type === 'profilePicture' ? 'profilePictures' : 'wallpapers';

    if (app.images[imageType]) {
      app.images[imageType].forEach((imageObj) => {
        Object.entries(imageObj).forEach(([accountId, imageHash]) => {
          if (imageHash) {
            imageArray.push({
              id: accountId,
              url:
                app.id.toLocaleLowerCase() === 'discord'
                  ? `https://cdn.discordapp.com/avatars/${accountId}/${imageHash}.webp?size=512`
                  : imageHash,
            });
          }
        });
      });
    }
    console.log(imageArray);
    return imageArray;
  };

  return (
    <Dialog>
      {loading ? (
        <div className="border-border bg-card flex rounded-lg border p-4 text-center">
          جارٍ التحميل...
          <div className="flex items-center justify-center pr-4">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-t-2 border-b-2"></div>
          </div>
        </div>
      ) : (
        <DialogContent>
          <button
            onClick={close}
            aria-label="close"
            className="absolute top-2 left-2 cursor-pointer rounded-full border-none bg-transparent hover:bg-gray-600/60">
            <XCircleIcon size={24} />
          </button>
          <DialogHeader>
            <DialogTitle>اختر صورة من حساباتك</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="p-4 text-center">جارٍ التحميل...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {apps.map((app) => {
                const images = getImagesForApp(app);
                if (images.length === 0) return null;

                return (
                  <div key={app.id} className="flex flex-col gap-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-8 w-8 items-center justify-center"
                        style={{ backgroundColor: app.bgColor }}>
                        <img src={app.svg} alt={app.name} className="h-6 w-6" />
                      </div>
                      <span className="font-medium">{app.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {images.map((img) => (
                        <button
                          key={img.id}
                          onClick={() => handleImageSelect(app.id, img.id)}
                          className="relative aspect-square overflow-hidden rounded-lg transition-opacity hover:opacity-90">
                          <img
                            src={img.url}
                            alt={`${app.name} ${img.id}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
};

ImageSelector.displayName = 'ImageSelector';
import PropTypes from 'prop-types';
ImageSelector.propTypes = {
  type: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
};

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    username: '',
    title: '',
    description: '',
    age: 0,
    sex: '',
    profilePicture: '',
    wallpaper: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  // In ProfilePage component, add state:
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [imageType, setImageType] = useState(null);

  useEffect(() => {
    api.profile.get().then(setProfile);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const errors = validateInput(data);
      if (errors.length) {
        errors.forEach((error) => toast.error(error));
        return;
      }

      const sanitizedData = sanitizeData(data);
      setIsEditing(false);
      await api.profile.update(sanitizedData);
      setProfile({
        ...sanitizedData,
        profilePicture: profile.profilePicture,
        wallpaper: profile.wallpaper,
      });
      toast.success('تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث الملف الشخصي');
      console.error('Profile update error:', error);
    }
  };

  return (
    <div className="rtl space-y-6 text-right">
      <h2 className="text-3xl font-bold">ملفي الشخصي</h2>
      {showImageSelector && (
        <ImageSelector
          type={imageType}
          close={() => setShowImageSelector(false)}
        />
      )}
      <div className="relative mb-20">
        <div className="relative h-48 overflow-hidden rounded-lg bg-gray-100 md:h-64">
          <img
            src={profile.wallpaper || '/wallpaper.jpg'}
            alt="صورة خلفية الملف الشخصي"
            className="h-full w-full object-cover"
          />
          <Link
            onClick={() => {
              setImageType('wallpaper');
              setShowImageSelector(true);
            }}
            className="absolute right-4 bottom-4 rounded-md bg-black/50 p-2 text-white hover:bg-black/70">
            <Upload className="h-5 w-5" />
          </Link>
        </div>

        <div className="absolute -bottom-16 left-6">
          <div className="relative">
            <img
              src={profile.profilePicture || '/avatar.jpg'}
              alt="صورة الملف الشخصي"
              className="h-32 w-32 rounded-full border-4 border-white"
            />
            <Link
              onClick={() => {
                setImageType('profilePicture');
                setShowImageSelector(true);
              }}
              className="bg-primary hover:bg-primary absolute right-0 bottom-0 rounded-full p-2 text-white">
              <Camera className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '5rem' }}>
        <Card className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  اسم المستخدم
                </label>
                <input
                  name="username"
                  type="text"
                  defaultValue={profile.username}
                  className="w-full rounded-md border bg-[var(--background)] p-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">اللقب</label>
                <input
                  name="title"
                  type="text"
                  defaultValue={profile.title}
                  className="w-full rounded-md border bg-[var(--background)] p-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">الوصف</label>
                <textarea
                  name="description"
                  defaultValue={profile.description}
                  className="h-32 w-full rounded-md border bg-[var(--background)] p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    العمر
                  </label>
                  <input
                    name="age"
                    type="number"
                    defaultValue={profile.age}
                    className="w-full rounded-md border bg-[var(--background)] p-2"
                    min="0"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    الجنس
                  </label>
                  <select
                    name="sex"
                    defaultValue={profile.sex}
                    className="w-full rounded-md border bg-[var(--background)] p-2">
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4 rtl:space-x-reverse">
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary flex-1 rounded-md px-4 py-2 text-white">
                  حفظ التغييرات
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300">
                  إلغاء
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{profile.username}</h3>
                  <p className="text-gray-600">{profile.title}</p>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-primary hover:bg-primary rounded-md px-4 py-2 text-white">
                  تعديل الملف
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">نبذة</h4>
                  <p className="mt-1">{profile.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">العمر</h4>
                    <p className="mt-1">{profile.age}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">الجنس</h4>
                    <p className="mt-1">{profile.sex}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

const validateInput = (data) => {
  const errors = [];
  const urlPattern = /^https?:\/\/.+/;

  if (!data.username || data.username.length < 3 || data.username.length > 40) {
    errors.push('يجب أن يكون اسم المستخدم بين 3 و 40 حرفًا');
  }

  if (data.sex && !['ذكر', 'أنثى'].includes(data.sex)) {
    errors.push('الجنس يجب أن يكون ذكر أو أنثى');
  }

  if (data.description?.length > 255) {
    errors.push('يجب أن يكون الوصف أقل من 255 حرف');
  }

  if (data.title?.length > 100) {
    errors.push('يجب أن يكون العنوان أقل من 100 حرف');
  }

  if (data.age) {
    const age = parseInt(data.age);
    if (isNaN(age) || age < 13 || age > 120) {
      errors.push('يجب أن يكون العمر بين 13 و 120 سنة');
    }
  }

  if (data.profilePicture && !urlPattern.test(data.profilePicture)) {
    errors.push('رابط الصورة الشخصية غير صالح');
  }

  if (data.wallpaper && !urlPattern.test(data.wallpaper)) {
    errors.push('رابط صورة الغلاف غير صالح');
  }

  return errors;
};

const sanitizeData = (data) => {
  const sanitized = {};
  Object.keys(data).forEach((key) => {
    if (typeof data[key] === 'string') {
      sanitized[key] = data[key]
        .trim()
        .replace(/[<>]/g, '')
        .replace(/^\s+|\s+$/g, '');
    } else {
      sanitized[key] = data[key];
    }
  });
  return sanitized;
};

export default ProfilePage;
