"use client"
import React, { useEffect, useMemo, useState } from "react";

type PaymentRecord = {
  id?: number; // identificador del gasto, usado para updates
  fila: number;
  denominacion: string | null;
  observaciones: string | null;
  status: string | null;
  total: number | string | null;
  moneda: string | null;
  totalPagado: number | null;
  mes: string;
};

type PaymentsResponse = Record<string, PaymentRecord[]>;

interface CalendarTabProps {
  areaYearId: string | number;
  year?: number | string;
}

const MONTHS: string[] = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function titleCase(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function parseNumber(value: number | string | null): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function normalizeCurrency(currency: string | null): string {
  if (!currency) return "";
  const c = currency.toLowerCase();
  if (c.includes("peso")) return "ARS";
  if (c.includes("usd")) return "USD";
  if (c.includes("eur")) return "EUR";
  return currency;
}

function extractRecordId(rec: PaymentRecord): number | null {
  const anyRec = rec as any;
  const candidateKeys = [
    'id',
    'payment_id', 'paymentId',
    'gasto_id', 'gastoId',
    'cost_id', 'costId',
    'id_gasto', 'id_costo',
    'row_id'
  ];
  for (const key of candidateKeys) {
    const v = anyRec?.[key];
    const n = typeof v === 'string' ? Number(v) : v;
    if (typeof n === 'number' && Number.isFinite(n)) return n;
  }
  if (typeof rec.fila === 'number' && Number.isFinite(rec.fila)) return rec.fila;
  return null;
}

export default function CalendarTab({ areaYearId, year }: CalendarTabProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentsResponse | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [formStatus, setFormStatus] = useState<string>('COMPLETADO');
  const [formTotalPagado, setFormTotalPagado] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const API_BASE = process.env.NEXT_PUBLIC_SERVICE_URL ?? "";
        const res = await fetch(`${API_BASE}/api/armado/payments/${encodeURIComponent(String(areaYearId))}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data: PaymentsResponse = await res.json();
        if (cancelled) return;
        setPayments(data || {});
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ? String(e.message) : "No se pudo cargar el calendario de pagos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [areaYearId]);

  const monthlySummaries = useMemo(() => {
    const result: Array<{
      month: string;
      items: PaymentRecord[];
      totalsByCurrency: Record<string, number>;
      dueDate: Date | null;
      highlight: 'green' | 'yellow' | 'red' | 'none';
    }> = [];

    MONTHS.forEach((m) => {
      const monthItems = (payments?.[m] || []) as PaymentRecord[];
      const validItems = monthItems.filter((it) => {
        // Excluir filas header/meta y totales no numéricos o en cero
        const isHeader = (it.denominacion || "").toLowerCase() === "denominacion";
        const amount = parseNumber(it.total);
        return !isHeader && amount > 0;
      });

      // Fecha de referencia del mes (si viene en la fila header con ISO)
      const headerRow = monthItems.find((it) => (it.denominacion || "").toLowerCase() === "denominacion" && typeof it.total === "string");
      let dueDate = headerRow ? new Date(String(headerRow.total)) : null;
      const monthIndex = MONTHS.indexOf(m);
      const numericYear = typeof year === "string" ? parseInt(year, 10) : (typeof year === "number" ? year : NaN);
      const fallbackDate = Number.isFinite(numericYear) && monthIndex >= 0 ? new Date(numericYear as number, monthIndex, 1) : null;
      if (!(dueDate instanceof Date) || isNaN(dueDate.getTime())) {
        dueDate = fallbackDate;
      }

      const totals: Record<string, number> = {};
      validItems.forEach((it) => {
        const curr = normalizeCurrency(it.moneda);
        const amount = parseNumber(it.total);
        if (!curr) return;
        totals[curr] = (totals[curr] || 0) + amount;
      });

      // Calcular highlight mensual según estado y fecha
      const now = new Date();
      const statusOf = (s: string | null) => (s || "").trim().toUpperCase();
      const hasUnpaid = validItems.some((it) => statusOf(it.status) !== "COMPLETADO");
      const allPaid = validItems.length > 0 && validItems.every((it) => statusOf(it.status) === "COMPLETADO");

      // Color por defecto (lógica existente)
      let defaultHighlight: 'green' | 'yellow' | 'red' | 'none' = 'none';
      if (allPaid) {
        defaultHighlight = 'green';
      } else if (hasUnpaid && dueDate instanceof Date && !isNaN(dueDate.getTime())) {
        const msDiff = dueDate.getTime() - now.getTime();
        const daysDiff = msDiff / (1000 * 60 * 60 * 24);
        if (now.getTime() > dueDate.getTime()) {
          defaultHighlight = 'red';
        } else if (daysDiff <= 30) {
          defaultHighlight = 'yellow';
        }
      }

      // Reglas solicitadas según mes actual y estado COMPLETADOS/NO_COMPLETADOS
      let highlight: 'green' | 'yellow' | 'red' | 'none' = defaultHighlight;
      if (dueDate instanceof Date && !isNaN(dueDate.getTime())) {
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), 1);

        // Meses anteriores al actual: NO_COMPLETADOS -> rojo; caso contrario -> verde
        if (monthStart < currentMonthStart) {
          highlight = hasUnpaid ? 'red' : 'green';
        }

        // Meses posteriores al actual: COMPLETADOS -> verde; si no, mantener color actual
        if (monthStart > currentMonthStart) {
          if (allPaid) {
            highlight = 'green';
          }
          // si no está completado, se mantiene defaultHighlight (color actual)
        }
        // Mes actual: mantener la lógica existente (defaultHighlight)
      }

      result.push({ month: m, items: validItems, totalsByCurrency: totals, dueDate, highlight });
    });

    return result;
  }, [payments]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">Calendario de Pagos</h3>
        <p className="text-gray-600 text-sm mt-1">Pagos agrupados por mes</p>
      </div>

      {loading && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-center h-24 text-gray-600">Cargando pagos...</div>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {monthlySummaries.map(({ month, items, totalsByCurrency, highlight }) => (
            <div
              key={month}
              className={[
                "bg-white rounded-lg p-4 flex flex-col min-h-[220px]",
                highlight === 'green' ? "border border-green-200 bg-green-50/50" : "",
                highlight === 'yellow' ? "border border-yellow-200 bg-yellow-50/50" : "",
                highlight === 'red' ? "border border-red-200 bg-red-50/50" : "",
                highlight === 'none' ? "border border-gray-200" : ""
              ].join(' ').trim()}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{titleCase(month)}</h4>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  {Object.entries(totalsByCurrency).map(([curr, amt]) => (
                    <span key={curr} className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-full">
                      {curr}: {amt.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                {items.length === 0 ? (
                  <div className="text-sm text-gray-500">Sin pagos registrados</div>
                ) : (
                  <ul className="space-y-2">
                    {items.slice(0, 8).map((it) => (
                      <li
                        key={`${it.fila}-${it.denominacion}`}
                        className="flex items-start justify-between cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2"
                        onClick={() => {
                          setSelectedRecord(it);
                          setFormStatus('COMPLETADO');
                          const currentPaid = typeof it.totalPagado === 'number' && Number.isFinite(it.totalPagado)
                            ? String(it.totalPagado)
                            : String(parseNumber(it.total));
                          setFormTotalPagado(currentPaid);
                          setSaveError(null);
                          setShowEditModal(true);
                        }}
                      >
                        <div className="pr-3">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[220px]">{it.denominacion}</div>
                          {it.observaciones && (
                            <div className="text-xs text-gray-500 truncate max-w-[240px]">{it.observaciones}</div>
                          )}
                        </div>
                        <div className="text-sm text-gray-700 whitespace-nowrap">
                          <span className="font-semibold">{normalizeCurrency(it.moneda) || ""}</span>{" "}
                          {parseNumber(it.total).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showEditModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Actualizar gasto</h4>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => { setShowEditModal(false); setSelectedRecord(null); }}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-700 font-medium">Gasto</div>
                <div className="text-sm text-gray-900">{selectedRecord.denominacion || '-'}</div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <label className="block">
                  <span className="text-sm text-gray-700">Estado</span>
                  <select
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                  >
                    <option value="COMPLETADO" color="black">COMPLETADO</option>
                    <option value="NO_COMPLETADO">NO_COMPLETADO</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm text-gray-700">Total pagado (monto final)</span>
                  <input
                    type="number"
                    step="0.01"
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formTotalPagado}
                    onChange={(e) => setFormTotalPagado(e.target.value)}
                  />
                </label>
              </div>

              {saveError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{saveError}</div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end space-x-2">
              <button
                className="px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => { setShowEditModal(false); setSelectedRecord(null); }}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                onClick={async () => {
                  const idForPost = selectedRecord ? extractRecordId(selectedRecord) : null;
                  const amount = Number(formTotalPagado);
                  if (!Number.isFinite(amount) || amount < 0) {
                    setSaveError('Ingresa un monto válido.');
                    return;
                  }
                  setSaveError(null);
                  setSaving(true);
                  try {
                    const API_BASE = process.env.NEXT_PUBLIC_SERVICE_URL ?? '';
                    const res = await fetch(`${API_BASE}/api/armado/payments/cost/update`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'ngrok-skip-browser-warning': 'true',
                      },
                      credentials: 'include',
                      body: JSON.stringify({
                        id: idForPost,
                        status: formStatus,
                        totalPagado: amount,
                      }),
                    });
                    if (!res.ok) {
                      throw new Error(`Error ${res.status}`);
                    }

                    // Actualizar estado local
                    setPayments((prev) => {
                      if (!prev) return prev;
                      const copy: PaymentsResponse = { ...prev };
                      Object.keys(copy).forEach((k) => {
                        copy[k] = copy[k].map((rec) => {
                          const recId = extractRecordId(rec);
                          if (recId === idForPost) {
                            return { ...rec, status: formStatus, totalPagado: amount } as PaymentRecord;
                          }
                          return rec;
                        });
                      });
                      return copy;
                    });

                    setShowEditModal(false);
                    setSelectedRecord(null);
                  } catch (e: any) {
                    setSaveError(e?.message ? String(e.message) : 'No se pudo guardar');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


