"use client"
import React from "react";
import { Users } from "lucide-react";
import Image from "next/image";


export default function BackofficeHeader() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Image src="/austral-logo.png" alt="Universidad Austral" width={64} height={64} className="mr-4" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Portal Finanzas</h1>
              <p className="text-sm text-gray-600">Universidad</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">Equipo Finanzas</div>
              <div className="text-gray-500">Administrador</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
