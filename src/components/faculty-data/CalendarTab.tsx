"use client"
import React, { useEffect, useMemo, useState } from "react";

type PaymentRecord = {
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

export default function CalendarTab({ areaYearId, year }: CalendarTabProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentsResponse | null>(null);

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
      const hasUnpaid = validItems.some((it) => statusOf(it.status) !== "PAGADO");
      const allPaid = validItems.length > 0 && validItems.every((it) => statusOf(it.status) === "PAGADO");

      let highlight: 'green' | 'yellow' | 'red' | 'none' = 'none';
      if (allPaid) {
        highlight = 'green';
      } else if (hasUnpaid && dueDate instanceof Date && !isNaN(dueDate.getTime())) {
        const msDiff = dueDate.getTime() - now.getTime();
        const daysDiff = msDiff / (1000 * 60 * 60 * 24);
        if (now.getTime() > dueDate.getTime()) {
          highlight = 'red';
        } else if (daysDiff <= 30) {
          highlight = 'yellow';
        }
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
                      <li key={`${it.fila}-${it.denominacion}`} className="flex items-start justify-between">
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
    </div>
  );
}


