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
  filePath: string,
  opts?: { signal?: AbortSignal }
): Promise<BudgetProcessorResponse> {
  const res = await instance.post<BudgetProcessorResponse>(
    "/api/budget-processor/process/",
    { file_path: filePath },
    { signal: opts?.signal }
  );
  return res.data;
}
