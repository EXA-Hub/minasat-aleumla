import { createContext, useContext, useEffect, useState } from 'react';
import { useColors } from './ColorContext';
import PropTypes from 'prop-types';

const ThemeContext = createContext();

/**
 * The ThemeProvider component is responsible for managing the application's
 * current theme, as well as updating the CSS variables for the theme.
 *
 * The `children` prop is a required prop that should contain the root element
 * of the application.
 *
 * The `theme` state is either 'light' or 'dark', and is used to update the
 * CSS variables for the theme. The `toggleTheme` function is used to toggle
 * between light and dark themes.
 *
 * The ThemeProvider uses the useColors hook to get the color templates for
 * the light and dark themes.
 *
 * The ThemeProvider also uses the useEffect hook to update the CSS variables
 * when the theme or templates change.
 */

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

    // Utility function to convert hex to rgba with opacity
    const hexToRgba = (hex, opacity) => {
      // Remove the '#' from the hex color
      const hexWithoutHash = hex.replace('#', '');

      // Convert the hex color to RGB
      const r = parseInt(hexWithoutHash.substring(0, 2), 16);
      const g = parseInt(hexWithoutHash.substring(2, 4), 16);
      const b = parseInt(hexWithoutHash.substring(4, 6), 16);

      // Return the rgba string with the specified opacity
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    // Apply the corresponding color template
    const activeTemplate = templates[theme];
    Object.entries(activeTemplate).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, hexToRgba(value, 1)); // Set base color
      // Generate opacity variants for the color
      for (let opacity = 5; opacity <= 100; opacity += 5)
        root.style.setProperty(
          `--${opacity}${key.toLocaleLowerCase()}`,
          hexToRgba(value, opacity / 100)
        ); // Set opacity variant
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

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useTheme = () => useContext(ThemeContext);
