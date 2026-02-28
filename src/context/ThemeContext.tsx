import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { themes, ThemeType, ThemeColors } from '../components/themes';

interface ThemeContextType {
  currentTheme: ThemeType;
  colors: ThemeColors;
  setTheme: (theme: ThemeType) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Try to load AsyncStorage safely
let AsyncStorage: any = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  // AsyncStorage not available, will use in-memory storage only
}

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('emerald');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme on mount (if AsyncStorage available)
  useEffect(() => {
    const loadTheme = async () => {
      if (AsyncStorage) {
        try {
          const savedTheme = await AsyncStorage.getItem('app_theme');
          if (savedTheme && (themes[savedTheme as ThemeType] !== undefined)) {
            setCurrentTheme(savedTheme as ThemeType);
          }
        } catch (error) {
          // Silently fail - theme stays as default
        }
      }
      setIsLoading(false);
    };

    loadTheme();
  }, []);

  const setTheme = (theme: ThemeType) => {
    setCurrentTheme(theme);
    
    // Try to persist if AsyncStorage available
    if (AsyncStorage) {
      AsyncStorage.setItem('app_theme', theme).catch(() => {
        // Silently fail - theme is already updated in UI
      });
    }
  };

  const value: ThemeContextType = {
    currentTheme,
    colors: themes[currentTheme],
    setTheme,
    isLoading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
