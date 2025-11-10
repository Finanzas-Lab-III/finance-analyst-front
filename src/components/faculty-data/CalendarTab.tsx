"use client"
import React, { useEffect, useMemo, useState } from "react";

type PaymentRecord = {
  id?: number; // identificador genérico si viene
  costAmountId?: number; // identificador del monto de costo (nuevo)
  fila: number;
  denominacion: string | null;
  observaciones: string | null;
  status: string | null;
  total: number | string | null;
  moneda: string | null;
  totalPagado: number | null;
  mes: string;
  payedAmount?: number | string | null;
};

type PaymentsResponse = Record<string, PaymentRecord[]>;

interface CalendarTabProps {
  areaYearId: string | number;
  year?: number | string;
  fileId?: number | string;
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
    // Prefer the new cost amount identifiers
    'costAmountId', 'cost_amount_id',
    // Fallback identifiers supported before
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

export default function CalendarTab({ areaYearId, year, fileId }: CalendarTabProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentsResponse | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  // Create payment form state
  const [amount, setAmount] = useState<string>('');
  const [paidAt, setPaidAt] = useState<string>(''); // datetime-local
  const [currency, setCurrency] = useState<string>('ARS');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [cuenta, setCuenta] = useState<string>('');
  const [grupoCuenta, setGrupoCuenta] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [catalogsLoading, setCatalogsLoading] = useState<boolean>(false);
  const [cuentasCatalog, setCuentasCatalog] = useState<Array<{ id: number; name: string }>>([]);
  const [gruposCatalog, setGruposCatalog] = useState<Array<{ id: number; name: string }>>([]);
  const [modalMonth, setModalMonth] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);

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

