"use client"
import React, { useState } from 'react';
import { 
  FileCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Send, 
  Loader2,
  Edit3
} from 'lucide-react';
import { 
  DocumentStatus, 
  getAvailableStatusTransitions 
} from '@/api/documentStatusService';
import { useDocumentStatus } from '@/hooks/useDocumentStatus';

interface DocumentStatusIndicatorProps {
  documentId: number;
  currentUserId?: number;
  userRole?: 'DIRECTOR' | 'FINANCE' | 'ADMIN';
  onStatusChange?: (newStatus: DocumentStatus) => void;
  compact?: boolean;
}

export default function DocumentStatusIndicator({
  documentId,
  currentUserId,
  userRole,
  onStatusChange,
  compact = false
}: DocumentStatusIndicatorProps) {
  const {
    status,
    document,
    loading,
    error,
    updateStatus,
    statusLabel,
    statusColor,
    canUpdate,
    updating
  } = useDocumentStatus({ documentId, currentUserId, userRole });

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus>('APPROVED');
  const [notes, setNotes] = useState('');

  // Get icon for status
  const getStatusIcon = (status: DocumentStatus | null) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return <Clock className="w-4 h-4" />;
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'NEEDS_CHANGES':
        return <AlertTriangle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileCheck className="w-4 h-4" />;
    }
  };

  // Check if user can update status (Finance or Admin only)
  const canUserUpdateStatus = userRole === 'FINANCE' || userRole === 'ADMIN';

  // Handle status indicator click
  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling to parent elements
    if (canUserUpdateStatus && !updating) {
      setShowUpdateModal(true);
    }
  };

  // Handle status update
  const handleUpdateStatus = async () => {
    try {
      await updateStatus(selectedStatus, notes.trim() || undefined);
      setShowUpdateModal(false);
      setNotes('');
      onStatusChange?.(selectedStatus);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-500">Cargando status...</span>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="text-xs text-red-600">
        Error cargando status
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <span 
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColor} ${
            canUserUpdateStatus ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'
          }`}
          onClick={handleStatusClick}
          title={canUserUpdateStatus ? 'Haz clic para cambiar el estado' : statusLabel}
        >
          {getStatusIcon(status)}
          <span className="ml-1">{statusLabel}</span>
          {updating && <Loader2 className="w-3 h-3 ml-1 animate-spin" />}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span 
            className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border ${statusColor} ${
              canUserUpdateStatus ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'cursor-default'
            }`}
            onClick={handleStatusClick}
            title={canUserUpdateStatus ? 'Haz clic para cambiar el estado' : statusLabel}
          >
            {getStatusIcon(status)}
            <span className="ml-2">{statusLabel}</span>
            {updating && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
          </span>
          
          {document && (
            <div className="text-sm text-gray-500">
              Actualizado: {new Date(document.updated_at).toLocaleDateString('es-AR')}
            </div>
          )}
        </div>

        {/* Info for Finance/Admin users */}
        {canUserUpdateStatus && (
          <div className="text-sm text-gray-500">
            💡 Haz clic en el estado para cambiarlo
          </div>
        )}
      </div>

      {/* Status Notes */}
      {document?.notes && (
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-900 mb-1">Notas</h4>
          <p className="text-sm text-gray-700">{document.notes}</p>
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cambiar Estado del Documento</h3>
              <button 
                onClick={() => setShowUpdateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nuevo Estado
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as DocumentStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="PENDING_REVIEW">Pendiente de Revisión</option>
                  <option value="APPROVED">Aprobado</option>
                  <option value="NEEDS_CHANGES">Solicitar Cambios</option>
                  <option value="REJECTED">Rechazado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentarios (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                  placeholder="Agregar comentarios sobre la decisión..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? (
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  ) : null}
                  {updating ? 'Actualizando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
