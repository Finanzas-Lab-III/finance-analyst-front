'use client'
import {useEffect, useMemo, useRef, useState} from "react";
import {buildRawFileUrl} from "@/api/userService";
import * as XLSX from "xlsx";
import {CellStyle, SheetMap, StyledCell} from "@/components/armado/types";

export function useArmadoSheet(fileId?: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sheets, setSheets] = useState<SheetMap>({})
  const sheetNames = useMemo(() => Object.keys(sheets), [sheets])
  const [activeSheet, setActiveSheet] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [visibleRows, setVisibleRows] = useState<number>(50)
  const [visibleCols, setVisibleCols] = useState<number>(16)
  const [focused, setFocused] = useState<{ r: number; c: number } | null>(null)
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!fileId) return
      setLoading(true)
      setError(null)
      try {
        const url = buildRawFileUrl(fileId, true)
        const res = await fetch(url, { cache: 'no-store', headers: { 'ngrok-skip-browser-warning': 'true' } })
        if (!res.ok) {
          throw new Error(`No se pudo descargar el archivo (${res.status})`)
        }
        const blob = await res.blob()
        const arrayBuffer = await blob.arrayBuffer()
        const MAX_ROWS = 150
        const MAX_COLS = 200

        async function parseWithExcelJS(
          ab: ArrayBuffer,
        ): Promise<{ map: SheetMap; firstSheet: string | null }> {
          const ExcelJS = await import('exceljs')
          const wb = new ExcelJS.Workbook()
          await wb.xlsx.load(ab)
          const map: SheetMap = {}
          let firstSheetName: string | null = null
          for (const ws of wb.worksheets) {
            const name = ws.name || `Sheet${ws.id}`
            if (!firstSheetName) firstSheetName = name
            const rows: StyledCell[][] = []
            const maxRows = Math.min(
              MAX_ROWS,
              (ws as any).actualRowCount || ws.rowCount || MAX_ROWS,
            )
            const maxCols = Math.min(
              MAX_COLS,
              (ws as any).actualColumnCount || ws.columnCount || MAX_COLS,
            )
            for (let r = 1; r <= maxRows; r++) {
              const row = ws.getRow(r)
              const out: StyledCell[] = []
              for (let c = 1; c <= maxCols; c++) {
                const cell = row.getCell(c) as any
                const text = String(cell?.text ?? cell?.value ?? '')
                const fill = cell?.fill
                const font = cell?.font
                const alignment = cell?.alignment
                const style: CellStyle = {}
                const argb = (fill?.fgColor?.argb || fill?.bgColor?.argb) as
                  | string
                  | undefined
                if (argb && typeof argb === 'string')
                  style.backgroundColor = `#${argb.slice(-6)}`
                if (font) {
                  if (font.bold) style.bold = true
                  if (font.italic) style.italic = true
                  if (font.underline) style.underline = true
                  const fargb = font.color?.argb as string | undefined
                  if (fargb) style.color = `#${fargb.slice(-6)}`
                }
                if (alignment?.horizontal) style.align = alignment.horizontal
                out.push({ value: text, style })
              }
              rows.push(out)
            }
            map[name] = rows
          }
          return { map, firstSheet: firstSheetName }
        }

        let map: SheetMap | null = null
        let firstSheetName: string | null = null
        try {
          const rich = await parseWithExcelJS(arrayBuffer)
          map = rich.map
          firstSheetName = rich.firstSheet
        } catch (_e) {
          const workbook = XLSX.read(arrayBuffer, { type: 'array' })
          const fallback: SheetMap = {}
          for (const name of workbook.SheetNames) {
            const ws = workbook.Sheets[name]
            const json = XLSX.utils.sheet_to_json(ws, {
              header: 1,
              defval: '',
              blankrows: true,
            }) as any[][]
            const sourceRows = json && json.length ? json.slice(0, MAX_ROWS) : [['']]
            let detectedCols = 1
            for (const row of sourceRows) {
              const len = Array.isArray(row) ? row.length : 0
              if (len > detectedCols) detectedCols = len
            }
            const targetCols = Math.min(MAX_COLS, Math.max(1, detectedCols))
            const normalized = sourceRows.map((originalRow) => {
              const rowValues = Array.isArray(originalRow)
                ? originalRow.slice(0, targetCols)
                : []
              while (rowValues.length < targetCols) rowValues.push('')
              for (let i = 0; i < rowValues.length; i++) {
                if (rowValues[i] === undefined || rowValues[i] === null) rowValues[i] = ''
              }
              return rowValues.map((v) => ({ value: v })) as StyledCell[]
            })
            fallback[name] = normalized
          }
          map = fallback
          firstSheetName = workbook.SheetNames[0] ?? null
        }

        if (!cancelled && map) {
          setSheets(map)
          setActiveSheet(firstSheetName)
          const first = firstSheetName ? map[firstSheetName] : undefined
          const detected = first && first.length > 0 ? Math.max(...first.map((r) => r.length)) : 1
          setVisibleCols(Math.max(16, Math.min(detected || 1, 40)))
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ? String(e.message) : 'Error cargando documento')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [fileId])

  const data: StyledCell[][] = activeSheet ? sheets[activeSheet] ?? [[]] : [[]]

  const ROW_ESTIMATE_PX = 32
  const COL_ESTIMATE_PX = 100
  const MAX_GROW_ROWS = 500
  const MAX_GROW_COLS = 100

  // Fill viewport with enough rows/cols
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const requiredRows = Math.ceil(el.clientHeight / ROW_ESTIMATE_PX)
    const requiredCols = Math.ceil((el.clientWidth - 40) / COL_ESTIMATE_PX) // minus row header width
    setVisibleRows((prev) => Math.max(prev, requiredRows))
    setVisibleCols((prev) => Math.max(prev, requiredCols))
  }, [activeSheet, maximized])

  // Infinite scroll growth
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const remainingY = el.scrollHeight - el.scrollTop - el.clientHeight
      if (remainingY < 64) setVisibleRows((prev) => Math.min(prev + 50, MAX_GROW_ROWS))
      const remainingX = el.scrollWidth - el.scrollLeft - el.clientWidth
      if (remainingX < 64) setVisibleCols((prev) => Math.min(prev + 8, MAX_GROW_COLS))
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [activeSheet, maximized])

  const ensureCellUpdate = (
    sheetName: string,
    rIdx: number,
    cIdx: number,
    nextValue: string,
  ) => {
    setSheets((prev) => {
      const prevSheet = (prev[sheetName] as StyledCell[][]) ?? []
      const newSheet: StyledCell[][] = prevSheet.map((row) => row.slice())
      while (newSheet.length <= rIdx) {
        const blankRow: StyledCell[] = Array.from(
          { length: Math.max(visibleCols, cIdx + 1) },
          () => ({ value: '' }),
        )
        newSheet.push(blankRow)
      }
      const targetRow = newSheet[rIdx]
      while (targetRow.length <= cIdx) targetRow.push({ value: '' })
      const before = targetRow[cIdx]
      targetRow[cIdx] = { value: nextValue, style: before?.style }
      return { ...prev, [sheetName]: newSheet }
    })
  }

  const updateCellStyle = (
    sheetName: string,
    rIdx: number,
    cIdx: number,
    updater: (prev?: CellStyle) => CellStyle,
  ) => {
    setSheets((prev) => {
      const prevSheet = (prev[sheetName] as StyledCell[][]) ?? []
      const newSheet: StyledCell[][] = prevSheet.map((row) => row.slice())
      while (newSheet.length <= rIdx) {
        const blankRow: StyledCell[] = Array.from(
          { length: Math.max(visibleCols, cIdx + 1) },
          () => ({ value: '' }),
        )
        newSheet.push(blankRow)
      }
      const targetRow = newSheet[rIdx]
      while (targetRow.length <= cIdx) targetRow.push({ value: '' })
      const before = targetRow[cIdx]
      targetRow[cIdx] = { value: before?.value ?? '', style: updater(before?.style) }
      return { ...prev, [sheetName]: newSheet }
    })
  }

  const getColumnLetter = (indexZeroBased: number): string => {
    let n = indexZeroBased
    let s = ''
    while (n >= 0) {
      s = String.fromCharCode((n % 26) + 65) + s
      n = Math.floor(n / 26) - 1
    }
    return s
  }

  return {
    // status
    loading,
    error,

    // data
    sheets,
    sheetNames,
    activeSheet,
    setActiveSheet,
    data,

    // viewport & UI state
    visibleRows,
    setVisibleRows,
    visibleCols,
    setVisibleCols,
    maximized,
    setMaximized,

    // focus & ref
    focused,
    setFocused,
    scrollRef,

    // helpers
    ensureCellUpdate,
    updateCellStyle,
    getColumnLetter,
  }
}