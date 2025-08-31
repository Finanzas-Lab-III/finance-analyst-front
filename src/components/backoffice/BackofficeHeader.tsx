"use client"
import React from "react";
import { Users, Bell, Settings } from "lucide-react";
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
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <Settings className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
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
