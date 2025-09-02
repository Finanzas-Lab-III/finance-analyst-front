"use client"
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchYearsOfArea, YearsOfAreaItemDto, AreaYearStatus } from "../../../../api/userService";
import { statusColor, statusLabelEs } from "@/lib/areaYearStatus";

export default function AreaYearsPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id as string;
  const areaId = useMemo(() => (rawId ? decodeURIComponent(rawId) : null), [rawId]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<YearsOfAreaItemDto[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!areaId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchYearsOfArea(areaId);
        if (cancelled) return;
        setItems(Array.isArray(data.yearsOfArea) ? data.yearsOfArea : []);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ? String(e.message) : "Error cargando años del área");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [areaId]);

  const current = items.filter(i => i.isCurrent);
  const future = items.filter(i => i.isFuture && !i.isCurrent);
  const others = items.filter(i => !i.isCurrent && !i.isFuture).sort((a, b) => b.year - a.year);

  // Helper function to get area display name abbreviation
  const getAreaDisplayName = (areaId: string) => {
    // Map area IDs to their abbreviations for display
    // This is a simplified mapping - in a real app you'd fetch this from the API
    const areaMap: Record<string, string> = {
      // Add mappings based on your area IDs
      'ingenieria': 'FI',
      'laboratorio': 'FI', 
      'biomedica': 'FI',
      'facultad-de-ingenieria': 'FI',
      // Add more mappings as needed
    };
    
    // Try to extract area name from areaId if it's not directly mapped
    const lowerAreaId = String(areaId).toLowerCase();
    for (const [key, value] of Object.entries(areaMap)) {
      if (lowerAreaId.includes(key)) {
        return value;
      }
    }
    
    // Default abbreviation
    return 'FI';
  };

  const renderTable = (title: string, rows: YearsOfAreaItemDto[]) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-1/2" />
            <col className="w-1/2" />
          </colgroup>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Presupuesto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((r) => (
              <tr 
                key={r.area_year_id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  const url = `/backoffice/faculty-data/${r.area_year_id}`;
                  router.push(url);
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  Presupuesto {getAreaDisplayName(areaId || '')} {r.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(r.status)}`}>
                    {statusLabelEs(r.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Años del Área</h1>
          <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 text-sm">Volver</button>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-600">Cargando…</div>
      )}

      {error && (
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 text-red-700">{error}</div>
      )}

      {!loading && !error && (
        <>
          {current.length > 0 && renderTable("Actual", current)}
          {future.length > 0 && renderTable("Futuros", future)}
          {others.length > 0 && renderTable("Históricos", others)}
          {current.length === 0 && future.length === 0 && others.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center text-gray-600">
              No hay años disponibles para esta área.
            </div>
          )}
        </>
      )}
    </div>
  );
}


