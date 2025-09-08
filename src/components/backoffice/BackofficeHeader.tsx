"use client"
import React from "react";
import { Users } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";


export default function BackofficeHeader() {
  const { userRole, user } = useAuth();
  const router = useRouter();
  const isDirector = userRole === 'director';
  const profileTitle = isDirector ? (user?.name || 'Director') : 'Equipo Finanzas';

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
                onClick={() => router.push('/backoffice/archivo')}
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

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">{profileTitle}</div>
              <div className="text-gray-500">{isDirector ? 'Director' : 'Administrador'}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
