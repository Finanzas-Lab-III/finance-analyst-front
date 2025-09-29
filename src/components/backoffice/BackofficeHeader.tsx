"use client";
import React from "react";
import { Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { NavBarData } from "@/types/profile";

export default function BackofficeHeader({ profile }: { profile: NavBarData }) {
  const router = useRouter();

  const role = profile.role?.toUpperCase?.() ?? "";
  const isDirector = role === "DIRECTOR";
  const isAdmin = role === "ADMINISTRADOR";

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo + Título */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Image
              src="/austral-logo.png"
              alt="Universidad Austral"
              width={64}
              height={64}
              className="mr-4"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {isDirector ? "Portal Directores" : "Portal Finanzas"}
              </h1>
              <p className="text-sm text-gray-600">Universidad</p>
            </div>
          </div>
        </div>

        {/* Botones + Perfil */}
        <div className="flex items-center space-x-4">
          {!isDirector && (
            <div className="hidden sm:flex items-center space-x-2">
              {/* Botón Facultades se sigue mostrando para todos menos director */}
              <button
                type="button"
                onClick={() => router.push("/backoffice/archive")}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                Facultades
              </button>

              {/* Botón Usuarios solo para ADMINISTRADOR */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => router.push("/backoffice/usuarios")}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                >
                  Usuarios
                </button>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">{profile.name}</div>
              <div className="text-xs text-gray-400">{profile.email}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
