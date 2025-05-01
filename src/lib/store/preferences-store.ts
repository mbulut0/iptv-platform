import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserPreferences, FavoriteItem, WatchHistoryItem } from '@/types/content';

interface PreferencesState {
  preferences: UserPreferences;
  favorites: FavoriteItem[];
  watchHistory: WatchHistoryItem[];
  
  // Preferences actions
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  
  // Favorites actions
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string, type: 'live' | 'movie' | 'series') => void;
  isFavorite: (id: string, type: 'live' | 'movie' | 'series') => boolean;
  
  // Watch history actions
  addToWatchHistory: (item: WatchHistoryItem) => void;
  updateWatchProgress: (id: string, progress: number) => void;
  removeFromWatchHistory: (id: string) => void;
  clearWatchHistory: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'tr',
  parentalControlEnabled: false,
  parentalControlPin: '0000',
  autoPlayNext: true,
  defaultSubtitleLanguage: 'tr',
  defaultAudioLanguage: 'tr',
  bufferSize: 30,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      preferences: defaultPreferences,
      favorites: [],
      watchHistory: [],
      
      // Preferences actions
      updatePreferences: (newPreferences) => 
        set((state) => ({ 
          preferences: { ...state.preferences, ...newPreferences } 
        })),
      
      resetPreferences: () => set({ preferences: defaultPreferences }),
      
      // Favorites actions
      addFavorite: (item) => {
        const { favorites } = get();
        const exists = favorites.some(
          (f) => f.id === item.id && f.type === item.type
        );
        
        if (!exists) {
          set({ favorites: [...favorites, { ...item, addedAt: new Date().toISOString() }] });
        }
      },
      
      removeFavorite: (id, type) => {
        const { favorites } = get();
        set({
          favorites: favorites.filter(
            (item) => !(item.id === id && item.type === type)
          ),
        });
      },
      
      isFavorite: (id, type) => {
        const { favorites } = get();
        return favorites.some((item) => item.id === id && item.type === type);
      },
      
      // Watch history actions
      addToWatchHistory: (item) => {
        const { watchHistory } = get();
        const existingIndex = watchHistory.findIndex(
          (h) => h.id === item.id && h.type === item.type
        );
        
        if (existingIndex !== -1) {
          // Update existing item
          const updatedHistory = [...watchHistory];
          updatedHistory[existingIndex] = {
            ...updatedHistory[existingIndex],
            ...item,
            lastWatched: new Date().toISOString(),
          };
          set({ watchHistory: updatedHistory });
        } else {
          // Add new item
          set({
            watchHistory: [
              { ...item, lastWatched: new Date().toISOString() },
              ...watchHistory,
            ].slice(0, 100), // Limit history to 100 items
          });
        }
      },
      
      updateWatchProgress: (id, progress) => {
        const { watchHistory } = get();
        const existingIndex = watchHistory.findIndex((h) => h.id === id);
        
        if (existingIndex !== -1) {
          const updatedHistory = [...watchHistory];
          updatedHistory[existingIndex] = {
            ...updatedHistory[existingIndex],
            progress,
            lastWatched: new Date().toISOString(),
          };
          set({ watchHistory: updatedHistory });
        }
      },
      
      removeFromWatchHistory: (id) => {
        const { watchHistory } = get();
        set({
          watchHistory: watchHistory.filter((item) => item.id !== id),
        });
      },
      
      clearWatchHistory: () => set({ watchHistory: [] }),
    }),
    {
      name: 'iptv-preferences-storage',
    }
  )
);