'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileSpreadsheet } from 'lucide-react';
import { useFileContext } from '@/components/FileContext';
import SpreadsheetViewer from '@/components/SpreadsheetViewer';
import BudgetSidebar from '@/components/sidebar/BudgetSidebar';
import AIAgentSidebar from '@/components/sidebar/ai-agent-sidebar/AIAgentSidebar';

const Page: React.FC = () => {
  const { selectedFile } = useFileContext();

  if (!selectedFile) {
    return (
      <div className="flex h-screen bg-gray-900">
        <BudgetSidebar currentPage="seguimiento" />
        <div className="flex flex-col flex-1 h-full text-white">
        <div className="p-6">
          <div className="mb-4 flex items-center">
            <Link
              href="/budget/lab-budget-2025"
              className="p-2 rounded-full hover:bg-gray-800 mr-4 transition-colors duration-200"
            >
              <ArrowLeft size={24} className="text-white" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Seguimiento de Presupuesto</h1>
              <p className="text-gray-400 text-sm">No hay archivo seleccionado</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400 max-w-md">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                <FileSpreadsheet size={40} className="text-gray-500" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Selecciona un archivo para continuar</h2>
              <p className="text-lg mb-6">Utiliza el panel de la izquierda para seleccionar un archivo de presupuesto y comenzar el seguimiento.</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-left">
              <h3 className="font-semibold mb-2 text-white">¿Cómo empezar?</h3>
              <ol className="text-sm space-y-1 text-gray-300">
                <li>1. Mira el panel izquierdo "Seleccionar Archivo"</li>
                <li>2. Navega por las carpetas disponibles</li>
                <li>3. Haz clic en un archivo .xlsx para cargarlo</li>
                <li>4. El seguimiento se mostrará automáticamente</li>
              </ol>
            </div>
          </div>
                </div>
      </div>
      {selectedFile && <AIAgentSidebar />}
    </div>
  );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <BudgetSidebar currentPage="seguimiento" />
      <div className="flex flex-col flex-1 h-full text-white">
      <div className="p-6">
        <div className="mb-4 flex items-center">
          <Link
            href="/budget/lab-budget-2025"
            className="p-2 rounded-full hover:bg-gray-800 mr-4 transition-colors duration-200"
          >
            <ArrowLeft size={24} className="text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Seguimiento de Presupuesto</h1>
            <div className="flex items-center text-gray-400 text-sm mt-1">
              <FileSpreadsheet size={14} className="mr-1" />
              <span>{selectedFile?.split('/').pop() || selectedFile}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 px-6 pb-6">
        <div className="bg-white rounded-lg shadow-sm h-full overflow-auto">
          <SpreadsheetViewer />
        </div>
      </div>
      </div>
    </div>
  );
};

export default Page;