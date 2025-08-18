"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'director' | 'finance' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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
    name: 'Dr. Juan Pérez',
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
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('currentUser');
    const savedRole = localStorage.getItem('testRole') as UserRole;
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    if (savedRole) {
      setUserRole(savedRole);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // Simulación de login
    const user = mockUsers[email];
    
    if (user && password === 'password') { // Password simple para testing
      setUser(user);
      setUserRole(user.role);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('testRole', user.role);
    } else {
      throw new Error('Credenciales inválidas');
    }
  };

  const logout = () => {
    setUser(null);
    setUserRole(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('testRole');
  };

  // Función para testing - cambiar rol rápidamente
  const setTestRole = (role: UserRole) => {
    if (role) {
      const testUser = Object.values(mockUsers).find(u => u.role === role);
      if (testUser) {
        setUser(testUser);
        setUserRole(role);
        localStorage.setItem('currentUser', JSON.stringify(testUser));
        localStorage.setItem('testRole', role);
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
