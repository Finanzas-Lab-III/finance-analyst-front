"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';

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

export type UserRole = 'director' | 'finance' | null;

interface User {
  id: string;
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
  setTestRole: (role: UserRole) => void; // Solo para testing
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API endpoint for authentication
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const AUTH_API_URL = '/api/auth/login/';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);

  useEffect(() => {
    // Restaurar desde cookie primero y luego fallback a localStorage
    const cookieRole = (getCookie('userRole') as UserRole) || null;
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
    const savedRole = typeof window !== 'undefined' ? (localStorage.getItem('testRole') as UserRole) : null;

    if (cookieRole) {
      // Usar helper de testing para hidratar usuario falso acorde al rol
      setTestRole(cookieRole);
      return;
    }

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    if (savedRole) {
      setUserRole(savedRole);
    }
  }, []);

  // Enforce default director id when role is director
  useEffect(() => {
    // Keep track of role changes
    if (userRole && user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('testRole', userRole);
      setCookie('userRole', userRole);
    }
  }, [userRole, user]);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch(API_BASE + AUTH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Credenciales inválidas');
        }
        throw new Error('Error en el servidor');
      }

      const data = await response.json();
      const { user } = data;
      
      setUser(user);
      setUserRole(user.role);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('testRole', user.role);
      setCookie('userRole', user.role);
      setCookie('userId', user.id);
    } catch (error) {
      throw error instanceof Error ? error : new Error('Error en el servidor');
    }
  };

  const logout = () => {
    setUser(null);
    setUserRole(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('testRole');
    deleteCookie('userRole');
    deleteCookie('userId');
  };

  // Function for testing - quickly change role
  const setTestRole = (role: UserRole) => {
    if (!role) {
      logout();
      return;
    }
    
    // In a real implementation, this should be removed or replaced with proper role management
    console.warn('setTestRole is deprecated and should not be used in production');
  };

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      login,
      logout,
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
