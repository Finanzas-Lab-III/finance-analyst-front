"use client"
import { useMemo } from "react";
import { useSeguimientoDocuments } from "./useSeguimientoDocuments";
import type { AreaYearStatus } from "@/api/userService";

// Meses esperados para un año completo
const EXPECTED_MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

export interface BudgetStatusResult {
  calculatedStatus: AreaYearStatus;
  isYearComplete: boolean;
  loadedMonths: string[];
  missingMonths: string[];
  totalDocuments: number;
}

export function useBudgetStatusCalculation(areaYearId: string | number | null): BudgetStatusResult {
  const { documents, bySubarea, loading, error } = useSeguimientoDocuments(areaYearId);
  
  return useMemo(() => {
    // Si no hay areaYearId o está cargando, devolver estado por defecto
    if (!areaYearId || loading) {
      return {
        calculatedStatus: "NOT_STARTED" as AreaYearStatus,
        isYearComplete: false,
        loadedMonths: [],
        missingMonths: EXPECTED_MONTHS,
        totalDocuments: 0
      };
    }
    
    // Si hay error, asumir que no hay documentos
    if (error) {
      return {
        calculatedStatus: "BUDGET_STARTED" as AreaYearStatus,
        isYearComplete: false,
        loadedMonths: [],
        missingMonths: EXPECTED_MONTHS,
        totalDocuments: 0
      };
    }
    
    // Extraer meses únicos de bySubarea que corresponden a meses del año
    const loadedMonths = Object.keys(bySubarea)
      .filter(subarea => EXPECTED_MONTHS.includes(subarea))
      .sort();
    
    // Calcular meses faltantes
    const missingMonths = EXPECTED_MONTHS.filter(month => !loadedMonths.includes(month));
    
    // Determinar si el año está completo (todas las variaciones mensuales cargadas)
    const isYearComplete = missingMonths.length === 0;
    
    // Calcular estado basado en la nueva lógica
    let calculatedStatus: AreaYearStatus;
    
    if (documents.length === 0) {
      calculatedStatus = "NOT_STARTED";
    } else if (isYearComplete) {
      // Si están todas las variaciones mensuales → Finalizado
      calculatedStatus = "BUDGET_APPROVED"; // BUDGET_APPROVED se mapea a "Finalizado"
    } else {
      // Si no están todas → En curso
      calculatedStatus = "BUDGET_STARTED"; // BUDGET_STARTED se mapea a "En curso"
    }
    
    return {
      calculatedStatus,
      isYearComplete,
      loadedMonths,
      missingMonths,
      totalDocuments: documents.length
    };
  }, [areaYearId, documents, bySubarea, loading, error]);
}
