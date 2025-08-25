"use client"
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Users, BarChart3, LogIn, UserCheck } from "lucide-react";
import { useAuth } from "@/components/AuthContext";

const Page = () => {
  const router = useRouter();
  const { userRole, setTestRole } = useAuth();

  useEffect(() => {
    // Redirigir automáticamente según el rol del usuario
    if (userRole === 'director') {
      router.push('/directors-home');
    } else if (userRole === 'finance') {
      router.push('/backoffice/budgets');
    }
  }, [userRole, router]);

  // Si ya hay un rol seleccionado, mostrar loading mientras redirige
  if (userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Building2 className="w-16 h-16 text-blue-600 mr-4" />
            <div>
              <h1 className="budget-title">Sistema de Gestión de Presupuestos</h1>
              <p className="text-xl text-gray-600 mt-2">Universidad</p>
            </div>
          </div>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
            Plataforma integral para la gestión, análisis y aprobación de presupuestos universitarios
          </p>
          
          {/* Login Simulation */}
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto mb-8">
            <div className="flex items-center justify-center mb-4">
              <LogIn className="w-8 h-8 text-blue-600 mr-2" />
              <h2 className="secondary-title">Acceso al Sistema</h2>
            </div>
            <p className="text-gray-600 mb-6">Selecciona tu perfil para continuar</p>
            
            {/* Role Selection - Only for testing */}
            <div className="space-y-4">
              <button
                onClick={() => setTestRole('director')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <Users className="w-5 h-5 mr-2" />
                Acceder como Director de Cátedra
              </button>
              
              <button
                onClick={() => setTestRole('finance')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Acceder como Equipo de Finanzas
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                <UserCheck className="w-4 h-4 inline mr-1" />
                En producción, el acceso se determina automáticamente según tus credenciales
              </p>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Directors Features */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="secondary-title">Portal Directores</h2>
                  <p className="text-gray-600">Directores de Cátedra</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Crear y gestionar presupuestos
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Seguimiento de estados
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Gestión por áreas académicas
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Comunicación con finanzas
                </div>
              </div>
            </div>
          </div>

          {/* Finance Features */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <BarChart3 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="secondary-title">Portal Finanzas</h2>
                  <p className="text-gray-600">Equipo de Finanzas</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Revisar todos los presupuestos
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Análisis y estadísticas avanzadas
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Gestión de estados y aprobaciones
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Control de directores y calendario
                </div>
              </div>
            </div>
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

export default Page;
