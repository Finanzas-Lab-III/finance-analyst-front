'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Home, 
  Settings, 
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';
import ResizableSidebar from './ResizableSidebar';
import FileTree from '../FileTree';
import { useFileContext } from '../FileContext';

interface BudgetSidebarProps {
  currentPage: 'armado' | 'seguimiento';
}

const BudgetSidebar: React.FC<BudgetSidebarProps> = ({ currentPage }) => {
  const { setSelectedFile } = useFileContext();

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
  };

  const navigationItems = [
    {
      href: '/faculty-old-year/lab-faculty-old-year-2025',
      icon: Home,
      label: 'Vista General',
      active: false
    },
    {
      href: '/armado',
      icon: Settings,
      label: 'Armado',
      active: currentPage === 'armado'
    },
    {
      href: '/seguimiento',
      icon: BarChart3,
      label: 'Seguimiento',
      active: currentPage === 'seguimiento'
    }
  ];



  return (
    <ResizableSidebar
      defaultWidth={280}
      minWidth={240}
      maxWidth={400}
      position="left"
      className="bg-[#1e1e1e] text-white border-r border-gray-700"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Presupuesto Laboratorio</h2>
          <p className="text-sm text-gray-400">Gestión de presupuesto 2025</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation Section */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Navegación</h3>
            <div className="space-y-1">
              {navigationItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                    item.active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon size={16} className="mr-3" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* File Selection Section - Only show on seguimiento page */}
          {currentPage === 'seguimiento' && (
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                <FileSpreadsheet size={16} className="mr-2" />
                Seleccionar Archivo
              </h3>
              <div className="text-xs text-gray-400 mb-3">
                Selecciona un archivo para ver el seguimiento
              </div>
              <div className="max-h-64 overflow-y-auto">
                <FileTree onFileSelect={handleFileSelect} />
              </div>
            </div>
          )}
        </div>

        {/* Footer with current page indicator */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center text-sm text-gray-400">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              currentPage === 'armado' ? 'bg-blue-500' : 'bg-green-500'
            }`}></div>
            <span className="capitalize">{currentPage}</span>
          </div>
        </div>
      </div>
    </ResizableSidebar>
  );
};

export default BudgetSidebar; 