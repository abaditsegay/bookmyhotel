import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createAppTheme } from '../theme/theme';

export type ThemeMode = 'light' | 'dark';
export type ThemePreference = ThemeMode | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  themePreference: ThemePreference;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = 'bookmyhotel-theme';

const getSystemThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getStoredThemePreference = (): ThemePreference => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
    return savedTheme;
  }

  return 'system';
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themePreference, setThemePreference] = useState<ThemePreference>(getStoredThemePreference);
  const [systemThemeMode, setSystemThemeMode] = useState<ThemeMode>(getSystemThemeMode);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemThemeMode(event.matches ? 'dark' : 'light');
    };

    setSystemThemeMode(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const themeMode = themePreference === 'system' ? systemThemeMode : themePreference;

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themePreference);
    document.documentElement.dataset.theme = themeMode;
    document.documentElement.dataset.themePreference = themePreference;
    document.documentElement.style.colorScheme = themeMode;
  }, [themeMode, themePreference]);

  const setThemeMode = (mode: ThemePreference) => {
    setThemePreference(mode);
  };

  const toggleTheme = () => {
    setThemePreference(themeMode === 'dark' ? 'light' : 'dark');
  };

  const currentTheme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, themePreference, toggleTheme, setThemeMode }}>
      <MuiThemeProvider theme={currentTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};