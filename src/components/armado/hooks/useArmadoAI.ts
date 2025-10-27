'use client';

import { useEffect, useState } from 'react';
import {analyzeArmado} from "@/lib/user-api";
import { toFriendlyError, formatFriendlyErrorInline } from "@/lib/http-errors";

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
  noData: boolean;
};

export function useArmadoAI(areaYearId?: string): UseArmadoAIResult {
  const [analysisResults, setAnalysisResults] = useState<ArmadoApiItem[]>([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    if (!areaYearId) return;

    const controller = new AbortController();

    async function run() {
      setAnalysisLoading(true);
      setAnalysisError(null);
      setNoData(false);
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
        const friendly = toFriendlyError(e, 'No se pudo analizar el presupuesto.');
        if (friendly.code === 400 || friendly.code === 404) {
          // Treat missing/invalid upstream data as no-data state for UI
          setAnalysisResults([]);
          setNoData(true);
          setAnalysisError(null);
        } else {
          setAnalysisError(formatFriendlyErrorInline(friendly));
        }
      } finally {
        setAnalysisLoading(false);
      }
    }

    run();
    return () => controller.abort();
  }, [areaYearId]);

  return { analysisResults, analysisLoading, analysisError, noData };
}
