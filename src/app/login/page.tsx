'use client';

import { useAuth } from '@/components/AuthContext';
import LoginForm from '@/components/LoginForm';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, login, isLoading, error } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/backoffice/dashboard');
    }
  }, [user, router]);

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      // Redirect will happen automatically due to useEffect above
    } catch (error) {
      // Error is handled by AuthContext
      console.error('Login error:', error);
    }
  };

  // Don't render if user is already logged in (to prevent flash)
  if (user) {
    return null;
  }

  return (
    <LoginForm
      onLogin={handleLogin}
      isLoading={isLoading}
      error={error}
    />
  );
}
