"use client"
import { useState, useEffect, useCallback } from 'react';
import { 
  DocumentStatus, 
  DocumentStatusResponse, 
  documentStatusService, 
  getStatusLabel, 
  getStatusColor,
  canSubmitDocument,
  canUpdateStatus 
} from '@/api/documentStatusService';

interface UseDocumentStatusOptions {
  documentId: number;
  currentUserId?: number;
  userRole?: 'DIRECTOR' | 'FINANCE' | 'ADMIN';
}

interface UseDocumentStatusReturn {
  status: DocumentStatus | null;
  document: DocumentStatusResponse | null;
  loading: boolean;
  error: string | null;
  // Actions
  updateStatus: (newStatus: DocumentStatus, notes?: string) => Promise<void>;
  refresh: () => Promise<void>;
  // UI helpers
  statusLabel: string;
  statusColor: string;
  canUpdate: boolean;
  // Updating states
  updating: boolean;
}

export function useDocumentStatus({ 
  documentId, 
  currentUserId, 
  userRole 
}: UseDocumentStatusOptions): UseDocumentStatusReturn {
  const [document, setDocument] = useState<DocumentStatusResponse | null>(null);
  const [status, setStatus] = useState<DocumentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Fetch document status
  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Fetching status for document ${documentId}...`);
      const response = await documentStatusService.getDocumentStatus(documentId);
      console.log(`✅ Document status loaded:`, response);
      
      setDocument(response);
      setStatus(response.status);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading document status';
      console.error('❌ Error fetching document status:', err);
      setError(errorMessage);
      
      // For development: provide fallback status if backend is not available
      if (errorMessage.includes('fetch')) {
        console.warn('⚠️ Backend not available, using fallback status');
        setStatus('PENDING_REVIEW');
        setDocument({
          id: documentId,
          type: 'ARMADO',
          status: 'PENDING_REVIEW',
          title: `Document ${documentId}`,
          area_year_id: 1,
          file_key: 'fallback.xlsx',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  // Update document status (Finance action)
  const updateStatus = useCallback(async (newStatus: DocumentStatus, notes?: string) => {
    if (!currentUserId || !status || !canUpdateStatus(status)) {
      throw new Error('Cannot update document status in current state');
    }

    try {
      setUpdating(true);
      setError(null);
      
      console.log(`🔄 Updating document ${documentId} status to ${newStatus}...`);
      await documentStatusService.updateDocumentStatus(documentId, newStatus, currentUserId, notes);
      console.log('✅ Document status updated successfully');
      
      // Update local status
      setStatus(newStatus);
      if (document) {
        setDocument({
          ...document,
          status: newStatus,
          notes: notes || document.notes,
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating document status';
      console.error('❌ Error updating document status:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [documentId, currentUserId, status, document]);

  // Refresh data
  const refresh = useCallback(() => {
    return fetchStatus();
  }, [fetchStatus]);

  // Load initial data
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // UI helper values
  const statusLabel = status ? getStatusLabel(status) : 'Cargando...';
  const statusColor = status ? getStatusColor(status) : 'bg-gray-100 text-gray-800 border-gray-300';
  const canUpdate = Boolean(status && canUpdateStatus(status) && (userRole === 'FINANCE' || userRole === 'ADMIN'));

  return {
    status,
    document,
    loading,
    error,
    updateStatus,
    refresh,
    statusLabel,
    statusColor,
    canUpdate,
    updating
  };
}

// Hook for fetching pending documents (Finance view)
interface UsePendingDocumentsReturn {
  documents: Array<{
    id: number;
    type: 'ARMADO' | 'SEGUIMIENTO';
    status: DocumentStatus;
    title: string;
    area_info: {
      area_id: number;
      area_name: string;
      year: number;
    };
  }>;
  count: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePendingDocuments(): UsePendingDocumentsReturn {
  const [documents, setDocuments] = useState<UsePendingDocumentsReturn['documents']>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching pending documents...');
      const response = await documentStatusService.getPendingDocuments();
      console.log(`✅ Pending documents loaded: ${response.count} documents`);
      
      setDocuments(response.documents);
      setCount(response.count);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading pending documents';
      console.error('❌ Error fetching pending documents:', err);
      setError(errorMessage);
      
      // For development: provide empty fallback if backend is not available
      if (errorMessage.includes('fetch')) {
        console.warn('⚠️ Backend not available, showing empty list');
        setDocuments([]);
        setCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    return fetchPendingDocuments();
  }, [fetchPendingDocuments]);

  useEffect(() => {
    fetchPendingDocuments();
  }, [fetchPendingDocuments]);

  return {
    documents,
    count,
    loading,
    error,
    refresh
  };
}
