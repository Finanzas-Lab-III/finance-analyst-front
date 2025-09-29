"use client"
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users,
  FileCheck
} from "lucide-react";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/backoffice/dashboard",
    icon: Home,
  },
  {
    name: "Gestión de Usuarios",
    href: "/backoffice/users",
    icon: Users,
  },
  {
    name: "Revisión de Documentos",
    href: "/backoffice/document-review",
    icon: FileCheck,
  },
];

export default function BackofficeNavigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/backoffice") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
          Navegación
        </h2>
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-t border-gray-200 mt-8">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
          Resumen Rápido
        </h3>
        <div className="space-y-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-800">Pendientes</span>
              <span className="text-lg font-bold text-yellow-900">12</span>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">En Revisión</span>
              <span className="text-lg font-bold text-blue-900">8</span>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-800">Aprobados</span>
              <span className="text-lg font-bold text-green-900">24</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
