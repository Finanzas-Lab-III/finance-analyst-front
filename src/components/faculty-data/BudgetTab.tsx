"use client"
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Download, Upload, FileText, ChevronDown, ChevronRight, Loader2, CheckCircle, X } from "lucide-react";
import { ArmadoDocument, AreaYearStatus, createAreaYearStatus } from "@/api/userService";
import { useRouter } from "next/navigation";
import { useArmadoAI } from "@/components/armado/hooks/useArmadoAI";

function AutoResizingTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const autoResize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  useEffect(() => {
    autoResize();
  }, [value]);
  useEffect(() => {
    autoResize();
  }, []);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onInput={autoResize}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black resize-none overflow-hidden"
    />
  );
}

interface BudgetTabProps {
  latest: ArmadoDocument | null | undefined;
  history: ArmadoDocument[] | undefined;
  onOpenUpload: () => void;
  areaYearId: string | number;
  isAdmin?: boolean;
  currentStatus?: AreaYearStatus | null;
}

export default function BudgetTab({ latest, history = [], onOpenUpload, areaYearId, isAdmin = false, currentStatus = null }: BudgetTabProps) {
  const USERS_API_BASE = "";
  const router = useRouter();
  const { analysisResults, analysisLoading, analysisError, noData } = useArmadoAI(String(areaYearId));
  const [showDetails, setShowDetails] = useState(false);
  const [exportingPrev, setExportingPrev] = useState(false);
  const [exportingPrevBudget, setExportingPrevBudget] = useState(false);
  const [exportingHybrid, setExportingHybrid] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeComment, setChangeComment] = useState("");
  const [submittingAction, setSubmittingAction] = useState<null | "approve" | "request_changes">(null);

  const { totalErrors, groupedByRule } = useMemo(() => {
    const byRule = new Map<string, { count: number; items: any[] }>();
    for (const it of analysisResults || []) {
      const key = String(it.rule || "Desconocida");
      const group = byRule.get(key) || { count: 0, items: [] };
      group.count += 1;
      group.items.push(it);
      byRule.set(key, group);
    }
    let total = 0;
    byRule.forEach((g) => (total += g.count));
    return { totalErrors: total, groupedByRule: byRule };
  }, [analysisResults]);

  const handleDownload = (doc: ArmadoDocument) => {
    if (!doc?.id) return;
    const url = `${USERS_API_BASE}/api/archivo/${doc.id}?raw=true`;
    // Open in a new tab to let the browser handle file download (avoids CORS issues with fetch)
    window.open(url, "_blank");
  };

  const canAdminAct = isAdmin && currentStatus === "REVISION_FINANZAS";
  const budgetLockedForNonAdmin = !isAdmin && (currentStatus === "REVISION_FINANZAS" || currentStatus === "APROBADO");

  const approveBudget = async () => {
    try {
      setSubmittingAction("approve");
      await createAreaYearStatus(areaYearId, "APROBADO");
      window.location.reload();
    } catch (e) {
      console.error(e);
      try { alert("No se pudo aprobar el presupuesto"); } catch {}
    } finally {
      setSubmittingAction(null);
    }
  };

  const submitChangeRequest = async () => {
    const API_BASE = (process.env.NEXT_PUBLIC_SERVICE_URL || "http://localhost:8000").replace(/\/+$/, "");
    const comment = changeComment.trim();
    if (!comment) {
      try { alert("Escribe un comentario para solicitar cambios"); } catch {}
      return;
    }
    try {
      setSubmittingAction("request_changes");
      // 1) Cambiar estado
      await createAreaYearStatus(areaYearId, "NECESITA_CAMBIOS_FINANZAS");
      // 2) Crear comentario
      const res = await fetch(`${API_BASE}/api/coments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        credentials: "include",
        body: JSON.stringify({
          areaYearId: Number(areaYearId),
          comentario: comment,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Error ${res.status}`);
      }
      setShowChangeModal(false);
      setChangeComment("");
      window.location.reload();
    } catch (e) {
      console.error(e);
      try { alert("No se pudo enviar la solicitud de cambios"); } catch {}
    } finally {
      setSubmittingAction(null);
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900">Gestión de Presupuesto</h3>


      {/* Deviations summary box */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900 text-lg">Desviaciones vs. año pasado</h4>
          <button
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            onClick={() => setShowDetails((v) => !v)}
            disabled={analysisLoading || (!!analysisError) || noData}
          >
            {showDetails ? <ChevronDown className="w-4 h-4 mr-1"/> : <ChevronRight className="w-4 h-4 mr-1"/>}
            Ver detalle
          </button>
        </div>
        <p className="text-gray-600 text-sm mb-4">En esta sección se muestran valores en el presupuesto actual que aparentan ser incoherentes con  presupuestos de años anteriores.</p>

        {analysisLoading && (
          <div className="flex items-center text-gray-600 text-sm">
            <Loader2 className="w-4 h-4 mr-2 animate-spin"/> Analizando presupuesto...
          </div>
        )}
        {noData && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
            No hay gráficos para mostrar todavía.
          </div>
        )}
        {analysisError && (
          <div className="text-sm text-gray-700">{analysisError}</div>
        )}

        {!analysisLoading && !analysisError && (
          <div>
            {totalErrors > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-900">
                    Se encontraron <span className="font-semibold">{totalErrors}</span> desviaciones respecto al año
                    pasado.
                  </p>
                </div>

                {/* Grouped counts by rule */}
                <div className="mt-3 space-y-2">
                  {Array.from(groupedByRule.entries()).map(([rule, group]) => (
                    <div key={rule} className="flex items-start justify-between">
                      <div className="text-sm text-gray-800">
                        <span className="font-medium">{group.count}</span> de {rule}
                      </div>
                    </div>
                  ))}
                </div>

                {showDetails && (
                  <div className="mt-4 border-t border-gray-100 pt-3 space-y-3">
                    {Array.from(groupedByRule.entries()).map(([rule, group]) => (
                      <div key={rule}>
                        <div className="text-sm font-semibold text-gray-900 mb-1">{rule} ({group.count})</div>
                        <ul className="list-disc ml-5 space-y-1">
                          {group.items.map((it, idx) => (
                            <li key={idx} className="text-sm text-gray-700">
                              Fila {it.row ?? "-"}: {it.error || "Observación"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                No se encontraron desviaciones.
              </div>
            )}
          </div>
        )}
      </div>
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-gray-900 text-lg">Presupuesto</h4>
            <p className="text-gray-600 text-sm mt-1">Versión actual del presupuesto</p>
          </div>
          <div className="flex space-x-2">
            {canAdminAct && (
              <>
                <button
                  onClick={() => setShowChangeModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                  title="Solicitar cambios al director"
                  disabled={submittingAction != null}
                >
                  <span>Pedir Cambios</span>
                </button>
                <button
                  onClick={approveBudget}
                  className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  disabled={submittingAction === "approve"}
                  title="Aprobar presupuesto"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{submittingAction === "approve" ? "Aprobando..." : "Aprobar presupuesto"}</span>
                </button>
              </>
            )}
            {!canAdminAct && (
              <>
            <button
              onClick={async () => {
                try {
                  setExportingPrevBudget(true);
                  const API_BASE = process.env.NEXT_PUBLIC_SERVICE_URL ?? 'http://localhost:8000';
                  const url = `${API_BASE}/api/armado/budget/areayear/${encodeURIComponent(String(areaYearId))}/previous/export`;
                  const res = await fetch(url, {
                    method: 'GET',
                    headers: {
                      Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream;q=0.9, */*;q=0.8',
                      'ngrok-skip-browser-warning': 'true',
                    },
                    credentials: 'include',
                  });
                  if (!res.ok) {
                    try {
                      const ct = (res.headers.get('content-type') || '').toLowerCase();
                      if (ct.includes('application/json')) {
                        const data: any = await res.json().catch(() => null);
                        const msg = String(data?.message || data?.error || `Error ${res.status}`);
                        alert(msg);
                      } else {
                        const txt = await res.text().catch(() => '');
                        const msg = txt && txt.length < 300 ? txt : `Error ${res.status}`;
                        alert(msg);
                      }
                    } catch {
                      alert(`Error ${res.status}`);
                    } finally {
                      setExportingPrevBudget(false);
                    }
                    return;
                  }
                  const ctOk = (res.headers.get('content-type') || '').toLowerCase();
                  if (ctOk.includes('application/json')) {
                    try {
                      const data: any = await res.json().catch(() => null);
                      const msg = String(data?.message || data?.error || 'No se pudo exportar el presupuesto del año anterior');
                      alert(msg);
                    } finally {
                      setExportingPrevBudget(false);
                    }
                    return;
                  }
                  const blob = await res.blob();
                  const cd = res.headers.get('content-disposition') || '';
                  const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(cd);
                  const filename = match ? decodeURIComponent(match[1]) : `presupuesto-anio-anterior-${String(areaYearId)}.xlsx`;
                  const link = document.createElement('a');
                  const href = URL.createObjectURL(blob);
                  link.href = href;
                  link.download = filename;
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  URL.revokeObjectURL(href);
                } catch (e) {
                  console.error(e);
                  try { alert('No se pudo exportar el presupuesto del año anterior'); } catch {}
                } finally {
                  setExportingPrevBudget(false);
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={exportingPrevBudget}
              title="Exportar presupuesto del año anterior"
            >
              <Download className="w-4 h-4" />
              <span>{exportingPrevBudget ? 'Exportando...' : 'Presupuesto año anterior'}</span>
            </button>
            <button
              onClick={async () => {
                try {
                  setExportingHybrid(true);
                  const API_BASE = process.env.NEXT_PUBLIC_SERVICE_URL ?? 'http://localhost:8000';
                  const url = `${API_BASE}/api/armado/summary/areayear/${encodeURIComponent(String(areaYearId))}/hybrid/previous/export`;
                  const res = await fetch(url, {
                    method: 'GET',
                    headers: {
                      Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream;q=0.9, */*;q=0.8',
                      'ngrok-skip-browser-warning': 'true',
                    },
                    credentials: 'include',
                  });
                  if (!res.ok) {
                    throw new Error(`Error ${res.status}`);
                  }
                  const blob = await res.blob();
                  const cd = res.headers.get('content-disposition') || '';
                  const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(cd);
                  const filename = match ? decodeURIComponent(match[1]) : `presupuesto-hibrido-${String(areaYearId)}.xlsx`;
                  const link = document.createElement('a');
                  const href = URL.createObjectURL(blob);
                  link.href = href;
                  link.download = filename;
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  URL.revokeObjectURL(href);
                } catch (e) {
                  console.error(e);
                  try { alert('No se pudo exportar el presupuesto híbrido'); } catch {}
                } finally {
                  setExportingHybrid(false);
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={exportingHybrid}
              title="Exportar presupuesto híbrido"
            >
              <Download className="w-4 h-4" />
              <span>{exportingHybrid ? 'Exportando...' : 'Presupuesto híbrido'}</span>
            </button>
            <button
              onClick={async () => {
                try {
                  setExportingPrev(true);
                  const API_BASE = process.env.NEXT_PUBLIC_SERVICE_URL ?? 'http://localhost:8000';
                  const url = `${API_BASE}/api/armado/summary/areayear/${encodeURIComponent(String(areaYearId))}/previous/export`;
                  const res = await fetch(url, {
                    method: 'GET',
                    headers: {
                      Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream;q=0.9, */*;q=0.8',
                      'ngrok-skip-browser-warning': 'true',
                    },
                    credentials: 'include',
                  });
                  if (!res.ok) {
                    try {
                      const ct = (res.headers.get('content-type') || '').toLowerCase();
                      if (ct.includes('application/json')) {
                        const data: any = await res.json().catch(() => null);
                        const msg = String(data?.message || data?.error || `Error ${res.status}`);
                        alert(msg);
                      } else {
                        const txt = await res.text().catch(() => '');
                        const msg = txt && txt.length < 300 ? txt : `Error ${res.status}`;
                        alert(msg);
                      }
                    } catch {
                      alert(`Error ${res.status}`);
                    } finally {
                      setExportingPrev(false);
                    }
                    return;
                  }
                  const ctOk = (res.headers.get('content-type') || '').toLowerCase();
                  if (ctOk.includes('application/json')) {
                    try {
                      const data: any = await res.json().catch(() => null);
                      const msg = String(data?.message || data?.error || 'No se pudo exportar los gastos del año anterior');
                      alert(msg);
                    } finally {
                      setExportingPrev(false);
                    }
                    return;
                  }
                  const blob = await res.blob();
                  const cd = res.headers.get('content-disposition') || '';
                  const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i.exec(cd);
                  const filename = match ? decodeURIComponent(match[1]) : `gastos-anio-anterior-${String(areaYearId)}.xlsx`;
                  const link = document.createElement('a');
                  const href = URL.createObjectURL(blob);
                  link.href = href;
                  link.download = filename;
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  URL.revokeObjectURL(href);
                } catch (e) {
                  console.error(e);
                  try { alert('No se pudo exportar los gastos del año anterior'); } catch {}
                } finally {
                  setExportingPrev(false);
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={exportingPrev}
              title="Exportar gastos del año anterior"
            >
              <Download className="w-4 h-4" />
              <span>{exportingPrev ? 'Exportando...' : 'Gastos del año anterior'}</span>
            </button>
            <button
              onClick={() => latest && handleDownload(latest)}
              disabled={!latest}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>Descargar</span>
            </button>
            <button 
              onClick={onOpenUpload}
              disabled={budgetLockedForNonAdmin}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              <span>Nueva Versión</span>
            </button>
              </>
            )}
          </div>
        </div>
        {latest ? (
          <div
            className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-50"
            onClick={() => {
              if (!latest?.id) return;
              const url = `/armado/${areaYearId}/${latest.id}`;
              window.open(url, "_blank", "noopener,noreferrer");
            }}
            title="Abrir presupuesto actual"
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-gray-900 font-medium">{latest.title || latest.file_key}</p>
                <p className="text-gray-600 text-sm">{new Date(latest.created_at).toLocaleDateString('es-AR')}</p>
                {latest.notes && <p className="text-xs text-gray-500 mt-1">{latest.notes}</p>}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">No hay presupuesto disponible aún.</p>
          </div>
        )}
      </div>

      {showChangeModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xxs bg-white/30">
          <div className="bg-white rounded-lg p-6 w-[90%] border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Solicitar Cambios</h3>
              <button
                onClick={() => setShowChangeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentario
                </label>
                <AutoResizingTextarea
                  value={changeComment}
                  onChange={setChangeComment}
                  placeholder="Detalla los cambios solicitados…"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowChangeModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={submitChangeRequest}
                  disabled={submittingAction === "request_changes"}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  {submittingAction === "request_changes" ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 text-lg mb-4">Historial de Versiones</h4>
        <p className="text-gray-600 text-sm mb-4">Versiones históricas del presupuesto con cambios y mejoras</p>
        <div className="space-y-3">
          {history.map((doc, index) => (
            <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">v{index + 1 + 1}</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{doc.title || doc.file_key}</h5>
                      {doc.notes && <p className="text-sm text-gray-600 mt-1">{doc.notes}</p>}
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString('es-AR')}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-900 font-medium truncate max-w-[240px]">{doc.file_key}</p>
                  </div>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="text-sm text-gray-500">No hay versiones anteriores.</div>
          )}
        </div>
      </div>
    </div>
  );
}


