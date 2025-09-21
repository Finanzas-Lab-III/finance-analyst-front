'use client';

import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // The main page will handle the redirect based on userRole cookie
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      // Redirect will happen automatically due to useEffect above
    } catch (error) {
      setError('Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if user is already logged in (to prevent flash)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-600">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Sistema de Gestión Financiera
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error de autenticación
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md focus:z-10 sm:text-sm bg-white"
                placeholder="tu@email.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md focus:z-10 sm:text-sm bg-white"
                placeholder="Tu contraseña"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Credenciales de prueba</span>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-400 space-y-1">
              <p>
                <strong>Director:</strong>{' '}
                <button
                  type="button"
                  onClick={() => {
                    setEmail('director@universidad.edu');
                    setPassword('password123');
                  }}
                  className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                >
                  director@universidad.edu / password123
                </button>
              </p>
              <p>
                <strong>Finance:</strong>{' '}
                <button
                  type="button"
                  onClick={() => {
                    setEmail('finanzas@universidad.edu');
                    setPassword('password123');
                  }}
                  className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                >
                  finanzas@universidad.edu / password123
                </button>
              </p>
              <p>
                <strong>Admin:</strong>{' '}
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@mail.austral.edu.ar');
                    setPassword('password123');
                  }}
                  className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                >
                  admin@mail.austral.edu.ar / password123
                </button>
              </p>
              <p>
                <strong>Director Ing:</strong>{' '}
                <button
                  type="button"
                  onClick={() => {
                    setEmail('director-ing@mail.austral.edu.ar');
                    setPassword('password123');
                  }}
                  className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                >
                  director-ing@mail.austral.edu.ar / password123
                </button>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
