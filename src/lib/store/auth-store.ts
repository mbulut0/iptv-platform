import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { XtreamCredentials, UserSession, AuthResponse } from '@/types/auth';

interface AuthState {
  session: UserSession | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: XtreamCredentials, authResponse: AuthResponse) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      isLoading: false,
      error: null,
      login: (credentials, authResponse) => {
        const session: UserSession = {
          credentials,
          userInfo: authResponse.user_info,
          serverInfo: authResponse.server_info,
          isAuthenticated: true,
        };
        set({ session, isLoading: false, error: null });
      },
      logout: () => {
        set({ session: null, isLoading: false, error: null });
      },
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'iptv-auth-storage',
      partialize: (state) => ({ session: state.session }),
    }
  )
);