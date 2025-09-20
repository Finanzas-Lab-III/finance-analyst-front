'use client';

import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const { user, userRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }

      // Redirect based on user role
      if (userRole === 'ADMINISTRADOR') {
        router.push('/backoffice/dashboard');
      } else if (userRole === 'DIRECTOR') {
        router.push('/directors-home');
      } else {
        router.push('/login');
      }
    }
  }, [user, userRole, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-white">Cargando...</p>
        </div>
      </div>
    );
  }

  return null;
}
