import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useContentStore } from '@/lib/store/content-store';
import { XtreamCredentials } from '@/types/auth';
import { authenticate, isValidXtreamUrl } from '@/lib/api/xtream';

export function useAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { session, login, logout } = useAuthStore();
  const { clearContent } = useContentStore();
  
  const handleLogin = async (credentials: XtreamCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate URL format
      if (!isValidXtreamUrl(credentials.server)) {
        throw new Error('Geçersiz sunucu URL formatı. Lütfen http:// veya https:// ile başlayan geçerli bir URL girin.');
      }
      
      // Authenticate with Xtream API
      const authResponse = await authenticate(credentials);
      
      // Check if authentication was successful
      if (authResponse.user_info.auth !== 1) {
        throw new Error('Kimlik doğrulama başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
      
      // Store session in Zustand store
      login(credentials, authResponse);
      
      // Redirect to home page
      router.push('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Giriş yapılırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    clearContent();
    router.push('/login');
  };
  
  return {
    isAuthenticated: !!session?.isAuthenticated,
    session,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    clearError: () => setError(null),
  };
}