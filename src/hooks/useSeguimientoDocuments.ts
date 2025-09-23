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
  "general"
]);

const SUBAREA_ALIASES: Record<string, string> = {
  "3mas9": "3plus9",
  "6mas6": "6plus6", 
  "9mas3": "9plus3",
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
  // 1) Prefer subarea from folder in file_key if present: {..}/seguimiento/{subarea}/...
  const byFolder = extractSubareaFromFileKey(doc.file_key || '');
  if (byFolder) {
    return [byFolder];
  }

  const subareas: string[] = [];
  const title = doc.title?.toLowerCase() || '';
  const filename = doc.file_key?.split('/').pop()?.toLowerCase() || '';

  // 2) Detect type from title/filename when folder not informative
  if (title.includes('3+9') || title.includes('3mas9') || filename.includes('3+9') || filename.includes('3mas9')) {
    return ['3plus9'];
  }
  if (title.includes('6+6') || title.includes('6mas6') || filename.includes('6+6') || filename.includes('6mas6')) {
    return ['6plus6'];
  }
  if (title.includes('9+3') || title.includes('9mas3') || filename.includes('9+3') || filename.includes('9mas3')) {
    return ['9plus3'];
  }

  // 3) Try to extract a month from the filename
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  
  // Check for text month names
  for (const month of months) {
    if (filename.includes(month)) {
      return [month];
    }
  }
  
  // Check for numeric format (MMYYYY)
  const numericMatch = filename.match(/(\d{2})(?:20)?\d{2}/);
  if (numericMatch) {
    const monthNum = parseInt(numericMatch[1], 10);
    if (monthNum >= 1 && monthNum <= 12) {
      return [months[monthNum - 1]];
    }
  }

  // 4) Fallback
  return ['general'];
}

export function useSeguimientoDocuments(areaYearId?: string | number | null, reloadKey?: number | string): UseSeguimientoDocumentsResult {
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
  }, [areaYearId, reloadKey]);

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


