"use client"
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";
import { useAuth } from "../../../components/AuthContext";
import { fetchUserFacultiesAreas, AreaInChargeDto, FacultyInChargeDto } from "../../../api/userService";

export default function ArchivePage() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = useMemo(() => user?.id ?? null, [user]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [areas, setAreas] = useState<AreaInChargeDto[]>([]);
  const [facultades, setFacultades] = useState<FacultyInChargeDto[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUserFacultiesAreas(userId);
        if (cancelled) return;
        setAreas(data.areas_in_charge || []);
        setFacultades(data.faculties_in_charge || []);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ? String(e.message) : "Error cargando datos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  const showFacultades = facultades.length > 0;
  const showAreas = areas.length > 0;
  const showEmpty = !loading && !error && !showFacultades && !showAreas;

  const goToYears = (id: number) => {
    router.push(`/backoffice/faculty/${encodeURIComponent(id)}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <Archive className="w-8 h-8 mr-3 text-gray-600" />
          <h1 className="text-3xl font-bold text-gray-900">Facultades y áreas a cargo</h1>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-gray-600">Cargando…</div>
      )}

      {error && (
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 text-red-700">{error}</div>
      )}

      {showFacultades && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Facultades a cargo</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área/Facultad</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {facultades.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50 cursor-pointer">
                    <td onClick={() => goToYears(f.id)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{f.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAreas && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Áreas a cargo</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área/Facultad</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {areas.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 cursor-pointer">
                    <td onClick={() => goToYears(a.id)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {a.name}{a.parent?.name ? ` — ${a.parent.name}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showEmpty && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center text-gray-600">
          No hay facultades ni áreas a cargo para este usuario.
        </div>
      )}
    </div>
  );
}
