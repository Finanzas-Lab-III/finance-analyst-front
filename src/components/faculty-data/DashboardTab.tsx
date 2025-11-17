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
    budget_pesos: number;
    budget_usd: number;
    budget_eur: number;
    spent_pesos: number;
    spent_usd: number;
    spent_eur: number;
    pesos_percentage: number;
    usd_percentage: number;
    eur_percentage: number;
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
        const API_BASE_URL = (process.env.NEXT_PUBLIC_SERVICE_URL || '').replace(/\/+$/, '');
        // Fetch monthly budget data for charts and latest totals for currency cards
        const [latestTotalsRes, monthlyData] = await Promise.all([
          fetch(`${API_BASE_URL}/api/analyze/latest_totals/`),
          processBudgetFile(parseInt(areaYearId))
        ]);

        if (!latestTotalsRes.ok) throw new Error('Failed to load totals');
        const json = await latestTotalsRes.json();

        const monthly = (monthlyData?.data || []).filter(r => Boolean(r['Moneda']));

        if (!mounted) return;
        setMonthlyRows(monthly);
        // Use API-provided currency breakdown directly
        setData({
          budget_pesos: Number(json.budget_pesos ?? 0),
          budget_usd: Number(json.budget_usd ?? 0),
          budget_eur: Number(json.budget_eur ?? 0),
          spent_pesos: Number(json.spent_pesos ?? 0),
          spent_usd: Number(json.spent_usd ?? 0),
          spent_eur: Number(json.spent_eur ?? 0),
          pesos_percentage: Number(json.pesos_percentage ?? 0),
          usd_percentage: Number(json.usd_percentage ?? 0),
          eur_percentage: Number(json.eur_percentage ?? 0),
        });
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

  // We keep conversionRates state for charts; currency totals come directly from API now

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
            <User className="w-5 h-5 text-gray-600"/>
            <div className="flex flex-col">
              <h4 className="font-semibold text-gray-900">Progreso porcentual de gastos</h4>
              <p className=" text-gray-900">Comparamos lo presupuestado contra lo verdaderamente gastado para
                cada moneda</p>
            </div>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Pesos (ARS) */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-xs font-medium text-gray-500 uppercase">Pesos (ARS)</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">
                {formatPercent(data.pesos_percentage)}
              </div>
              <div className="mt-3 text-sm text-gray-600">Presupuesto: $ {formatNumber(data.budget_pesos)}</div>
              <div className="text-sm text-gray-600">Gastado: $ {formatNumber(data.spent_pesos)}</div>
            </div>
            {/* Dólares (USD) */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-xs font-medium text-gray-500 uppercase">Dólares (USD)</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">
                {formatPercent(data.usd_percentage)}
              </div>
              <div className="mt-3 text-sm text-gray-600">Presupuesto: US$ {formatNumber(data.budget_usd)}</div>
              <div className="text-sm text-gray-600">Gastado: US$ {formatNumber(data.spent_usd)}</div>
            </div>
            {/* Euros (EUR) */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-xs font-medium text-gray-500 uppercase">Euros (EUR)</div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">
                {formatPercent(data.eur_percentage)}
              </div>
              <div className="mt-3 text-sm text-gray-600">Presupuesto: € {formatNumber(data.budget_eur)}</div>
              <div className="text-sm text-gray-600">Gastado: € {formatNumber(data.spent_eur)}</div>
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