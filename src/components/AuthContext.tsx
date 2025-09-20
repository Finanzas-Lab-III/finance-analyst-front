"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, LoginResponse } from '@/api/authService';

// Simple cookie helpers (client-side only)
function setCookie(name: string, value: string, days: number = 365) {
  try {
    const maxAge = days * 24 * 60 * 60; // seconds
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`;
  } catch {}
}

function getCookie(name: string): string | null {
  try {
    const cookies = document.cookie ? document.cookie.split(";") : [];
    for (const c of cookies) {
      const [k, ...rest] = c.trim().split("=");
      if (k === name) return decodeURIComponent(rest.join("="));
    }
  } catch {}
  return null;
}

function deleteCookie(name: string) {
  try {
    document.cookie = `${name}=; path=/; max-age=0`;
  } catch {}
}

export type UserRole = 'ADMINISTRADOR' | 'DIRECTOR' | null;

interface User {
  id: number;
  name: string;
  email: string;
  role: Exclude<UserRole, null>;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  userRole: UserRole;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  setTestRole: (role: UserRole) => void; // Solo para testing
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users para testing (fallback)
const mockUsers: Record<string, User> = {
  'director@universidad.edu': {
    id: 2,
    name: 'Santiago Ascasibar',
    email: 'director@universidad.edu',
    role: 'DIRECTOR',
    department: 'Ingeniería'
  },
  'finanzas@universidad.edu': {
    id: 1,
    name: 'Ana Martínez',
    email: 'finanzas@universidad.edu',
    role: 'ADMINISTRADOR',
    department: 'Finanzas'
  },
  // Credenciales solicitadas
  'admin@mail.austral.edu.ar': {
    id: 1,
    name: 'Admin Finanzas',
    email: 'admin@mail.austral.edu.ar',
    role: 'ADMINISTRADOR',
    department: 'Finanzas'
  },
  'director-ing@mail.austral.edu.ar': {
    id: 2,
    name: 'Director Ingeniería',
    email: 'director-ing@mail.austral.edu.ar',
    role: 'DIRECTOR',
    department: 'Ingeniería'
  }
};

const DEFAULT_DIRECTOR_ID = 2;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Restaurar desde localStorage
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
    const savedRole = typeof window !== 'undefined' ? (localStorage.getItem('userRole') as UserRole) : null;

    if (savedUser && savedRole) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setUserRole(savedRole);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        // Clear invalid data
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole');
      }
    }
  }, []);

  // Enforce default director id when role is director
  useEffect(() => {
    if (userRole === 'DIRECTOR') {
      const defaultDirector = Object.values(mockUsers).find(
        (u) => u.role === 'DIRECTOR' && u.id === DEFAULT_DIRECTOR_ID
      ) || Object.values(mockUsers).find((u) => u.role === 'DIRECTOR');
      if (defaultDirector && user?.id !== defaultDirector.id) {
        setUser(defaultDirector);
        localStorage.setItem('currentUser', JSON.stringify(defaultDirector));
        localStorage.setItem('userRole', 'DIRECTOR');
        setCookie('userRole', 'DIRECTOR');
      }
    }
  }, [userRole]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try real API first
      const response: LoginResponse = await loginUser(email, password);
      
      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        department: response.user.role === 'ADMINISTRADOR' ? 'Finanzas' : 'Facultad'
      };
      
      setUser(userData);
      setUserRole(userData.role);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('userRole', userData.role);
      setCookie('userRole', userData.role);
      setCookie('userId', userData.id.toString());
      
    } catch (apiError) {
      // Fallback to mock users for testing
      console.warn('API login failed, trying mock users:', apiError);
      
      const mockUser = mockUsers[email];
      if (mockUser && password === 'password123') {
        setUser(mockUser);
        setUserRole(mockUser.role);
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        localStorage.setItem('userRole', mockUser.role);
        setCookie('userRole', mockUser.role);
        setCookie('userId', mockUser.id.toString());
      } else {
        const errorMessage = apiError instanceof Error ? apiError.message : 'Credenciales inválidas';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setUserRole(null);
    setError(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    deleteCookie('userRole');
    deleteCookie('userId');
  };

  // Función para testing - cambiar rol rápidamente
  const setTestRole = (role: UserRole) => {
    if (role) {
      let testUser: User | undefined;
      if (role === 'DIRECTOR') {
        testUser = Object.values(mockUsers).find(u => u.role === 'DIRECTOR' && u.id === DEFAULT_DIRECTOR_ID);
        if (!testUser) {
          testUser = Object.values(mockUsers).find(u => u.role === 'DIRECTOR');
        }
      } else {
        testUser = Object.values(mockUsers).find(u => u.role === role);
      }
      if (testUser) {
        setUser(testUser);
        setUserRole(role);
        localStorage.setItem('currentUser', JSON.stringify(testUser));
        localStorage.setItem('userRole', role);
        setCookie('userRole', role);
        setCookie('userId', testUser.id.toString());
      }
    } else {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      login,
      logout,
      isLoading,
      error,
      setTestRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
