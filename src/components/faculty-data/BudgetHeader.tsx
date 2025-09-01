"use client"
import React from "react";

interface BudgetHeaderProps {
  name: string;
  description: string;
  faculty: string;
  area: string;
  status: string;
  lastModifiedISO: string;
  getStatusIcon?: (status: string) => React.ReactNode;
  getStatusText: (status: string) => string;
  getStatusColor: (status: string) => string;
}

export default function BudgetHeader({
  name,
  description,
  faculty,
  area,
  status,
  lastModifiedISO,
  getStatusIcon,
  getStatusText,
  getStatusColor,
}: BudgetHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>
          <p className="text-gray-600 mb-6">{description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div className="flex flex-col">
              <span className="text-gray-600 mb-1">Facultad:</span>
              <span className="font-medium text-gray-900">{faculty}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-600 mb-1">Área:</span>
              <span className="font-medium text-gray-900">{area}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-600 mb-1">Estatus:</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border w-fit ${getStatusColor(status)}`}>
                {getStatusIcon ? getStatusIcon(status) : null}
                <span className="ml-1">{getStatusText(status)}</span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-600 mb-1">Última modificación:</span>
              <span className="font-medium text-gray-900">{new Date(lastModifiedISO).toLocaleDateString('es-AR')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


