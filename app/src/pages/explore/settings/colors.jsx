import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { toast } from 'react-hot-toast';
const ColorCustomizationPage = () => {
  // Default color templates for light and dark themes
  const defaultTemplates = {
    light: {
      background: '#ffffff',
      foreground: '#020817',
      primary: '#2563eb',
      primaryForeground: '#ffffff',
      secondary: '#e2e8f0',
      secondaryForeground: '#1e293b',
      accent: '#4f46e5',
      accentForeground: '#ffffff',
      muted: '#f1f5f9',
      mutedForeground: '#64748b',
      border: '#cbd5e1',
      card: '#ffffff',
      mutedLight: '#94a3b8',
    },
    dark: {
      background: '#0f172a',
      foreground: '#f8fafc',
      primary: '#3b82f6',
      primaryForeground: '#ffffff',
      secondary: '#1e293b',
      secondaryForeground: '#f8fafc',
      accent: '#818cf8',
      accentForeground: '#ffffff',
      muted: '#1e293b',
      mutedForeground: '#94a3b8',
      border: '#334155',
      card: '#1e293b',
      mutedLight: '#475569',
    },
  };

  // State to manage user-selected templates
  const [templates, setTemplates] = useState(defaultTemplates);

  // Load saved templates from local storage on component mount
  useEffect(() => {
    const savedTemplates = JSON.parse(localStorage.getItem('userTemplates'));
    if (savedTemplates) {
      setTemplates(savedTemplates);
    }
  }, []);

  // Save templates to local storage
  const saveTemplates = () => {
    localStorage.setItem('userTemplates', JSON.stringify(templates));
    toast.success('تم حفظ القوالب بنجاح!');
    toast.success('قم بإعادة التحميل لرؤية النتائج');
  };

  // Reset to default templates
  const resetTemplates = () => {
    setTemplates(defaultTemplates);
    localStorage.removeItem('userTemplates');
    toast.success('تم استعادة القوالب الافتراضية!');
    toast.success('قم بإعادة التحميل لرؤية النتائج');
  };

  // Update a specific color in a theme
  const handleColorChange = (theme, key, value) => {
    setTemplates((prevTemplates) => ({
      ...prevTemplates,
      [theme]: {
        ...prevTemplates[theme],
        [key]: value,
      },
    }));
  };

  return (
    <div className="bg-background text-foreground p-6" dir="rtl">
      <h1 className="mb-6 text-2xl font-bold">تخصيص الألوان</h1>

      {/* Light Theme Color Inputs */}
      <h2 className="mb-4 text-xl font-bold">الوضع الفاتح</h2>
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(templates.light).map(([key, value]) => (
          <div key={key} className="flex flex-col gap-y-2">
            <label className="text-sm font-medium">{key}</label>
            <input
              type="color"
              value={value}
              onChange={(e) => handleColorChange('light', key, e.target.value)}
              className="h-10 w-full"
            />
          </div>
        ))}
      </div>

      {/* Dark Theme Color Inputs */}
      <h2 className="mb-4 text-xl font-bold">الوضع الداكن</h2>
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(templates.dark).map(([key, value]) => (
          <div key={key} className="flex flex-col gap-y-2">
            <label className="text-sm font-medium">{key}</label>
            <input
              type="color"
              value={value}
              onChange={(e) => handleColorChange('dark', key, e.target.value)}
              className="h-10 w-full"
            />
          </div>
        ))}
      </div>

      {/* Save and Reset Buttons */}
      <div className="mt-6 flex gap-4 space-x-4">
        <Button
          onClick={saveTemplates}
          className="bg-primary text-primary-foreground rounded-sm px-4 py-2">
          حفظ القوالب
        </Button>
        <Button
          onClick={resetTemplates}
          className="bg-secondary text-secondary-foreground rounded-sm px-4 py-2">
          استعادة الافتراضي
        </Button>
      </div>
    </div>
  );
};

export default ColorCustomizationPage;
