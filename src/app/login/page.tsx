'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/login-form';
import { useAuthStore } from '@/lib/store/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const { session } = useAuthStore();
  
  // Redirect to home if already authenticated
  useEffect(() => {
    if (session?.isAuthenticated) {
      router.push('/');
    }
  }, [session, router]);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <LoginForm />
    </div>
  );
}