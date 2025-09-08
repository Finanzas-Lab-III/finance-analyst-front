"use client"
import { useEffect, useMemo, useState } from "react";
import { fetchSeguimientoDocuments, SeguimientoDocument } from "@/api/userService";

export interface UseSeguimientoDocumentsResult {
  loading: boolean;
  error: string | null;
  documents: SeguimientoDocument[];
  bySubarea: Record<string, SeguimientoDocument[]>;
}

const ALLOWED_SUBAREAS: Set<string> = new Set([
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  "3plus9", "6plus6", "9plus3",
  "control-mensual", "control-trimestral", "general"
]);

const SUBAREA_ALIASES: Record<string, string> = {
  "3mas9": "3plus9",
  "6mas6": "6plus6", 
  "9mas3": "9plus3",
  "control-mensual": "abril", // Map to a specific month for now
  "control-trimestral": "3plus9",
};

function canonicalizeSubarea(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  const alias = SUBAREA_ALIASES[s] ?? s;
  return ALLOWED_SUBAREAS.has(alias) ? alias : null;
}

function extractSubareaFromFileKey(fileKey: string): string | null {
  // Expected pattern: "{area_year_id}/seguimiento/{subarea}/{filename}.xlsx"
  // We'll find the segment after "seguimiento"
  const parts = fileKey.split("/");
  const idx = parts.findIndex(p => p.toLowerCase() === "seguimiento");
  const sub = idx >= 0 && parts.length > idx + 1 ? parts[idx + 1] : null;
  
  console.log('🔍 extractSubareaFromFileKey - fileKey:', fileKey);
  console.log('🔍 extractSubareaFromFileKey - parts:', parts);
  console.log('🔍 extractSubareaFromFileKey - idx:', idx);
  console.log('🔍 extractSubareaFromFileKey - raw sub:', sub);
  
  const result = canonicalizeSubarea(sub ?? undefined);
  console.log('🔍 extractSubareaFromFileKey - canonicalized result:', result);
  
  return result;
}

// Helper function to extract multiple subareas from document
function extractSubareasFromDocument(doc: SeguimientoDocument): string[] {
  const subareas: string[] = [];
  const title = doc.title?.toLowerCase() || '';
  const filename = doc.file_key?.split('/').pop()?.toLowerCase() || '';
  
  // Detect type from title and filename
  let is3plus9 = title.includes('3+9') || title.includes('3mas9') || filename.includes('3+9') || filename.includes('3mas9');
  let is6plus6 = title.includes('6+6') || title.includes('6mas6') || filename.includes('6+6') || filename.includes('6mas6');
  let is9plus3 = title.includes('9+3') || title.includes('9mas3') || filename.includes('9+3') || filename.includes('9mas3');
  
  // If no specific type detected, try to infer from file structure
  if (!is3plus9 && !is6plus6 && !is9plus3) {
    const fileKey = doc.file_key?.toLowerCase() || '';
    if (fileKey.includes('control-mensual') || fileKey.includes('mensual')) {
      // For monthly control files, assume they are 6+6 type
      is6plus6 = true;
    }
  }
  
  if (is3plus9) {
    subareas.push('3plus9');
    // 3+9 appears in: Jan, Feb, Mar (executed) + some projected months
    subareas.push('enero', 'febrero', 'marzo', 'abril', 'mayo');
  }
  
  if (is6plus6) {
    subareas.push('6plus6');
    // 6+6 appears in: Jan-Jun (executed) + Jul-Aug (projected)
    subareas.push('enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto');
  }
  
  if (is9plus3) {
    subareas.push('9plus3');
    // 9+3 appears in: Jan-Sep (executed) + Oct-Dec (projected)
    subareas.push('enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre');
  }
  
  // If still no subareas detected, try to extract specific month from filename
  if (subareas.length === 0) {
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    for (const month of months) {
      if (filename.includes(month)) {
        subareas.push(month);
        break;
      }
    }
  }
  
  // Fallback to general if nothing detected
  if (subareas.length === 0) {
    subareas.push('general');
  }
  
  return subareas;
}

export function useSeguimientoDocuments(areaYearId?: string | number | null): UseSeguimientoDocumentsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<SeguimientoDocument[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!areaYearId) return;
      setLoading(true);
      setError(null);
      try {
        const docs = await fetchSeguimientoDocuments(areaYearId);
        if (cancelled) return;
        setDocuments(docs);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ? String(e.message) : "Error obteniendo archivos de seguimiento");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [areaYearId]);

  const bySubarea = useMemo(() => {
    console.log('🔄 Processing documents in useMemo:', documents);
    const grouped: Record<string, SeguimientoDocument[]> = {};
    
    for (const doc of documents) {
      const subareas = extractSubareasFromDocument(doc);
      
      // Add document to each detected subarea
      for (const subarea of subareas) {
        if (!grouped[subarea]) grouped[subarea] = [];
        grouped[subarea].push(doc);
      }
    }
    // Extract version number from strings like "V1", "v2", etc.
    const extractVersionFromText = (text?: string | null): number | null => {
      if (!text) return null;
      let max: number | null = null;
      const regex = /v\s*(\d+)/gi;
      const matches = text.matchAll(regex);
      for (const m of matches) {
        const n = parseInt(m[1], 10);
        if (!Number.isNaN(n)) {
          max = max === null ? n : Math.max(max, n);
        }
      }
      return max;
    };

    const extractVersion = (doc: SeguimientoDocument): number | null => {
      const fromTitle = extractVersionFromText(doc.title);
      if (fromTitle !== null) return fromTitle;
      const filename = (doc.file_key?.split("/").pop() || "").replace(/\.(xlsx|xls|csv)$/i, "");
      const fromFile = extractVersionFromText(filename);
      if (fromFile !== null) return fromFile;
      const fromNotes = extractVersionFromText(typeof doc.notes === "string" ? doc.notes : undefined);
      return fromNotes;
    };

    // Sort each group: by version (desc) if present, else by created_at desc
    Object.keys(grouped).forEach(key => {
      grouped[key] = grouped[key]
        .slice()
        .sort((a, b) => {
          const va = extractVersion(a);
          const vb = extractVersion(b);
          if (va !== null && vb !== null) {
            return vb - va; // higher version first
          }
          if (va !== null && vb === null) return -1; // prefer versioned over non-versioned
          if (va === null && vb !== null) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    });
    return grouped;
  }, [documents]);

  return { loading, error, documents, bySubarea };
}


