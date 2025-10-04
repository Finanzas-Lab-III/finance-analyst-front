"use client"
import { useState, useEffect, useCallback } from 'react';
import { 
  AreaYearDocumentsResponse, 
  AreaYearStatusResponse,
  AreaYearDocument,
  areaYearService 
} from '@/api/areaYearService';

// Hook for area-year documents
interface UseAreaYearDocumentsOptions {
  areaYearId: number | string | null | undefined;
}

interface UseAreaYearDocumentsReturn {
  documents: AreaYearDocument[];
  armadoDocuments: AreaYearDocument[];
  seguimientoDocuments: AreaYearDocument[];
  totalDocuments: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAreaYearDocuments({ 
  areaYearId 
}: UseAreaYearDocumentsOptions): UseAreaYearDocumentsReturn {
  const [documents, setDocuments] = useState<AreaYearDocument[]>([]);
  const [armadoDocuments, setArmadoDocuments] = useState<AreaYearDocument[]>([]);
  const [seguimientoDocuments, setSeguimientoDocuments] = useState<AreaYearDocument[]>([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch area-year documents
  const fetchDocuments = useCallback(async () => {
    if (!areaYearId) {
      setDocuments([]);
      setArmadoDocuments([]);
      setSeguimientoDocuments([]);
      setTotalDocuments(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Fetching documents for area-year ${areaYearId}...`);
      const response = await areaYearService.getAreaYearDocuments(areaYearId);
      console.log(`✅ Area-year documents loaded:`, response);
      
      const allDocuments = [...response.armado_documents, ...response.seguimiento_documents];
      
      setDocuments(allDocuments);
      setArmadoDocuments(response.armado_documents);
      setSeguimientoDocuments(response.seguimiento_documents);
      setTotalDocuments(response.total_documents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading area-year documents';
      console.error('❌ Error fetching area-year documents:', err);
      setError(errorMessage);
      
      // Set empty data on error
      setDocuments([]);
      setArmadoDocuments([]);
      setSeguimientoDocuments([]);
      setTotalDocuments(0);
    } finally {
      setLoading(false);
    }
  }, [areaYearId]);

  // Refresh data
  const refresh = useCallback(() => {
    return fetchDocuments();
  }, [fetchDocuments]);

  // Load initial data
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    armadoDocuments,
    seguimientoDocuments,
    totalDocuments,
    loading,
    error,
    refresh
  };
}

// Hook for area-year status  
interface UseAreaYearStatusOptions {
  areaYearId: number | string | null | undefined;
}

interface UseAreaYearStatusReturn {
  status: string | null;
  areaName: string;
  areaType: 'FACULTAD' | 'SUBAREA' | null;
  year: number | null;
  parentArea: { id: number; name: string; type: 'FACULTAD' | 'SUBAREA' } | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAreaYearStatus({ 
  areaYearId 
}: UseAreaYearStatusOptions): UseAreaYearStatusReturn {
  const [status, setStatus] = useState<string | null>(null);
  const [areaName, setAreaName] = useState('');
  const [areaType, setAreaType] = useState<'FACULTAD' | 'SUBAREA' | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [parentArea, setParentArea] = useState<{ id: number; name: string; type: 'FACULTAD' | 'SUBAREA' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch area-year status
  const fetchStatus = useCallback(async () => {
    if (!areaYearId) {
      setStatus(null);
      setAreaName('');
      setAreaType(null);
      setYear(null);
      setParentArea(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Fetching status for area-year ${areaYearId}...`);
      const response = await areaYearService.getAreaYearStatus(areaYearId);
      console.log(`✅ Area-year status loaded:`, response);
      
      setStatus(response.status);
      setAreaName(response.area_name);
      setAreaType(response.area_type);
      setYear(response.year);
      setParentArea(response.parent_area || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading area-year status';
      console.error('❌ Error fetching area-year status:', err);
      setError(errorMessage);
      
      // Set null data on error
      setStatus(null);
      setAreaName('');
      setAreaType(null);
      setYear(null);
      setParentArea(null);
    } finally {
      setLoading(false);
    }
  }, [areaYearId]);

  // Refresh data
  const refresh = useCallback(() => {
    return fetchStatus();
  }, [fetchStatus]);

  // Load initial data
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    areaName,
    areaType,
    year,
    parentArea,
    loading,
    error,
    refresh
  };
}
