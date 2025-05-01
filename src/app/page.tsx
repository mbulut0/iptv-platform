'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

export default function Home() {
  const router = useRouter();
  const { session } = useAuthStore();

  useEffect(() => {
    // If user is authenticated, redirect to the authenticated home page
    if (session?.isAuthenticated) {
      router.replace('/dashboard');
    } else {
      // If not authenticated, redirect to login page
      router.replace('/login');
    }
  }, [session, router]);

  // Show a loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse text-center">
        <p className="text-lg">Yükleniyor...</p>
        <p className="text-sm text-muted-foreground">Yönlendiriliyor</p>
      </div>
    </div>
  );
}
