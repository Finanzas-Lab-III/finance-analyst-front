"use client"
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Users, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";

const DirectorsHomePage = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <main className="min-h-screen bg-white text-gray-900">
      {/* Header with user info */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Portal Directores</h1>
              <p className="text-sm text-gray-600">Sistema de Gestión de Presupuestos</p>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm text-left">
                <div className="font-medium text-gray-900">{user?.name || 'Director'}</div>
                <div className="text-gray-500">Director</div>
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
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Main content header */}
        <div className="flex items-center mb-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900">Sistema de Gestión de Presupuestos</h2>
            <p className="text-gray-600 mt-1">Administra y supervisa todos los presupuestos de manera centralizada</p>
          </div>
        </div>

        {/* Main Budget Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Presupuestos - Facultad de Ingeniería</h2>
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <Link
              href="/presupuesto/ingenieria"
              className="block bg-white hover:bg-gray-100 rounded-lg p-6 transition-colors duration-200 border border-gray-200"
            >
              <h3 className="text-xl font-semibold text-gray-900">Presupuesto de Ingeniería</h3>
              <p className="text-gray-600 mt-2">Presupuesto general de la Facultad de Ingeniería</p>
            </Link>
          </div>
        </div>

        {/* Sub-areas Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Presupuestos de las sub áreas de la facultad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/presupuesto/laboratorio"
              className="bg-gray-50 hover:bg-gray-100 rounded-lg p-6 transition-colors duration-200 block border border-gray-200"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Presupuesto de Laboratorio</h3>
              <p className="text-gray-600 text-sm">Gestión del presupuesto del laboratorio de investigación</p>
            </Link>

            <Link
              href="/presupuesto/biomedica"
              className="bg-gray-50 hover:bg-gray-100 rounded-lg p-6 transition-colors duration-200 block border border-gray-200"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Presupuesto de Facultad Biomédica</h3>
              <p className="text-gray-600 text-sm">Presupuesto específico para el área biomédica</p>
            </Link>

            <Link
              href="/presupuesto/informatica"
              className="bg-gray-50 hover:bg-gray-100 rounded-lg p-6 transition-colors duration-200 block border border-gray-200"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Presupuesto de Informática</h3>
              <p className="text-gray-600 text-sm">Gestión presupuestaria del departamento de informática</p>
            </Link>

            <Link
              href="/presupuesto/industrial"
              className="bg-gray-50 hover:bg-gray-100 rounded-lg p-6 transition-colors duration-200 block border border-gray-200"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Presupuesto de Ingeniería Industrial</h3>
              <p className="text-gray-600 text-sm">Presupuesto del área de ingeniería industrial</p>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-600">
          <p className="text-sm">
            Sistema de Gestión de Presupuestos - Universidad © 2025
          </p>
        </div>
      </div>
    </main>
  );
};

export default DirectorsHomePage;
