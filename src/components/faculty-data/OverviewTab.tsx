"use client"
import React from "react";
import { FileText } from "lucide-react";
import { BudgetDetail } from "./types";

interface OverviewTabProps {
  budget: BudgetDetail;
  formatCurrency: (amount: number) => string;
}

export default function OverviewTab({ budget, formatCurrency }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Información General</h3>
          <div className="space-y-2 text-sm">
            <div><span className="text-gray-600">Facultad:</span> <span className="font-medium text-gray-900">{budget.faculty}</span></div>
            <div><span className="text-gray-600">Área:</span> <span className="font-medium text-gray-900">{budget.area}</span></div>
            <div><span className="text-gray-600">Total de ítems:</span> <span className="font-medium text-gray-900">{budget.items.length}</span></div>
            <div><span className="text-gray-600">Última modificación:</span> <span className="font-medium text-gray-900">{new Date(budget.lastModified).toLocaleDateString('es-AR')}</span></div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Archivos</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-4 h-4 text-gray-600 mr-2" />
                <span className="text-sm text-gray-900 font-medium">{budget.originalBudget}</span>
              </div>
              <button className="text-blue-600 hover:text-blue-800">
                Descargar
              </button>
            </div>
            {budget.financeBudget && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 text-gray-600 mr-2" />
                  <span className="text-sm text-gray-900 font-medium">{budget.financeBudget}</span>
                </div>
                <button className="text-blue-600 hover:text-blue-800">
                  Descargar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Resumen de Ítems</h3>
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recurso</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meses</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {budget.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.nombre_recurso}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.tipo_contratacion}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.meses}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(item.costo_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


