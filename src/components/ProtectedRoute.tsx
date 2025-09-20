'use client';

import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'ADMINISTRADOR' | 'DIRECTOR';
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackPath = '/login' 
}: ProtectedRouteProps) {
  const { user, userRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(fallbackPath);
        return;
      }

      if (requiredRole && userRole !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        const dashboardPath = userRole === 'ADMINISTRADOR' 
          ? '/backoffice/dashboard' 
          : '/directors-home';
        router.push(dashboardPath);
        return;
      }
    }
  }, [user, userRole, isLoading, requiredRole, fallbackPath, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-white">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or wrong role
  if (!user || (requiredRole && userRole !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
