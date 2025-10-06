'use client';

import { useEffect, useState } from 'react';
import {analyzeArmado} from "@/lib/user-api";

type ArmadoApiItem = {
  row?: number;
  rule?: string;
  error?: string;
  [k: string]: any;
};

type UseArmadoAIResult = {
  analysisResults: ArmadoApiItem[];
  analysisLoading: boolean;
  analysisError: string | null;
};

export function useArmadoAI(areaYearId?: string): UseArmadoAIResult {
  const [analysisResults, setAnalysisResults] = useState<ArmadoApiItem[]>([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    if (!areaYearId) return;

    const controller = new AbortController();

    async function run() {
      setAnalysisLoading(true);
      setAnalysisError(null);
      try {
        if(!areaYearId) throw new Error('ID de año de área no proporcionado');
        const data: any = await analyzeArmado(areaYearId, { signal: controller.signal });

        if (Array.isArray(data)) {
          const mapped: ArmadoApiItem[] = data.map((item: ArmadoApiItem) => ({
            // For the sidebar UI
            message: item.error ?? 'Observación',
            description: `Fila ${item.row ?? '-'} • Regla: ${item.rule ?? '-'}`,
            // Keep original fields
            ...item,
          }));
          setAnalysisResults(mapped);
        } else {
          // Pass through unexpected shapes so the UI can show them
          setAnalysisResults(data);
        }
      } catch (e: any) {
        // Handle abort/cancel from axios v1 (ERR_CANCELED) and generic AbortError
        if (e?.code === 'ERR_CANCELED' || e?.name === 'AbortError' || e?.name === 'CanceledError') return;
        setAnalysisError(e?.message ? String(e.message) : 'No se pudo analizar el presupuesto');
      } finally {
        setAnalysisLoading(false);
      }
    }

    run();
    return () => controller.abort();
  }, [areaYearId]);

  return { analysisResults, analysisLoading, analysisError };
}
