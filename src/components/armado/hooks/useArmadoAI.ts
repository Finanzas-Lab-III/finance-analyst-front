'use client'

import { useEffect, useState } from 'react'

type ArmadoApiItem = {
  row?: number
  rule?: string
  error?: string
  [k: string]: any
}

type UseArmadoAIResult = {
  analysisResults: ArmadoApiItem[]
  analysisLoading: boolean
  analysisError: string | null
}

export function useArmadoAI(areaYearId?: string): UseArmadoAIResult {
  const [analysisResults, setAnalysisResults] = useState<ArmadoApiItem[]>([])
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  useEffect(() => {
    if (!areaYearId) return
    const controller = new AbortController()

    async function run() {
      setAnalysisLoading(true)
      setAnalysisError(null)
      try {
        const res = await fetch(`http://localhost:8000/api/armado/${encodeURIComponent(areaYearId as string)}` , {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
          cache: 'no-store',
          signal: controller.signal,
        })
        if (!res.ok) {
          throw new Error(`Error ${res.status}`)
        }
        const data: any = await res.json()
        if (Array.isArray(data)) {
          const mapped: ArmadoApiItem[] = data.map((item: ArmadoApiItem) => ({
            // For the sidebar UI
            message: item.error ?? 'Observación',
            description: `Fila ${item.row ?? '-'} • Regla: ${item.rule ?? '-'}`,
            // Keep original fields
            ...item,
          }))
          setAnalysisResults(mapped)
        } else {
          // Pass through unexpected shapes so the UI can show them
          setAnalysisResults(data)
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return
        setAnalysisError(e?.message ? String(e.message) : 'No se pudo analizar el presupuesto')
      } finally {
        setAnalysisLoading(false)
      }
    }

    run()
    return () => controller.abort()
  }, [areaYearId])

  return { analysisResults, analysisLoading, analysisError }
}


