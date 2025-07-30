'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { themes, loadTheme, saveTheme, applyTheme, type Theme } from '@/lib/themes';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  themes: Record<string, Theme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(loadTheme());

  useEffect(() => {
    // Apply theme on mount
    applyTheme(currentTheme);
  }, []);

  const setTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    saveTheme(theme.id);
    applyTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};