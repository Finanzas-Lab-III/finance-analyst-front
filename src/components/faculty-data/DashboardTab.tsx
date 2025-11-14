"use client"
import React from "react";
import { User } from "lucide-react";
import MonthlyBudgetByCurrencyChart from "./MonthlyBudgetByCurrencyChart";
import InflationScenarios from "./InflationScenarios";

interface DashboardTabProps {
  isAdmin?: boolean;
  areaYearId?: string;
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
    usd_percentage: number;
    pesos_percentage: number;
    eur_percentage: number;
  } | null>(null);

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
        const qs = areaYearId ? `?areaYearId=${encodeURIComponent(areaYearId)}` : '';
        const res = await fetch(`${API_BASE_URL}/api/analyze/latest_totals/${qs}`);
        if (!res.ok) throw new Error('Failed to load totals');
        const json = await res.json();
        console.log('API Response:', json);

        if (!mounted) return;
        const responseData = {
          budget_pesos: json.budget_pesos,
          budget_usd: json.budget_usd,
          budget_eur: json.budget_eur,
          spent_pesos: json.spent_pesos,
          spent_usd: json.spent_usd,
          spent_eur: json.spent_eur,
          usd_percentage: json.usd_percentage,
          pesos_percentage: json.pesos_percentage,
          eur_percentage: json.eur_percentage
        };
        console.log('Processed Data:', responseData);
        setData(responseData);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || String(err));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    fetchLatestTotals();
    return () => { mounted = false; };
  }, [areaYearId]);

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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error al cargar las métricas: {error}</p>
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
              <div className="text-sm text-gray-500 uppercase">Pesos (ARS)</div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Presupuesto</span>
                  <span className="font-medium text-gray-900">$ {formatNumber(data.budget_pesos || 0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Gastado</span>
                  <span className="font-medium text-gray-900">$ {formatNumber(data.spent_pesos || 0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Porcentaje</span>
                  <span className="font-medium text-gray-900">{formatPercent(data.pesos_percentage || 0)}</span>
                </div>
                {(() => {
                  const diff = toDiffText(data.budget_pesos || 0, data.spent_pesos || 0);
                  return (
                    <div className={`flex items-center justify-between text-sm ${diff.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      <span>Diferencia</span>
                      <span className="font-semibold">{diff.text}</span>
                    </div>
                  );
                })()}
              </div>
            </div>
            {/* USD */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-sm text-gray-500 uppercase">Dólares (USD)</div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Presupuesto</span>
                  <span className="font-medium text-gray-900">US$ {formatNumber(data.budget_usd || 0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Gastado</span>
                  <span className="font-medium text-gray-900">US$ {formatNumber(data.spent_usd || 0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Porcentaje</span>
                  <span className="font-medium text-gray-900">{formatPercent(data.usd_percentage || 0)}</span>
                </div>
                {(() => {
                  const diff = toDiffText(data.budget_usd || 0, data.spent_usd || 0);
                  return (
                    <div className={`flex items-center justify-between text-sm ${diff.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      <span>Diferencia</span>
                      <span className="font-semibold">{diff.text}</span>
                    </div>
                  );
                })()}
              </div>
            </div>
            {/* EUR */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-sm text-gray-500 uppercase">Euros (EUR)</div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Presupuesto</span>
                  <span className="font-medium text-gray-900">€ {formatNumber(data.budget_eur || 0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Gastado</span>
                  <span className="font-medium text-gray-900">€ {formatNumber(data.spent_eur || 0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Porcentaje</span>
                  <span className="font-medium text-gray-900">{formatPercent(data.eur_percentage || 0)}</span>
                </div>
                {(() => {
                  const diff = toDiffText(data.budget_eur || 0, data.spent_eur || 0);
                  return (
                    <div className={`flex items-center justify-between text-sm ${diff.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      <span>Diferencia</span>
                      <span className="font-semibold">{diff.text}</span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
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
      {/*<MonthlyBudgetByCurrencyChart />*/}

      {/* Inflation Scenarios */}
      {/*<InflationScenarios />*/}
    </div>
  );
}