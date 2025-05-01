'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { session } = useAuthStore();
  
  useEffect(() => {
    if (!session?.isAuthenticated) {
      router.push('/login');
    }
  }, [session, router]);
  
  if (!session?.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-lg">Yükleniyor...</p>
          <p className="text-sm text-muted-foreground">Oturum kontrol ediliyor</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}