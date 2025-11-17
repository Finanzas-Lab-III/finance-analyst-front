"use client";

import React, { useEffect, useState } from "react";
import { completeArmadoRules } from "@/lib/user-api";
import { toast } from "react-toastify";

type AnalysisItem = {
  message?: string;
  description?: string;
  comments?: string;
  // keep index signature since your API may return extra fields
  [k: string]: any;
};

export default function ArmadoSidebar({
                                        analysisResults,
                                        analysisLoading,
                                        analysisError,
                                        showDisclaimer,
                                        onCloseDisclaimer,
                                        allChecked,
                                        onSubmit,
                                      }: {
  analysisResults: AnalysisItem[] | any; // keeps current flexibility
  analysisLoading: boolean;
  analysisError: string | null;
  showDisclaimer: boolean;
  onCloseDisclaimer: () => void;
  allChecked: boolean;
  onSubmit?: (ctx: { remaining: number }) => void;
}) {
  const [items, setItems] = useState<AnalysisItem[]>([])
  const [checked, setChecked] = useState<boolean[]>([])
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [removingKeys, setRemovingKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (Array.isArray(analysisResults)) {
      setItems(analysisResults)
      setChecked(new Array(analysisResults.length).fill(false))
    } else {
      setItems([])
      setChecked([])
    }
  }, [analysisResults])

  const toggleChecked = (idx: number) => {
    setChecked((prev) => {
      const next = prev.slice()
      next[idx] = !next[idx]
      return next
    })
  }

  const anyChecked = Array.isArray(items)
    && items.length > 0
    && checked.some(Boolean)

  const enableSubmit = anyChecked || allChecked

  const handleSubmit = async () => {
    if (!Array.isArray(items)) return
    // If there are no items to compare and allChecked is true,
    // finalize immediately without requiring any selection.
    if (items.length === 0 && enableSubmit) {
      if (onSubmit) onSubmit({ remaining: 0 })
      return
    }
    const selected = items
      .map((it: any, idx: number) => ({ it, idx }))
      .filter(({ idx }) => checked[idx])
      .map(({ it }) => {
        const candidates = [it?.id, it?.rule_id, it?.ruleId]
        const numeric = candidates.find((v) => Number.isFinite(Number(v)))
        return numeric !== undefined ? Number(numeric) : undefined
      })
      .filter((v: any) => Number.isFinite(v)) as number[]

    if (selected.length === 0) {
      toast.error("Seleccioná al menos una regla con ID válido")
      return
    }

    try {
      setSubmitting(true)
      await completeArmadoRules(selected)
      toast.success("Reglas enviadas correctamente")
      // animate out selected cards, then remove
      const selectedKeys = new Set<string>()
      items.forEach((it: any, idx: number) => {
        if (checked[idx]) {
          const key = String(it?.id ?? `idx-${idx}`)
          selectedKeys.add(key)
        }
      })
      setRemovingKeys(selectedKeys)
      setTimeout(() => {
        const nextItems: AnalysisItem[] = []
        const nextChecked: boolean[] = []
        items.forEach((it: any, idx: number) => {
          const key = String(it?.id ?? `idx-${idx}`)
          if (!selectedKeys.has(key)) {
            nextItems.push(it)
            nextChecked.push(checked[idx])
          }
        })
        setItems(nextItems)
        setChecked(nextChecked)
        setRemovingKeys(new Set())
        if (onSubmit) onSubmit({ remaining: nextItems.length })
      }, 300)
    } catch (e: any) {
      toast.error(e?.message ? String(e.message) : "No se pudieron enviar las reglas")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <aside className="w-[320px] bg-white text-gray-900 h-full flex flex-col border-l border-gray-200">
      <div className="p-4">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold">Cambios detectados</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {analysisLoading && <div className="mt-4 text-blue-600">Analizando presupuesto. Esto puede tardar unos minutos.</div>}
        {analysisError && <div className="mt-4 text-red-600">{analysisError}</div>}

        {!analysisLoading && !analysisError && (
          Array.isArray(items) ? (
            items.length > 0 ? (
              <div className="mt-4 flex flex-col gap-3">
                {items.map((result: AnalysisItem, idx: number) => {
                  const key = String((result as any)?.id ?? `idx-${idx}`)
                  const isRemoving = removingKeys.has(key)
                  return (
                  <div
                    key={key}
                    className={`bg-gray-50 border-l-4 border-blue-500 rounded shadow p-3 transition-all duration-300 ease-out ${isRemoving ? 'translate-x-4 opacity-0' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        checked={checked[idx] || false}
                        onChange={() => toggleChecked(idx)}
                      />
                      <div className={`flex-1 ${checked[idx] ? 'line-through text-gray-400' : ''}`}>
                    {result.message && (
                      <div className="font-semibold text-base mb-1 text-gray-900">{result.message}</div>
                    )}
                    {result.description && (
                      <div className="text-xs text-gray-600 mb-1">{result.description}</div>
                    )}
                    {result.comments && (
                      <div className="text-sm text-gray-500">{result.comments}</div>
                    )}
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            ) : (
              <div className="mt-4 text-gray-500">No se encontraron observaciones en el análisis.</div>
            )
          ) : (
            <div className="mt-4 text-yellow-600">
              Respuesta inesperada de la API:
              <br />
              <pre className="whitespace-pre-wrap text-xs">
                {JSON.stringify(analysisResults, null, 2)}
              </pre>
            </div>
          )
        )}
      </div>

      <div className="mt-auto sticky bottom-0 bg-white p-4 border-t border-gray-200">
        {showDisclaimer && (
          <div className="relative bg-yellow-100 text-yellow-800 text-xs rounded px-3 py-2 mb-3 flex items-start shadow-sm">
            <span className="flex-1 pr-4">
              Esta es una verificación automatizada y puede contener errores. Por favor, revisa manualmente si es necesario.
            </span>
            <button
              className="ml-2 text-yellow-700 hover:text-yellow-900 text-lg font-bold leading-none focus:outline-none"
              onClick={onCloseDisclaimer}
              aria-label="Cerrar aviso"
            >
              ×
            </button>
          </div>
        )}

        <button
          className={`w-full py-2 mt-2 rounded text-white font-semibold transition-colors ${
            enableSubmit && !submitting ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!enableSubmit || submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </aside>
  );
}
