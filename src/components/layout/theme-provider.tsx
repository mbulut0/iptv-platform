'use client';

import { useEffect } from 'react';
import { usePreferencesStore } from '@/lib/store/preferences-store';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { preferences } = usePreferencesStore();
  
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove the old theme
    root.classList.remove('light', 'dark');
    
    // Add the new theme
    if (preferences.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(preferences.theme);
    }
  }, [preferences.theme]);
  
  return <>{children}</>;
}