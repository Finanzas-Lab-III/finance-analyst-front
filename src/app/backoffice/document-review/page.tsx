"use client"
import React, { useState } from 'react';
import { FileCheck, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import PendingDocumentsView from '@/components/PendingDocumentsView';
import { usePendingDocuments } from '@/hooks/useDocumentStatus';
import BackofficeHeader from '@/components/backoffice/BackofficeHeader';

export default function DocumentReviewPage() {
  const { count, loading } = usePendingDocuments();
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);

  const handleDocumentSelect = (documentId: number) => {
    setSelectedDocumentId(documentId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BackofficeHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileCheck className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Revisión de Documentos</h1>
              <p className="text-gray-600 mt-1">Panel de control para la revisión y aprobación de presupuestos</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : count}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aprobados Hoy</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revisados</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileCheck className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Promedio Tiempo</p>
                <p className="text-2xl font-bold text-gray-900">2.5h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Documents List */}
          <div className="lg:col-span-2">
            <PendingDocumentsView onDocumentClick={handleDocumentSelect} />
          </div>

          {/* Document Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles del Documento</h3>
              
              {selectedDocumentId ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">ID del Documento</h4>
                    <p className="text-gray-600">#{selectedDocumentId}</p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Acciones Rápidas</h4>
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                        ✓ Aprobar Rápidamente
                      </button>
                      <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
                        ⚠ Solicitar Cambios
                      </button>
                      <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                        ✗ Rechazar
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Historial</h4>
                    <p className="text-sm text-gray-600">
                      El historial de este documento se mostrará aquí una vez que esté integrado con el backend.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Selecciona un documento para ver los detalles</p>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200 mt-6">
              <h4 className="font-medium text-yellow-900 mb-2">💡 Consejos Rápidos</h4>
              <div className="text-sm text-yellow-800 space-y-1">
                <p>• Revisa siempre los totales presupuestarios</p>
                <p>• Verifica las justificaciones en las notas</p>
                <p>• Usa comentarios claros al solicitar cambios</p>
                <p>• Aprueba solo cuando esté completamente correcto</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
