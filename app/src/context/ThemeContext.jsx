// app/src/context/ThemeContext.jsx
import { prefixer } from 'stylis';
import PropTypes from 'prop-types';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  createTheme,
  ThemeProvider as MUIThemeProvider,
} from '@mui/material/styles';
import { useColors } from './ColorContext';

const ThemeContext = createContext();

// RTL cache configuration
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

export function ThemeProvider({ children }) {
  const { templates } = useColors();
  const [mode, setMode] = useState(() => {
    if (typeof window !== 'undefined')
      return localStorage.getItem('theme') || 'light';
    return 'light';
  });

  // Create MUI theme based on current mode and color templates
  const theme = useMemo(() => {
    const activeTemplate = templates[mode];

    return createTheme({
      direction: 'rtl',
      palette: {
        mode,
        primary: {
          main: activeTemplate.primary || '#1976d2',
          light: activeTemplate.primaryLight || '#42a5f5',
          dark: activeTemplate.primaryDark || '#1565c0',
        },
        secondary: {
          main: activeTemplate.secondary || '#9c27b0',
          light: activeTemplate.secondaryLight || '#ba68c8',
          dark: activeTemplate.secondaryDark || '#7b1fa2',
        },
        background: {
          default: mode === 'light' ? '#ffffff' : '#121212',
          paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
        },
        text: {
          primary:
            mode === 'light'
              ? 'rgba(0, 0, 0, 0.87)'
              : 'rgba(255, 255, 255, 0.87)',
          secondary:
            mode === 'light'
              ? 'rgba(0, 0, 0, 0.6)'
              : 'rgba(255, 255, 255, 0.6)',
        },
        error: {
          main: activeTemplate.error || '#d32f2f',
        },
        warning: {
          main: activeTemplate.warning || '#ed6c02',
        },
        info: {
          main: activeTemplate.info || '#0288d1',
        },
        success: {
          main: activeTemplate.success || '#2e7d32',
        },
      },
      // Add custom typography settings
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      },
      // Add custom component overrides
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
          },
        },
      },
    });
  }, [mode, templates]);

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
      <CacheProvider value={cacheRtl}>
        <MUIThemeProvider theme={theme}>{children}</MUIThemeProvider>
      </CacheProvider>
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useTheme = () => useContext(ThemeContext);
