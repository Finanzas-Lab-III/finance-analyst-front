/**
 * Tracking API Service
 * Handles spending/cost entries for budget tracking
 */

const API_BASE = process.env.NEXT_PUBLIC_SERVICE_URL || '';

export enum Currency {
  USD = 'USD',
  ARS = 'ARS',
  EUR = 'EUR'
}

export interface Cost {
  id: number;
  area_year_id: number;
  cuenta: string;
  cuenta_id: string | null;
  month: number;
  month_display: string;
  title: string;
  description: string | null;
  amount: string; // Decimal as string
  currency: Currency;
  created_by_id: number;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
}

export interface CreateCostRequest {
  area_year_id: number;
  cuenta: string;
  cuenta_id?: string;
  month: number; // 1-12
  title: string;
  description?: string;
  amount: number;
  currency: Currency;
  created_by_id: number;
}

export interface UpdateCostRequest {
  cuenta?: string;
  cuenta_id?: string;
  month?: number;
  title?: string;
  description?: string;
  amount?: number;
  currency?: Currency;
}

export interface CostListResponse {
  entries: Cost[];
  total: number;
}

export interface CostFilters {
  area_year_id?: number;
  cuenta?: string;
  cuenta_id?: string;
  month?: number;
  currency?: Currency;
  created_by_id?: number;
}

export interface CostSummaryByCuenta {
  cuenta: string;
  total_amount: string;
  currency: Currency;
  entry_count: number;
}

export interface CostSummaryByMonth {
  month: number;
  currency: Currency;
  total_amount: number;
  entry_count: number;
}

export interface CostSummaryResponse {
  area_year_id: number;
  group_by: 'cuenta' | 'month';
  summaries: CostSummaryByCuenta[] | CostSummaryByMonth[];
}

export interface ErrorResponse {
  detail: string;
  errors?: {
    [field: string]: string[];
  };
}

/**
 * Create a new cost entry
 */
export async function createCost(costData: CreateCostRequest): Promise<Cost> {
  const response = await fetch(`${API_BASE}/api/tracking/entries/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    credentials: 'include',
    body: JSON.stringify(costData),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.detail || 'Error creating cost');
  }

  return await response.json();
}

/**
 * List costs with optional filters
 */
export async function listCosts(filters?: CostFilters): Promise<CostListResponse> {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
  }

  const url = `${API_BASE}/api/tracking/entries/list/${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch costs');
  }

  return await response.json();
}

/**
 * Get a single cost by ID
 */
export async function getCost(costId: number): Promise<Cost> {
  const response = await fetch(`${API_BASE}/api/tracking/entries/${costId}/`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.detail || 'Cost not found');
  }

  return await response.json();
}

/**
 * Update an existing cost
 */
export async function updateCost(
  costId: number,
  updates: UpdateCostRequest
): Promise<Cost> {
  const response = await fetch(`${API_BASE}/api/tracking/entries/${costId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    credentials: 'include',
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.detail || 'Error updating cost');
  }

  return await response.json();
}

/**
 * Delete a cost
 */
export async function deleteCost(costId: number): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tracking/entries/${costId}/`, {
    method: 'DELETE',
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.detail || 'Error deleting cost');
  }
}

/**
 * Get cost summary grouped by cuenta or month
 */
export async function getCostSummary(
  areaYearId: number,
  groupBy: 'cuenta' | 'month' = 'cuenta'
): Promise<CostSummaryResponse> {
  const response = await fetch(
    `${API_BASE}/api/tracking/summary/${areaYearId}/?group_by=${groupBy}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch summary');
  }

  return await response.json();
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string; service: string; version: string }> {
  const response = await fetch(`${API_BASE}/api/tracking/health/`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  if (!response.ok) {
    throw new Error('Health check failed');
  }

  return await response.json();
}

