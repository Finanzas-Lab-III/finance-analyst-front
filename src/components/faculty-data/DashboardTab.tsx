"use client"
import React from "react";
import { User } from "lucide-react";

interface DashboardTabProps {
  isAdmin?: boolean;
}

export default function DashboardTab({ isAdmin = false }: DashboardTabProps) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<{
    total_budget: string | number;
    total_spent: string | number;
    progress_percentage: string | number;
  } | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function fetchLatestTotals() {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_SERVICE_URL ?? '';
        const res = await fetch(`${API_BASE_URL}/api/analyze/latest_totals/`);
        if (!res.ok) throw new Error('Failed to load totals');
        const json = await res.json();
        console.log('API Response:', json);

        if (!mounted) return;
        const responseData = {
          total_budget: json.total_budget,
          total_spent: json.total_spent,
          progress_percentage: json.progress_percentage
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
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-32">
      <div className="text-gray-600">Cargando datos...</div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-800">Error al cargar los datos: {error}</p>
    </div>
  );

  if (!data) return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <p className="text-yellow-800">No hay datos disponibles.</p>
    </div>
  );

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

      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <User className="w-5 h-5 text-gray-600" />
          <h4 className="font-semibold text-gray-900">Métricas Principales</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-sm text-gray-500 uppercase">Presupuesto Total</div>
            <div className="mt-2 text-2xl font-semibold text-gray-900">
              {String(data.total_budget)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-sm text-gray-500 uppercase">Total Gastado</div>
            <div className="mt-2 text-2xl font-semibold text-gray-900">
              {String(data.total_spent)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="text-sm text-gray-500 uppercase">Porcentaje de Progreso</div>
            <div className="mt-2 text-2xl font-semibold text-gray-900">
              {String(data.progress_percentage)}
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 text-lg mb-4">Información Adicional</h4>
          <p className="text-gray-600 text-sm">
            Como administrador, puede ver información detallada y gestionar los presupuestos.
          </p>
          {/* Add any admin-specific metrics or controls here */}
        </div>
      )}
    </div>
  );
}