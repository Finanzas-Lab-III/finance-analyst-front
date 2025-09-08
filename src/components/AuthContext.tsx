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

// Mock users para testing
const mockUsers: Record<string, User> = {
  'director@universidad.edu': {
    id: '1',
    name: 'Santiago Ascasibar',
    email: 'director@universidad.edu',
    role: 'director',
    department: 'Ingeniería'
  },
  'finanzas@universidad.edu': {
    id: '2',
    name: 'Ana Martínez',
    email: 'finanzas@universidad.edu',
    role: 'finance',
    department: 'Finanzas'
  },
  // Credenciales solicitadas
  'admin@mail.austral.edu.ar': {
    id: '2',
    name: 'Admin Finanzas',
    email: 'admin@mail.austral.edu.ar',
    role: 'finance',
    department: 'Finanzas'
  },
  'director-ing@mail.austral.edu.ar': {
    id: '1',
    name: 'Director Ingeniería',
    email: 'director-ing@mail.austral.edu.ar',
    role: 'director',
    department: 'Ingeniería'
  }
};

const DEFAULT_DIRECTOR_ID = '1';

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
    if (userRole === 'director') {
      const defaultDirector = Object.values(mockUsers).find(
        (u) => u.role === 'director' && u.id === DEFAULT_DIRECTOR_ID
      ) || Object.values(mockUsers).find((u) => u.role === 'director');
      if (defaultDirector && user?.id !== defaultDirector.id) {
        setUser(defaultDirector);
        localStorage.setItem('currentUser', JSON.stringify(defaultDirector));
        localStorage.setItem('testRole', 'director');
        setCookie('userRole', 'director');
      }
    }
  }, [userRole]);

  const login = async (email: string, password: string): Promise<void> => {
    // Simulación de login
    const user = mockUsers[email];
    
    if (user && password === 'password123') { // Password simple para testing
      setUser(user);
      setUserRole(user.role);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('testRole', user.role);
      setCookie('userRole', user.role);
      setCookie('userId', user.id);
    } else {
      throw new Error('Credenciales inválidas');
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

  // Función para testing - cambiar rol rápidamente
  const setTestRole = (role: UserRole) => {
    if (role) {
      let testUser: User | undefined;
      if (role === 'director') {
        testUser = Object.values(mockUsers).find(u => u.role === 'director' && u.id === DEFAULT_DIRECTOR_ID);
        if (!testUser) {
          testUser = Object.values(mockUsers).find(u => u.role === 'director');
        }
      } else {
        testUser = Object.values(mockUsers).find(u => u.role === role);
      }
      if (testUser) {
        setUser(testUser);
        setUserRole(role);
        localStorage.setItem('currentUser', JSON.stringify(testUser));
        localStorage.setItem('testRole', role);
        setCookie('userRole', role);
        setCookie('userId', testUser.id);
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
