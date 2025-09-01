"use client"
import { useEffect, useState } from "react";
import { ArmadoDocument, fetchArmadoDocuments } from "@/api/userService";

export interface UseArmadoDocumentsResult {
  loading: boolean;
  error: string | null;
  documents: ArmadoDocument[];
  latest: ArmadoDocument | null;
  history: ArmadoDocument[];
}

export function useArmadoDocuments(areaYearId?: string | number | null): UseArmadoDocumentsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<ArmadoDocument[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!areaYearId) return;
      setLoading(true);
      setError(null);
      try {
        const docs = await fetchArmadoDocuments(areaYearId);
        if (cancelled) return;
        setDocuments(docs);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ? String(e.message) : "Error obteniendo archivos de armado");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [areaYearId]);

  const latest = documents.length > 0 ? documents[0] : null;
  const history = documents.length > 1 ? documents.slice(1) : [];

  return { loading, error, documents, latest, history };
}


