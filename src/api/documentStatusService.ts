// Document Status Service - Integration with Backend
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_SERVICE_URL || "http://127.0.0.1:8000";

// Document Status Types (matching backend)
export type DocumentStatus = 
  | "PENDING_REVIEW"  // Documentos recién subidos van directo aquí
  | "APPROVED"
  | "NEEDS_CHANGES"
  | "REJECTED";

// Document Type
export type DocumentType = "ARMADO" | "SEGUIMIENTO";

// Interfaces for API responses
export interface DocumentStatusResponse {
  id: number;
  type: DocumentType;
  status: DocumentStatus;
  title: string;
  area_year_id: number;
  file_key: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PendingDocumentsResponse {
  documents: Array<{
    id: number;
    type: DocumentType;
    status: DocumentStatus;
    title: string;
    area_info: {
      area_id: number;
      area_name: string;
      year: number;
    };
  }>;
  count: number;
}

export interface SubmitDocumentRequest {
  submitted_by_id: number;
}

export interface UpdateStatusRequest {
  status: DocumentStatus;
  notes?: string;
  updated_by_id: number;
}

// Document Status Labels for UI
export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  PENDING_REVIEW: 'Pendiente de Revisión',
  APPROVED: 'Aprobado',
  NEEDS_CHANGES: 'Necesita Cambios',
  REJECTED: 'Rechazado'
};

// Status colors for UI
export const DOCUMENT_STATUS_COLORS: Record<DocumentStatus, string> = {
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  APPROVED: 'bg-green-100 text-green-800 border-green-300',
  NEEDS_CHANGES: 'bg-orange-100 text-orange-800 border-orange-300',
  REJECTED: 'bg-red-100 text-red-800 border-red-300'
};

export class DocumentStatusService {
  
  /**
   * Get the status of a specific document
   */
  async getDocumentStatus(documentId: number): Promise<DocumentStatusResponse> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/document/${documentId}/status/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error getting document status: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Submit a document for review (Director action)
   */
  async submitDocumentForReview(documentId: number, submittedById: number): Promise<void> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/document/${documentId}/submit/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        submitted_by_id: submittedById
      } as SubmitDocumentRequest),
    });

    if (!response.ok) {
      throw new Error(`Error submitting document: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Update document status (Finance action)
   */
  async updateDocumentStatus(
    documentId: number, 
    status: DocumentStatus, 
    updatedById: number,
    notes?: string
  ): Promise<void> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/document/${documentId}/status/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        notes,
        updated_by_id: updatedById
      } as UpdateStatusRequest),
    });

    if (!response.ok) {
      throw new Error(`Error updating document status: ${response.status} ${response.statusText}`);
    }
  }

  /**
   * Get all documents pending review (Finance view)
   */
  async getPendingDocuments(): Promise<PendingDocumentsResponse> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/documents/pending-review/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error getting pending documents: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Health check for backend connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/health/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.warn('Backend health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const documentStatusService = new DocumentStatusService();

// Helper functions for UI
export function getStatusLabel(status: DocumentStatus): string {
  return DOCUMENT_STATUS_LABELS[status] || status;
}

export function getStatusColor(status: DocumentStatus): string {
  return DOCUMENT_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800 border-gray-300';
}

// Check if current user can submit document (Director)
// Ya no es necesario - los documentos van directo a PENDING_REVIEW cuando se suben
export function canSubmitDocument(status: DocumentStatus): boolean {
  return false; // Los documentos van automáticamente a PENDING_REVIEW al subirse
}

// Check if current user can update status (Finance/Admin)
export function canUpdateStatus(status: DocumentStatus): boolean {
  // Finance and Admin can update from any status
  return true;
}

// Get available status transitions for Finance
export function getAvailableStatusTransitions(): DocumentStatus[] {
  return ['APPROVED', 'NEEDS_CHANGES', 'REJECTED'];
}
