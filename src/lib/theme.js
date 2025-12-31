import React, { createContext, useState, useEffect } from 'react';

let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  AsyncStorage = null;
}

export const ThemeContext = createContext();

export const lightTheme = {
  primary: '#3b82f6',
  secondary: '#10b981',
  background: '#f3f4f6',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  shadow: '#000'
};

export const darkTheme = {
  primary: '#7c3aed',
  secondary: '#a78bfa',
  background: '#0f0a1f',
  surface: '#1a1233',
  text: '#f0e9ff',
  textSecondary: '#c4b5fd',
  border: '#3730a3',
  shadow: '#000'
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    if (AsyncStorage) {
      try {
        const saved = await AsyncStorage.getItem('@arc_theme');
        if (saved) {
          setIsDark(saved === 'dark');
        }
      } catch (e) {
        console.warn('Failed to load theme', e);
      }
    }
    setLoaded(true);
  };

  const toggleTheme = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    if (AsyncStorage) {
      try {
        await AsyncStorage.setItem('@arc_theme', newValue ? 'dark' : 'light');
      } catch (e) {
        console.warn('Failed to save theme', e);
      }
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, loaded }}>
      {children}
    </ThemeContext.Provider>
  );
}
