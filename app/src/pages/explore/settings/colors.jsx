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
    <div className="p-6 bg-background text-foreground" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">تخصيص الألوان</h1>

      {/* Light Theme Color Inputs */}
      <h2 className="text-xl font-bold mb-4">الوضع الفاتح</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Object.entries(templates.light).map(([key, value]) => (
          <div key={key} className="flex flex-col space-y-2">
            <label className="text-sm font-medium">{key}</label>
            <input
              type="color"
              value={value}
              onChange={(e) => handleColorChange('light', key, e.target.value)}
              className="w-full h-10"
            />
          </div>
        ))}
      </div>

      {/* Dark Theme Color Inputs */}
      <h2 className="text-xl font-bold mb-4">الوضع الداكن</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Object.entries(templates.dark).map(([key, value]) => (
          <div key={key} className="flex flex-col space-y-2">
            <label className="text-sm font-medium">{key}</label>
            <input
              type="color"
              value={value}
              onChange={(e) => handleColorChange('dark', key, e.target.value)}
              className="w-full h-10"
            />
          </div>
        ))}
      </div>

      {/* Save and Reset Buttons */}
      <div className="mt-6 flex space-x-4">
        <Button
          onClick={saveTemplates}
          className="px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          حفظ القوالب
        </Button>
        <Button
          onClick={resetTemplates}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded"
        >
          استعادة الافتراضي
        </Button>
      </div>
    </div>
  );
};

export default ColorCustomizationPage;
