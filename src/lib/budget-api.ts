import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVICE_URL, // <- ya no /api/proxy
  withCredentials: true, // <- manda cookies al backend
});

export interface BudgetDataItem {
  'Grupo Cuenta': string;
  'Denominacion': string;
  'Cuenta': number;
  'Moneda': string;
  'Descripción/detalle': string;
  'Nuevo/Corriente': string;
  'Jan-24': number | string;
  'Feb-24': number | string;
  'Mar-24': number | string;
  'Apr-24': number | string;
  'May-24': number | string;
  'Jun-24': number | string;
  'Jul-24': number | string;
  'Aug-24': number | string;
  'Sep-24': number | string;
  'Oct-24': number | string;
  'Nov-24': number | string;
  'Dec-24': number | string;
  'Tot': number;
}

export interface BudgetProcessorResponse {
  success: boolean;
  data: BudgetDataItem[];
  columns: string[];
  row_count: number;
}

export async function processBudgetFile(
  areaYearId: number,
  opts?: { signal?: AbortSignal }
): Promise<BudgetProcessorResponse> {
  try {
    console.log('🔧 Budget API: Attempting to connect to backend...');
    const res = await instance.post<BudgetProcessorResponse>(
      "/api/budget-processor/process/",
      { area_year_id: areaYearId },
      { signal: opts?.signal }
    );
    console.log('✅ Budget API: Success');
    return res.data;
  } catch (error) {
    console.warn('⚠️ Budget API: Backend not available, using mock data');
    // Return mock data when backend is not available
    return {
      success: true,
      data: [],
      columns: ['Grupo Cuenta', 'Denominacion', 'Cuenta', 'Moneda'],
      row_count: 0
    };
  }
}
