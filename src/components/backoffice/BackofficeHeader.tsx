"use client"
import React, { useState, useEffect, useRef } from "react";
import { Users, LogOut, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";


export default function BackofficeHeader() {
  const { userRole, user, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isDirector = userRole === 'DIRECTOR';
  const profileTitle = isDirector ? (user?.name || 'Director') : (user?.name || 'Administrador');

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Image src="/austral-logo.png" alt="Universidad Austral" width={64} height={64} className="mr-4" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{isDirector ? 'Portal Directores' : 'Portal Finanzas'}</h1>
              <p className="text-sm text-gray-600">Universidad</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {!isDirector && (
            <div className="hidden sm:flex items-center space-x-2">
              <button
                type="button"
                onClick={() => router.push('/backoffice/archive')}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                Facultades
              </button>
              <button
                type="button"
                onClick={() => router.push('/backoffice/usuarios')}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                Usuarios
              </button>
            </div>
          )}

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm text-left">
                <div className="font-medium text-gray-900">{profileTitle}</div>
                <div className="text-gray-500">{isDirector ? 'Director' : 'Administrador'}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                  <div className="font-medium">{user?.email}</div>
                  <div className="text-gray-500">{user?.department}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    router.push('/login');
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
