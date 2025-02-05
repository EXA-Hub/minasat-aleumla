// app/src/context/ThemeContext.jsx
import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';
import { useColors } from './ColorContext';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const { templates } = useColors();
  const [mode, setMode] = useState(() => {
    if (typeof window !== 'undefined')
      return localStorage.getItem('theme') || 'light';
    return 'light';
  });

  // Update CSS variables and handle theme switching
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode);

    const hexToRgba = (hex, opacity) => {
      const hexWithoutHash = hex.replace('#', '');
      const r = parseInt(hexWithoutHash.substring(0, 2), 16);
      const g = parseInt(hexWithoutHash.substring(2, 4), 16);
      const b = parseInt(hexWithoutHash.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const activeTemplate = templates[mode];
    Object.entries(activeTemplate).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, hexToRgba(value, 1));
      for (let opacity = 5; opacity <= 100; opacity += 5) {
        root.style.setProperty(
          `--${opacity}${key.toLowerCase()}`,
          hexToRgba(value, opacity / 100)
        );
      }
    });

    localStorage.setItem('theme', mode);
  }, [mode, templates]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme: mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useTheme = () => useContext(ThemeContext);
