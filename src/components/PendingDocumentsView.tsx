"use client"
import React, { useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, Eye, MessageSquare } from 'lucide-react';
import { usePendingDocuments } from '@/hooks/useDocumentStatus';
import { DocumentStatus } from '@/api/documentStatusService';
import DocumentStatusIndicator from '@/components/DocumentStatusIndicator';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface PendingDocumentsViewProps {
  onDocumentClick?: (documentId: number) => void;
}

export default function PendingDocumentsView({ onDocumentClick }: PendingDocumentsViewProps) {
  const { documents, count, loading, error, refresh } = usePendingDocuments();
  const { user } = useCurrentUser();
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);

  const handleDocumentSelect = (documentId: number) => {
    setSelectedDocument(documentId);
    onDocumentClick?.(documentId);
  };

  const getTypeIcon = (type: 'ARMADO' | 'SEGUIMIENTO') => {
    return type === 'ARMADO' ? 
      <FileText className="w-5 h-5 text-blue-600" /> : 
      <MessageSquare className="w-5 h-5 text-green-600" />;
  };

  const getTypeLabel = (type: 'ARMADO' | 'SEGUIMIENTO') => {
    return type === 'ARMADO' ? 'Presupuesto' : 'Seguimiento';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando documentos pendientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar documentos</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documentos Pendientes de Revisión</h2>
          <p className="text-gray-600 mt-1">
            {count === 0 ? 'No hay documentos' : `${count} documento${count !== 1 ? 's' : ''}`} esperando tu revisión
          </p>
        </div>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Actualizar
        </button>
      </div>

      {/* Documents List */}
      {count === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">¡Todo al día!</h3>
            <p className="text-gray-600">
              No hay documentos pendientes de revisión en este momento.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-700">
              <div>Tipo</div>
              <div>Documento</div>
              <div>Área</div>
              <div>Año</div>
              <div>Estado</div>
              <div>Acciones</div>
            </div>
          </div>

          {/* Documents */}
          <div className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedDocument === doc.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => handleDocumentSelect(doc.id)}
              >
                <div className="grid grid-cols-6 gap-4 items-center">
                  {/* Type */}
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(doc.type)}
                    <span className="text-sm font-medium text-gray-900">
                      {getTypeLabel(doc.type)}
                    </span>
                  </div>

                  {/* Document Title */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 truncate" title={doc.title}>
                      {doc.title}
                    </h4>
                  </div>

                  {/* Area */}
                  <div>
                    <span className="text-sm text-gray-600">{doc.area_info.area_name}</span>
                  </div>

                  {/* Year */}
                  <div>
                    <span className="text-sm text-gray-600">{doc.area_info.year}</span>
                  </div>

                  {/* Status */}
                  <div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                      <Clock className="w-3 h-3 mr-1" />
                      Pendiente
                    </span>
                  </div>

                  {/* Actions */}
                  <div>
                    <DocumentStatusIndicator 
                      documentId={doc.id}
                      currentUserId={user?.id ? Number(user.id) : undefined}
                      userRole="FINANCE"
                      compact={true}
                      onStatusChange={() => {
                        // Refresh the list after status change
                        refresh();
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Instrucciones de Revisión</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>Haz clic en un documento</strong> para seleccionarlo y ver más detalles</p>
              <p>• <strong>Usar los botones de acción</strong> para aprobar, solicitar cambios o rechazar documentos</p>
              <p>• <strong>Agregar comentarios</strong> cuando solicites cambios o rechaces un documento</p>
              <p>• <strong>Los documentos aprobados</strong> se removerán automáticamente de esta lista</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