  // Load catalogs when opening the modal and we have fileId
  useEffect(() => {
    const open = showEditModal && fileId;
    if (!open) return;
    let cancelled = false;
    async function loadCatalogs() {
      try {
        setCatalogsLoading(true);
        const API_BASE = process.env.NEXT_PUBLIC_SERVICE_URL ?? '';
        const res = await fetch(`${API_BASE}/api/armado/payments/file/${encodeURIComponent(String(fileId))}/catalogs`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data: any = await res.json();
        if (cancelled) return;

        const toItems = (arr: any[]): Array<{ id: number; name: string }> => {
          const asItems = (Array.isArray(arr) ? arr : []).map((it: any, idx: number) => {
            if (it && typeof it === 'object') {
              const idNum = typeof it.id === 'number' ? it.id : Number(it.id ?? idx + 1);
              const nameStr = String(it.name ?? it.value ?? '').trim();
              return { id: Number.isFinite(idNum) ? idNum : (idx + 1), name: nameStr };
            }
            const nameStr = String(it ?? '').trim();
            return { id: idx + 1, name: nameStr };
          });
          const invalid = (name: string) => {
            const n = name.toUpperCase();
            if (!n) return true;
            if (n === '#ERROR!') return true;
            if (n === 'CUENTA' || n === 'GRUPO CUENTA') return true;
            if (n.startsWith('COLUMNA ') || n.includes('SELECCIONAR EN COLUMNA')) return true;
            if (n.startsWith('GASTOS OPERATIVOS:') || n.startsWith('PROYECTOS:')) return true;
            if (n.startsWith('SE BUSCA ') || n.startsWith('SE PUEDE ') || n.startsWith('SE PUEED ')) return true;
            return false;
          };
          const filtered = asItems.filter(it => !invalid(it.name) && it.name.length > 0);
          const byName = new Map<string, { id: number; name: string }>();
          filtered.forEach(it => { if (!byName.has(it.name)) byName.set(it.name, it); });
          return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name, 'es'));
        };

        let cuentasArr = toItems(
          (Array.isArray(data?.cuentas) ? data.cuentas : [])
        );
        let gruposArr = toItems(
          (Array.isArray(data?.gruposCuenta) ? data.gruposCuenta : [])
        );
        // Ensure current selection appears as option
        if (cuenta && !cuentasArr.some((c) => c.name === cuenta)) {
          cuentasArr = [...cuentasArr, { id: 0, name: cuenta }];
          cuentasArr = cuentasArr.sort((a, b) => a.name.localeCompare(b.name, 'es'));
        }
        if (grupoCuenta && !gruposArr.some((g) => g.name === grupoCuenta)) {
          gruposArr = [...gruposArr, { id: 0, name: grupoCuenta }];
          gruposArr = gruposArr.sort((a, b) => a.name.localeCompare(b.name, 'es'));
        }
        setCuentasCatalog(cuentasArr);
        setGruposCatalog(gruposArr);
      } catch (e: any) {
        // Silently ignore catalogs failure; user can still type
        setCuentasCatalog([]);
        setGruposCatalog([]);
      } finally {
        if (!cancelled) setCatalogsLoading(false);
      }
    }
    loadCatalogs();
    return () => { cancelled = true; };
  }, [showEditModal, fileId]);

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

  function getItemHighlight(it: PaymentRecord): 'green' | 'yellow' | 'red' | 'none' {
    const now = new Date();
    const currMonthIdx = now.getMonth(); // 0-11
    const itemMonthIdx = MONTHS.indexOf(String(it.mes || '').toLowerCase());
    if (itemMonthIdx < 0) return 'none';
    const status = String((it.status || '').toString()).trim().toUpperCase();
    // If the expense is completed, always show green, even for past months
    if (status === 'COMPLETADO') {
      return 'green';
    }

    if (itemMonthIdx < currMonthIdx) {
      return 'red';
    }
    if (itemMonthIdx > currMonthIdx) {
      return 'green';
    }
    // Same month
    return 'yellow';
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">Calendario de Pagos</h3>
        <p className="text-gray-600 text-sm mt-1">Pagos agrupados por mes</p>
        <div className="mt-3">
          <button
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            disabled={exporting}
            onClick={async () => {
              try {
                setExporting(true);
                const API_BASE = process.env.NEXT_PUBLIC_SERVICE_URL ?? 'http://localhost:8000';
                const url = `${API_BASE}/api/armado/payments/areayear/${encodeURIComponent(String(areaYearId))}/export-devoluciones`;
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
                const filename = match ? decodeURIComponent(match[1]) : `devoluciones-${String(areaYearId)}.xlsx`;
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
                try { alert('No se pudo exportar las devoluciones'); } catch {}
              } finally {
                setExporting(false);
              }
            }}
            title="Exportar devoluciones"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M3 14.5A1.5 1.5 0 004.5 16h11a1.5 1.5 0 001.5-1.5V12a.5.5 0 00-1 0v2.5a.5.5 0 01-.5.5h-11a.5.5 0 01-.5-.5V12a.5.5 0 00-1 0v2.5z" />
              <path d="M10 3a.5.5 0 00-.5.5v8.293L7.354 9.646a.5.5 0 10-.708.708l3 3a.5.5 0 00.708 0l3-3a.5.5 0 10-.708-.708L10.5 11.793V3.5A.5.5 0 0010 3z" />
            </svg>
            <span>{exporting ? 'Exportando...' : 'Exportar devoluciones'}</span>
          </button>
        </div>
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
          {monthlySummaries.map((summary, idx) => {
            const { month, items, totalsByCurrency, highlight } = summary;
            const rowIndex = Math.floor(idx / 3);
            const isExpanded = expandedRow === rowIndex;
            const visibleItems = isExpanded ? items : items.slice(0, 8);
            const hasMore = items.length > 8 && !isExpanded;
            return (
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
                    <button
                      className="ml-2 inline-flex items-center px-2 py-1 border border-blue-200 text-blue-700 rounded hover:bg-blue-50"
                      onClick={() => {
                        setSelectedRecord(null);
                        setCurrency('ARS');
                        setName('');
                        setDescription('');
                        setAmount('');
                        const nowLocal = new Date();
                        const pad = (n: number) => String(n).padStart(2, '0');
                        const localForInput = `${nowLocal.getFullYear()}-${pad(nowLocal.getMonth()+1)}-${pad(nowLocal.getDate())}T${pad(nowLocal.getHours())}:${pad(nowLocal.getMinutes())}`;
                        setPaidAt(localForInput);
                        setCuenta('');
                        setGrupoCuenta('');
                        setModalMonth(month);
                        setSaveError(null);
                        setShowEditModal(true);
                      }}
                      title={`Agregar pago en ${titleCase(month)}`}
                    >
                      + Nuevo
                    </button>
                  </div>
                </div>

                <div className={isExpanded ? "flex-1 overflow-visible relative" : "flex-1 relative"}>
                  {items.length === 0 ? (
                    <div className="text-sm text-gray-500">Sin pagos registrados</div>
                  ) : (
                    <>
                      <ul className="space-y-2">
                        {visibleItems.map((it) => (
                          <li
                            key={`${it.fila}-${it.denominacion}`}
                            className={(() => {
                              const hl = getItemHighlight(it);
                              const border = hl === 'red' ? 'border-red-300' : hl === 'green' ? 'border-green-300' : hl === 'yellow' ? 'border-yellow-300' : 'border-transparent';
                              const bg = hl === 'red' ? 'bg-red-50' : hl === 'green' ? 'bg-green-50' : hl === 'yellow' ? 'bg-yellow-50' : 'bg-transparent';
                              return [
                                'flex items-start justify-between cursor-pointer rounded px-2 py-1',
                                'border',
                                border,
                                bg,
                              ].join(' ');
                            })()}
                            onClick={() => {
                              setSelectedRecord(it);
                              const curr = normalizeCurrency(it.moneda) || 'ARS';
                              setCurrency(curr);
                              setName(String(it.denominacion || ''));
                              setDescription(String(it.observaciones || ''));
                              setAmount(String(parseNumber(it.total)));
                              const nowLocal = new Date();
                              const pad = (n: number) => String(n).padStart(2, '0');
                              const localForInput = `${nowLocal.getFullYear()}-${pad(nowLocal.getMonth()+1)}-${pad(nowLocal.getDate())}T${pad(nowLocal.getHours())}:${pad(nowLocal.getMinutes())}`;
                              setPaidAt(localForInput);
                              const anyRec: any = it as any;
                              const firstString = (fields: string[]): string | undefined => {
                                for (const k of fields) {
                                  const v = anyRec?.[k];
                                  if (typeof v === 'string' && v.trim().length > 0) return v.trim();
                                }
                                return undefined;
                              };
                              const invalid = (name: string) => {
                                const n = name.toUpperCase();
                                if (!n) return true;
                                if (n === '#ERROR!') return true;
                                if (n === 'CUENTA' || n === 'GRUPO CUENTA') return true;
                                if (n.startsWith('COLUMNA ') || n.includes('SELECCIONAR EN COLUMNA')) return true;
                                if (n.startsWith('GASTOS OPERATIVOS:') || n.startsWith('PROYECTOS:')) return true;
                                if (n.startsWith('SE BUSCA ') || n.startsWith('SE PUEDE ') || n.startsWith('SE PUEED ')) return true;
                                return false;
                              };
                              const recCuenta = firstString(['cuenta', 'Cuenta', 'account', 'account_name', 'cuenta_name']);
                              const recGrupo = firstString(['grupoCuenta', 'Grupo Cuenta', 'grupo_cuenta', 'group', 'group_name']);
                              setCuenta(recCuenta && !invalid(recCuenta) ? recCuenta : '');
                              setGrupoCuenta(recGrupo && !invalid(recGrupo) ? recGrupo : '');
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
                            <div className="text-sm text-gray-700 whitespace-nowrap text-right">
                              <span className="font-semibold">{normalizeCurrency(it.moneda) || ""}</span>{" "}
                              {parseNumber(it.total).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                              {String((it.status || '').toString()).trim().toUpperCase() === 'COMPLETADO' &&
                                it.payedAmount != null &&
                                parseNumber(it.payedAmount) > 0 && (
                                  <div className="text-xs text-gray-600 mt-0.5">
                                    Real Pagado: <span className="font-semibold">{normalizeCurrency(it.moneda) || ""}</span>{" "}
                                    {parseNumber(it.payedAmount).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                  </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                      {hasMore && (
                        <>
                          <div className="pointer-events-none absolute inset-x-0 bottom-10 h-10 bg-gradient-to-t from-white to-transparent"></div>
                          <div className="absolute inset-x-0 bottom-0 flex justify-center pb-1">
                            <button
                              className="inline-flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800 bg-white/70 backdrop-blur-sm border border-blue-200 rounded-full px-3 py-1 shadow-sm"
                              onClick={() => setExpandedRow(rowIndex)}
                              title="Ver más gastos"
                            >
                              <span>Ver más gastos</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Registrar pago</h4>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => { setShowEditModal(false); setSelectedRecord(null); }}
              >
                ✕
              </button>
            </div>

              <div className="space-y-4">
              {(selectedRecord?.denominacion || modalMonth) && (
                <div>
                  {selectedRecord?.denominacion && (
                    <>
                      <div className="text-sm text-gray-700 font-medium">Gasto</div>
                      <div className="text-sm text-gray-900">{selectedRecord?.denominacion || '-'}</div>
                    </>
                  )}
                  {modalMonth && (
                    <div className="text-xs text-gray-500 mt-1">Mes: {titleCase(modalMonth)}</div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <label className="block">
                  <span className="text-sm text-gray-700">Nombre</span>
                  <input
                    type="text"
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="text-sm text-gray-700">Descripción</span>
                  <textarea
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm text-gray-700">Monto</span>
                    <input
                      type="number"
                      step="0.01"
                      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm text-gray-700">Moneda</span>
                    <select
                      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="ARS">ARS</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm text-gray-700">Fecha de pago</span>
                  <input
                    type="datetime-local"
                    className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={paidAt}
                    onChange={(e) => setPaidAt(e.target.value)}
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm text-gray-700">Grupo Cuenta</span>
                    <select
                      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                      value={grupoCuenta}
                      onChange={(e) => setGrupoCuenta(e.target.value)}
                      disabled={catalogsLoading || gruposCatalog.length === 0}
                    >
                      <option value="">Seleccionar...</option>
                      {gruposCatalog.map((g) => (
                        <option key={g.id} value={g.name}>{g.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm text-gray-700">Cuenta</span>
                    <select
                      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                      value={cuenta}
                      onChange={(e) => setCuenta(e.target.value)}
                      disabled={catalogsLoading || cuentasCatalog.length === 0}
                    >
                      <option value="">Seleccionar...</option>
                      {cuentasCatalog.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">CostAmountId</div>
                    <div className="text-sm text-gray-900 font-mono">
                      {(() => {
                        const idForPost = selectedRecord ? extractRecordId(selectedRecord) : null;
                        return idForPost ?? '-';
                      })()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Área-Año</div>
                    <div className="text-sm text-gray-900 font-mono">{String(areaYearId)}</div>
                  </div>
                </div>
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
                  const amtNum = Number(amount);
                  if (!Number.isFinite(amtNum) || amtNum <= 0) {
                    setSaveError('Ingresa un monto válido (> 0).');
                    return;
                  }
                  if (!paidAt) {
                    setSaveError('Selecciona la fecha de pago.');
                    return;
                  }
                  if (!currency) {
                    setSaveError('Selecciona la moneda.');
                    return;
                  }
                  setSaveError(null);
                  setSaving(true);
                  try {
                    // Convert datetime-local to ISO
                    const isoPaidAt = new Date(paidAt).toISOString();
                    const API_BASE = process.env.NEXT_PUBLIC_SERVICE_URL ?? '';
                    const res = await fetch(`${API_BASE}/api/armado/payments/create`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'ngrok-skip-browser-warning': 'true',
                      },
                      credentials: 'include',
                      body: JSON.stringify({
                        amount: amtNum,
                        paidAt: isoPaidAt,
                        currency,
                        areaYearId: Number(areaYearId),
                        name,
                        description,
                        costAmountId: idForPost ?? undefined,
                        cuenta: cuenta || undefined,
                        grupoCuenta: grupoCuenta || undefined,
                      }),
                    });
                    if (!res.ok) {
                      throw new Error(`Error ${res.status}`);
                    }

                    // After creating payment, reload calendar data
                    try {
                      setLoading(true);
                      const reloadBase = process.env.NEXT_PUBLIC_SERVICE_URL ?? '';
                      const reloadRes = await fetch(`${reloadBase}/api/armado/payments/${encodeURIComponent(String(areaYearId))}`, {
                        method: 'GET',
                        headers: { Accept: 'application/json', 'ngrok-skip-browser-warning': 'true' },
                        credentials: 'include',
                      });
                      if (reloadRes.ok) {
                        const data: PaymentsResponse = await reloadRes.json();
                        setPayments(data || {});
                      }
                    } catch {}

                    setShowEditModal(false);
                    setSelectedRecord(null);
                  } catch (e: any) {
                    setSaveError(e?.message ? String(e.message) : 'No se pudo registrar el pago');
                  } finally {
                    setSaving(false);
                    setLoading(false);
                  }
                }}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Crear pago'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


