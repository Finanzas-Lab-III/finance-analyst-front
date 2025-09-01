"use client"
import React from "react";
import { AlertCircle, Download, FileText, X } from "lucide-react";

interface Variation {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
  description: string;
  fileName: string;
}

interface BudgetSnapshotInfo {
  faculty: string;
  area: string;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'in_review' | 'draft';
  items: Array<{
    id: number;
    nombre_recurso: string;
    tipo_contratacion: string;
    meses: number;
    remuneracion_bruta_mensual: number;
    costo_total: number;
  }>;
}

interface DocumentSnapshotModalProps {
  open: boolean;
  variation: Variation | null;
  budget: BudgetSnapshotInfo;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: BudgetSnapshotInfo['status']) => string;
  getStatusText: (status: BudgetSnapshotInfo['status']) => string;
}

export default function DocumentSnapshotModal({
  open,
  variation,
  budget,
  onClose,
  formatCurrency,
  getStatusColor,
  getStatusText,
}: DocumentSnapshotModalProps) {
  if (!open || !variation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Snapshot: {variation.name}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {variation.fileName} • {new Date(variation.createdAt).toLocaleDateString('es-AR')} • {variation.createdBy}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="p-6 h-full">
            <div className="bg-gray-50 rounded-lg p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Vista del documento</h4>
                    <p className="text-sm text-gray-600">{variation.description}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    <Download className="w-4 h-4" />
                    <span>Descargar</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 flex-1 overflow-auto">
                <div className="p-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Presupuesto Laboratorio 2025</h2>
                    <p className="text-gray-600">Versión: {variation.name}</p>
                    <p className="text-sm text-gray-500">Generado el {new Date(variation.createdAt).toLocaleDateString('es-AR')}</p>
                  </div>

                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">Resumen Presupuestario</h3>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Facultad:</p>
                            <p className="font-medium">{budget.faculty}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Área:</p>
                            <p className="font-medium">{budget.area}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Presupuestado:</p>
                            <p className="font-medium text-lg text-green-600">{formatCurrency(budget.totalAmount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Estado:</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(budget.status)}`}>
                              {getStatusText(budget.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">Detalle de Recursos</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recurso</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meses</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo Mensual</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {budget.items.map((item) => (
                              <tr key={item.id}>
                                <td className="px-4 py-3 text-sm text-gray-900">{item.nombre_recurso}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{item.tipo_contratacion}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{item.meses}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(item.remuneracion_bruta_mensual)}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(item.costo_total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">Cambios en esta versión</h4>
                          <p className="text-sm text-blue-700 mt-1">{variation.description}</p>
                          <p className="text-xs text-blue-600 mt-2">
                            Autor: {variation.createdBy} • Fecha: {new Date(variation.createdAt).toLocaleDateString('es-AR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


