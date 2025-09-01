"use client"
import React from "react";
import { Download, FileText, Eye, MessageSquare } from "lucide-react";
import { useSeguimientoDocuments } from "@/hooks/useSeguimientoDocuments";
import { buildRawFileUrl } from "@/api/userService";

interface TrackingTabProps {
  areaYearId: string | number;
}

export default function TrackingTab({ areaYearId }: TrackingTabProps) {
  const { loading, error, bySubarea } = useSeguimientoDocuments(areaYearId);

  const sections: Array<{ key: string; title: string; description: string; color: string; iconColor: string }> = [
    { key: "3plus9", title: "Trimestral (3+9)", description: "3 meses ejecutados + 9 proyectados", color: "blue", iconColor: "text-blue-600" },
    { key: "6plus6", title: "Semestral (6+6)", description: "6 meses ejecutados + 6 proyectados", color: "green", iconColor: "text-green-600" },
    { key: "9plus3", title: "Avanzado (9+3)", description: "9 meses ejecutados + 3 proyectados", color: "purple", iconColor: "text-purple-600" },
  ];

  const monthOrder = [
    "enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"
  ];

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900">Seguimientos Presupuestarios</h3>
        <p className="text-gray-600 mt-2">Documentos de seguimiento y análisis presupuestario organizados por períodos</p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border-2 border-blue-200">
        <div className="flex items-center mb-6">
          <div className="w-3 h-8 bg-blue-600 rounded-full mr-4"></div>
          <div>
            <h4 className="text-2xl font-bold text-gray-900">Seguimientos 2025 (Año Actual)</h4>
            <p className="text-blue-700 font-medium">Análisis y proyecciones del año en curso</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {sections.map((s) => {
            const docs = bySubarea[s.key] || [];
            const versionById = new Map<number, string>();
            docs.forEach((d, idx) => {
              const label = `V${docs.length - idx}`; // newest (idx 0) -> Vn
              versionById.set(d.id, label);
            });
            return (
              <div key={s.key} className={`bg-white rounded-lg p-6 border border-${s.color}-200 shadow-sm`}>
                <div className="flex items-center mb-4">
                  <div className={`w-10 h-10 bg-${s.color}-100 rounded-lg flex items-center justify-center mr-3`}>
                    <FileText className={`w-5 h-5 ${s.iconColor}`} />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">{s.title}</h5>
                    <p className="text-sm text-gray-600">{s.description}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {loading && (
                    <div className="text-sm text-gray-500">Cargando…</div>
                  )}
                  {!loading && docs.length === 0 && (
                    <div className="text-sm text-gray-400">Sin documentos</div>
                  )}
                  {!loading && docs.slice(0, 3).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 text-sm truncate" title={doc.title}>{versionById.get(doc.id) ?? "V1"}</p>
                        <p className="text-xs text-gray-600">{new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                      <a href={buildRawFileUrl(doc.id)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 p-1" title="Descargar">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center mb-6">
          <div className="w-3 h-8 bg-green-600 rounded-full mr-4"></div>
          <div>
            <h4 className="text-xl font-bold text-gray-900">Seguimientos Mensuales 2025</h4>
            <p className="text-gray-600">Análisis detallado mes a mes del año actual</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 bg-gray-100 border-b border-gray-200 rounded-t-lg">
            <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-700">
              <div>Mes</div>
              <div>Documento</div>
              <div>Fecha</div>
              <div>Notas</div>
              <div>Acciones</div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {monthOrder.map((m) => {
              const docs = bySubarea[m] || [];
              const latest = docs[0];
              const latestVersion = latest ? `V${docs.length}` : null;
              return (
                <div key={m} className="px-6 py-4 hover:bg-gray-50">
                  <div className="grid grid-cols-5 gap-4 items-center">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-gray-900 font-medium capitalize">{m}</span>
                    </div>
                    <div className="text-gray-900 font-medium truncate">{latest ? latestVersion : "—"}</div>
                    <div className="text-gray-600 text-sm">{latest ? new Date(latest.created_at).toLocaleDateString() : "—"}</div>
                    <div className="text-gray-600 text-sm truncate">{latest?.notes ?? ""}</div>
                    <div>
                      {latest ? (
                        <div className="flex items-center space-x-1">
                          <button className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors" title="Vista rápida">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50 transition-colors" title="Comentarios">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <a href={latest ? buildRawFileUrl(latest.id) : undefined} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors" title="Descargar">
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Pendiente</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

