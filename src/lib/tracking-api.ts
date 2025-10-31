import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVICE_URL,
  withCredentials: true,
});

// ============================================================================
// TypeScript Types
// ============================================================================

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface CostSummary {
  id: number;
  title: string;
  amount: number;
  currency: "USD" | "ARS" | "EUR";
  createdAt: string;
}

export interface BudgetItemSummary {
  id: number;
  cuenta: string;
  name: string | null;
  month: number;
  budgetedAmount: number;
  currency: "USD" | "ARS" | "EUR";
}

export interface BudgetItem {
  id: number;
  cuenta: string;
  name: string | null;
  description: string | null;
  month: number;
  budgetedAmount: number;
  currency: "USD" | "ARS" | "EUR";
  areaYearId: number;
  createdAt: string;
  updatedAt: string;
  costs?: CostSummary[];
}

export interface Cost {
  id: number;
  areaYearId: number;
  budgetItemId: number | null;
  cuenta: string | null;
  month: number;
  title: string;
  description: string | null;
  amount: number;
  currency: "USD" | "ARS" | "EUR";
  createdById: number;
  createdAt: string;
  updatedAt: string;
  budgetItem?: BudgetItemSummary;
  createdBy?: User;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Backend-specific response formats
export interface BudgetItemsResponse {
  budget_items: BudgetItem[];
  total: number;
}

export interface CostsResponse {
  costs: Cost[];
  total: number;
}

export interface BudgetItemsParams {
  cuenta?: string;
  month?: number;
  currency?: string;
  page?: number;
  page_size?: number;
}

export interface CostsParams {
  area_year_id?: number;
  budget_item_id?: number;
  cuenta?: string;
  month?: number;
  currency?: string;
  created_by_id?: number;
  page?: number;
  page_size?: number;
}

export interface CreateCostData {
  area_year_id: number;
  budget_item_id?: number | null;
  cuenta?: string | null;
  month: number;
  title: string;
  description?: string | null;
  amount: number;
  currency: "USD" | "ARS" | "EUR";
  created_by_id: number;
}

export interface UpdateCostData {
  budget_item_id?: number | null;
  cuenta?: string | null;
  month?: number;
  title?: string;
  description?: string | null;
  amount?: number;
  currency?: "USD" | "ARS" | "EUR";
}

// ============================================================================
// API Client Functions
// ============================================================================

/**
 * Get all budget items for a specific area-year with optional filters
 */
export async function getBudgetItems(
  areaYearId: number,
  params?: BudgetItemsParams,
  opts?: { signal?: AbortSignal }
): Promise<PaginatedResponse<BudgetItem>> {
  const res = await instance.get<BudgetItemsResponse>(
    `/api/tracking/budget-items/?area_year_id=${areaYearId}`,
    {
      params,
      signal: opts?.signal,
    }
  );
  
  // Transform backend response to expected format
  return {
    count: res.data.total,
    next: null,
    previous: null,
    results: res.data.budget_items,
  };
}

/**
 * Get a specific budget item by ID
 */
export async function getBudgetItem(
  id: number,
  opts?: { signal?: AbortSignal }
): Promise<BudgetItem> {
  const res = await instance.get<BudgetItem>(`/api/tracking/budget-items/${id}/`, {
    signal: opts?.signal,
  });
  return res.data;
}

/**
 * Get all costs with optional filters
 */
export async function getCosts(
  params?: CostsParams,
  opts?: { signal?: AbortSignal }
): Promise<PaginatedResponse<Cost>> {
  const res = await instance.get<CostsResponse>("/api/tracking/costs/", {
    params,
    signal: opts?.signal,
  });
  
  // Transform backend response to expected format
  return {
    count: res.data.total,
    next: null,
    previous: null,
    results: res.data.costs,
  };
}

/**
 * Get a specific cost by ID
 */
export async function getCost(
  id: number,
  opts?: { signal?: AbortSignal }
): Promise<Cost> {
  const res = await instance.get<Cost>(`/api/tracking/costs/${id}/`, {
    signal: opts?.signal,
  });
  return res.data;
}

/**
 * Create a new cost/expense
 */
export async function createCost(
  data: CreateCostData,
  opts?: { signal?: AbortSignal }
): Promise<Cost> {
  const res = await instance.post<Cost>("/api/tracking/costs/", data, {
    signal: opts?.signal,
  });
  return res.data;
}

/**
 * Update an existing cost
 */
export async function updateCost(
  id: number,
  data: UpdateCostData,
  opts?: { signal?: AbortSignal }
): Promise<Cost> {
  const res = await instance.put<Cost>(`/api/tracking/costs/${id}/`, data, {
    signal: opts?.signal,
  });
  return res.data;
}

/**
 * Delete a cost
 */
export async function deleteCost(
  id: number,
  opts?: { signal?: AbortSignal }
): Promise<void> {
  await instance.delete(`/api/tracking/costs/${id}/`, {
    signal: opts?.signal,
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format currency with proper locale and symbol
 */
export function formatCurrency(
  amount: number,
  currency: "USD" | "ARS" | "EUR"
): string {
  const locales: Record<string, string> = {
    USD: "en-US",
    ARS: "es-AR",
    EUR: "es-ES",
  };

  return new Intl.NumberFormat(locales[currency] || "es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get month name in Spanish
 */
export function getMonthName(month: number): string {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return months[month - 1] || "Desconocido";
}

/**
 * Calculate percentage of budget used
 */
export function calculateBudgetUsagePercentage(
  spent: number,
  budgeted: number
): number {
  if (budgeted === 0) return 0;
  return (spent / budgeted) * 100;
}

/**
 * Get status color based on budget usage percentage
 */
export function getBudgetStatusColor(percentage: number): string {
  if (percentage >= 100) return "text-red-600 bg-red-50 border-red-200";
  if (percentage >= 80) return "text-orange-600 bg-orange-50 border-orange-200";
  if (percentage >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  return "text-green-600 bg-green-50 border-green-200";
}

/**
 * Group budget items by month
 */
export function groupBudgetItemsByMonth(
  items: BudgetItem[]
): Map<number, BudgetItem[]> {
  const grouped = new Map<number, BudgetItem[]>();
  for (const item of items) {
    const monthItems = grouped.get(item.month) || [];
    monthItems.push(item);
    grouped.set(item.month, monthItems);
  }
  return grouped;
}

