import { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
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
  const saveTemplates = (newTemplates) => {
    localStorage.setItem('userTemplates', JSON.stringify(newTemplates));
    setTemplates(newTemplates);
  };

  // Reset to default templates
  const resetTemplates = () => {
    setTemplates(defaultTemplates);
    localStorage.removeItem('userTemplates');
  };

  return (
    <ColorContext.Provider value={{ templates, saveTemplates, resetTemplates }}>
      {children}
    </ColorContext.Provider>
  );
};

ColorProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useColors = () => useContext(ColorContext);
