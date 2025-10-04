// Area Year Service - Integration with Backend
const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_SERVICE_URL || "http://127.0.0.1:8000";

// Document Types
export type DocumentType = "ARMADO" | "SEGUIMIENTO";

// Document interface matching backend response
export interface AreaYearDocument {
  id: number;
  type: DocumentType;
  title: string;
  area_year_id: number;
  file_key: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by_id?: number;
  updated_by_id?: number;
}

// Area Year Documents Response
export interface AreaYearDocumentsResponse {
  area_year_id: number;
  armado_documents: AreaYearDocument[];
  seguimiento_documents: AreaYearDocument[];
  total_documents: number;
}

// Area Year Status Response
export interface AreaYearStatusResponse {
  area_year_id: number;
  status: string;
  area_name: string;
  area_type: 'FACULTAD' | 'SUBAREA';
  year: number;
  parent_area?: {
    id: number;
    name: string;
    type: 'FACULTAD' | 'SUBAREA';
  };
}

export class AreaYearService {
  
  /**
   * Get all documents for a specific area-year
   */
  async getAreaYearDocuments(areaYearId: number | string): Promise<AreaYearDocumentsResponse> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/area-year/${areaYearId}/documents/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error getting area-year documents: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get status of a specific area-year
   */
  async getAreaYearStatus(areaYearId: number | string): Promise<AreaYearStatusResponse> {
    const response = await fetch(`${BACKEND_BASE_URL}/api/area-year/${areaYearId}/status/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error getting area-year status: ${response.status} ${response.statusText}`);
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
export const areaYearService = new AreaYearService();
