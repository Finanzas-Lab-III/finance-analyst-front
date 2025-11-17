"use client";
import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
// No chart libraries needed: show numeric squares only

export default function DashboardSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    total_budget: string | number;
    total_spent: string | number;
    progress_percentage: string | number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchLatestTotals() {
      try {
        const API_BASE_URL = (process.env.NEXT_PUBLIC_SERVICE_URL || '').replace(/\/+$/, '');
        const res = await fetch(`${API_BASE_URL}/api/analyze/latest_totals/`);
        if (!res.ok) throw new Error('Failed to load totals');
        const json = await res.json();
        console.log('API Response:', json);

        if (!mounted) return;
        setData(json);
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
  }, []);

  if (loading) return <div>Loading dashboard…</div>;
  if (error) return <div className="text-red-600">Error loading dashboard: {error}</div>;
  if (!data) return <div>No data</div>;

  console.log('Rendering data:', data);
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <User className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Dashboard</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded border flex flex-col items-start">
          <div className="text-xs text-gray-500 uppercase">Pesos (ARS)</div>
          <div className="mt-2 text-2xl font-semibold">{Number(data.pesos_percentage ?? 0).toFixed(2)}%</div>
          <div className="mt-3 text-sm text-gray-600">Presupuesto: $ {Number(data.budget_pesos ?? 0).toLocaleString('es-AR')}</div>
          <div className="text-sm text-gray-600">Gastado: $ {Number(data.spent_pesos ?? 0).toLocaleString('es-AR')}</div>
        </div>
        <div className="p-6 bg-white rounded border flex flex-col items-start">
          <div className="text-xs text-gray-500 uppercase">Dólares (USD)</div>
          <div className="mt-2 text-2xl font-semibold">{Number(data.usd_percentage ?? 0).toFixed(2)}%</div>
          <div className="mt-3 text-sm text-gray-600">Presupuesto: US$ {Number(data.budget_usd ?? 0).toLocaleString('es-AR')}</div>
          <div className="text-sm text-gray-600">Gastado: US$ {Number(data.spent_usd ?? 0).toLocaleString('es-AR')}</div>
        </div>
        <div className="p-6 bg-white rounded border flex flex-col items-start">
          <div className="text-xs text-gray-500 uppercase">Euros (EUR)</div>
          <div className="mt-2 text-2xl font-semibold">{Number(data.eur_percentage ?? 0).toFixed(2)}%</div>
          <div className="mt-3 text-sm text-gray-600">Presupuesto: € {Number(data.budget_eur ?? 0).toLocaleString('es-AR')}</div>
          <div className="text-sm text-gray-600">Gastado: € {Number(data.spent_eur ?? 0).toLocaleString('es-AR')}</div>
        </div>
      </div>
    </div>
  );
}
