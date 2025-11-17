"use client"
import React from "react";
import { User } from "lucide-react";
import MonthlyBudgetByCurrencyChart from "./MonthlyBudgetByCurrencyChart";
import InflationAdjustmentChart from "./InflationAdjustmentChart";
import { processBudgetFile, BudgetDataItem } from "@/lib/budget-api";
import { toFriendlyError, formatFriendlyErrorInline } from "@/lib/http-errors";

interface DashboardTabProps {
  isAdmin?: boolean;
  areaYearId: string;
}

export default function DashboardTab({ isAdmin = false, areaYearId }: DashboardTabProps) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<{
    total_budget: number;
    total_spent: number;
    progress_percentage: number;
  } | null>(null);
  const [monthlyRows, setMonthlyRows] = React.useState<BudgetDataItem[] | null>(null);
  const [conversionRates, setConversionRates] = React.useState<Record<string, number>>({
    USD: 1050,
    EUR: 1150,
    Pesos: 1,
    ARS: 1,
  });
  const MONTH_COLUMNS = React.useMemo(() => (
    ['Jan-24','Feb-24','Mar-24','Apr-24','May-24','Jun-24','Jul-24','Aug-24','Sep-24','Oct-24','Nov-24','Dec-24']
  ), []);

  const DEFAULT_CONVERSION_RATES: Record<string, number> = conversionRates;

  const formatNumber = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return String(value);
    return num.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  const formatPercent = (value: number): string => {
    if (value === null || value === undefined) return '-';
    const num = Number(value);
    if (isNaN(num)) return '-';
    return `${num.toFixed(2)}%`;
  };

  const toDiffText = (budget: number, spent: number): { text: string; isPositive: boolean } => {
    const diff = (budget || 0) - (spent || 0);
    return {
      text: `${diff >= 0 ? '+' : ''}${formatNumber(diff)}`,
      isPositive: diff >= 0
    };
  };

  React.useEffect(() => {
    let mounted = true;
    async function fetchLatestTotals() {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_SERVICE_URL ?? '';
        // Fetch monthly budget data for computing total budget from the same source as the monthly chart
        const [latestTotalsRes, monthlyData] = await Promise.all([
          fetch(`${API_BASE_URL}/api/analyze/latest_totals/`),
          processBudgetFile(parseInt(areaYearId))
        ]);

        if (!latestTotalsRes.ok) throw new Error('Failed to load totals');
        const json = await latestTotalsRes.json();

        // Compute total budget in ARS by summing month columns (same method as chart)
        const computeTotalBudgetARS = (rows: BudgetDataItem[]): number => {
          return rows
            .filter(r => Boolean(r['Moneda']))
            .reduce((sum, row) => {
              const currencyRaw = String(row['Moneda']);
              const rate =
                DEFAULT_CONVERSION_RATES[currencyRaw as keyof typeof DEFAULT_CONVERSION_RATES] ??
                DEFAULT_CONVERSION_RATES[currencyRaw.toUpperCase() as keyof typeof DEFAULT_CONVERSION_RATES] ??
                1;
              const rowMonthlyTotal = MONTH_COLUMNS.reduce((acc, col) => {
                const v = (row as any)[col];
                const num = typeof v === 'number' ? v : parseFloat(String(v)) || 0;
                return acc + num;
              }, 0);
              return sum + rowMonthlyTotal * rate;
            }, 0);
        };

        const monthly = (monthlyData?.data || []).filter(r => Boolean(r['Moneda']));
        const totalBudgetARS = computeTotalBudgetARS(monthly);

        if (!mounted) return;
        // Calculate progress percentage based on total_budget and total_spent
        const totalSpent = json.total_spent || 0;
        const progressPercentage = totalBudgetARS > 0 
          ? (totalSpent / totalBudgetARS) * 100 
          : 0;
        
        const responseData = {
          total_budget: totalBudgetARS,
          total_spent: totalSpent,
          progress_percentage: progressPercentage
        };
        setMonthlyRows(monthly);
        setData(responseData);
      } catch (err: any) {
        if (!mounted) return;
        const friendly = toFriendlyError(err, 'No se pudieron cargar las métricas del panel.');
        // If there are simply no budgets uploaded yet, show a neutral no-data state
        if (friendly.code === 400 || friendly.code === 404) {
          setMonthlyRows([] as any);
          setData(null);
          setError(null);
        } else {
          setError(formatFriendlyErrorInline(friendly));
        }
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    fetchLatestTotals();
    return () => { mounted = false; };
  }, [areaYearId]);

  // Recompute total budget when conversion rates change
  React.useEffect(() => {
    if (!monthlyRows || !data) return;
    const computeTotalBudgetARS = (rows: BudgetDataItem[]): number => {
      return rows
        .filter(r => Boolean(r['Moneda']))
        .reduce((sum, row) => {
          const currencyRaw = String(row['Moneda']);
          const rate =
            conversionRates[currencyRaw as keyof typeof conversionRates] ??
            conversionRates[currencyRaw.toUpperCase() as keyof typeof conversionRates] ??
            1;
          const rowMonthlyTotal = MONTH_COLUMNS.reduce((acc, col) => {
            const v = (row as any)[col];
            const num = typeof v === 'number' ? v : parseFloat(String(v)) || 0;
            return acc + num;
          }, 0);
          return sum + rowMonthlyTotal * rate;
        }, 0);
    };

    const totalBudgetARS = computeTotalBudgetARS(monthlyRows);
    // Recalculate progress percentage when total budget changes
    const totalSpent = data.total_spent || 0;
    const progressPercentage = totalBudgetARS > 0 
      ? (totalSpent / totalBudgetARS) * 100 
      : 0;
    
    setData({ ...data, total_budget: totalBudgetARS, progress_percentage: progressPercentage });
  }, [conversionRates]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Panel de Control</h3>
          <p className="text-gray-600 text-sm mt-1">
            {isAdmin ? 'Vista general del presupuesto' : 'Resumen de su presupuesto'}
          </p>
        </div>
      </div>

      {/* Metrics section - conditionally render based on API state */}
      {loading && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-600">Cargando métricas...</div>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-700">{error}</p>
        </div>
      )}

      {!loading && !error && data && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-900">Métricas Principales</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* ARS */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-sm text-gray-500 uppercase">Presupuesto Total</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">
                $ {formatNumber(data.total_budget)}
              </div>
            </div>
            {/* USD */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-sm text-gray-500 uppercase">Total Gastado</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">
                $ {formatNumber(data.total_spent)}
              </div>
            </div>
            {/* EUR */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-sm text-gray-500 uppercase">Porcentaje de Progreso</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">
                {formatNumber(data.progress_percentage)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && !data && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="text-gray-700">No hay gráficos para mostrar todavía.</div>
        </div>
      )}

      {isAdmin && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 text-lg mb-4">Información Adicional</h4>
          <p className="text-gray-600 text-sm">
            Como administrador, puede ver información detallada y gestionar los presupuestos.
          </p>
          {/* Add any admin-specific metrics or controls here */}
        </div>
      )}

      {/* Monthly Budget by Currency Chart */}
      <MonthlyBudgetByCurrencyChart 
        areaYearId={parseInt(areaYearId)}
        conversionRates={conversionRates}
        onConversionRatesChange={setConversionRates}
      />

      {/* Inflation Adjustment Chart */}
      <InflationAdjustmentChart areaYearId={parseInt(areaYearId)} />
    </div>
  );
}