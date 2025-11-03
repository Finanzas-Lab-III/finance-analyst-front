"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '@/lib/user-api';
import { NavBarData } from '@/types/profile';

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
const API_BASE = process.env.NEXT_PUBLIC_SERVICE_URL;
const AUTH_API_URL = '/api/auth/login/';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);

  // Function to load real user from backend
  const loadRealUser = async () => {
    try {
      const profile = await getProfile();
      if (profile) {
        // Convert NavBarData to User format
        const realUser: User = {
          id: profile.id?.toString() || "1",
          name: profile.name || "",
          email: profile.email || "",
          role: (profile.role?.toLowerCase() as Exclude<UserRole, null>) || "director",
          department: "Real User"
        };
        
        setUser(realUser);
        setUserRole(realUser.role);
        
        // Save to localStorage for persistence
        localStorage.setItem('currentUser', JSON.stringify(realUser));
        localStorage.setItem('testRole', realUser.role);
        setCookie('userRole', realUser.role);
        setCookie('userId', realUser.id);
        
        console.log('✅ Real user loaded:', realUser);
        return realUser;
      }
    } catch (error) {
      console.warn('⚠️ Could not load real user, falling back to mock data:', error);
      return null;
    }
  };

  useEffect(() => {
    // Try to load real user first
    const initializeUser = async () => {
      const realUser = await loadRealUser();
      
      if (!realUser) {
        // Fallback to saved data or mock
        const cookieRole = (getCookie('userRole') as UserRole) || null;
        const savedUser = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
        const savedRole = typeof window !== 'undefined' ? (localStorage.getItem('testRole') as UserRole) : null;

        if (cookieRole) {
          setTestRole(cookieRole);
          return;
        }

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

        if (savedRole) {
          setUserRole(savedRole);
        }
      }
    };
    
    initializeUser();
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
    
    // Set mock user based on role for testing
    const mockUser: User = {
      id: "1",
      name: "Ana López",
      email: "ana.lopez@austral.edu.ar", 
      role: role as Exclude<UserRole, null>,
      department: "Finanzas"
    };
    
    setUser(mockUser);
    setUserRole(role);
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    localStorage.setItem('testRole', role);
    setCookie('userRole', role);
    setCookie('userId', mockUser.id);
    
    console.log('Mock user set:', mockUser);
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
