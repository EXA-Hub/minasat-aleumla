import { createContext, useContext, useEffect, useState } from 'react';
import { useColors } from './ColorContext';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const { templates } = useColors();
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  // Update CSS variables when the theme or templates change
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    // Add the current theme class
    root.classList.add(theme);

    // Apply the corresponding color template
    const activeTemplate = templates[theme];
    Object.entries(activeTemplate).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Save the theme to local storage
    localStorage.setItem('theme', theme);
  }, [theme, templates]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
