import { useState, useEffect } from 'react';
import { getCurrentUser, RealUser } from '@/lib/userManager';

export interface UseCurrentUserReturn {
  user: RealUser | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get current user information from backend
 * Now uses the improved user management system
 */
export function useCurrentUser(): UseCurrentUserReturn {
  const [user, setUser] = useState<RealUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        console.log(`👤 Usuario actual: ${currentUser.name} (ID: ${currentUser.id})`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al cargar usuario: ${errorMessage}`);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refetch = async () => {
    await fetchUser();
  };

  return {
    user,
    loading,
    error,
    refetch,
  };
}
