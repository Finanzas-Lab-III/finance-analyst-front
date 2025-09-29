'use client'

import React from 'react'
import { StyledCell } from '@/components/armado/types'

type ArmadoGridProps = {
  loading: boolean
  error: string | null
  maximized: boolean
  scrollRef: React.RefObject<HTMLDivElement | null>
  data: StyledCell[][]
  visibleRows: number
  visibleCols: number
  getColumnLetter: (indexZeroBased: number) => string
  activeSheet: string | null
  setFocused: (pos: { r: number; c: number } | null) => void
  ensureCellUpdate: (sheetName: string, rIdx: number, cIdx: number, nextValue: string) => void
}

export default function ArmadoGrid({
  loading,
  error,
  maximized,
  scrollRef,
  data,
  visibleRows,
  visibleCols,
  getColumnLetter,
  activeSheet,
  setFocused,
  ensureCellUpdate,
}: ArmadoGridProps) {
  return (
    <div className={`flex-1 min-h-0 ${maximized ? '' : 'overflow-auto'}`}>
      {loading && (
        <div className="h-full flex items-center justify-center">
          <div className="text-gray-600">Cargando archivo…</div>
        </div>
      )}
      {error && !loading && (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">{error}</div>
        </div>
      )}
      {!loading && !error && (
        <div className={`${maximized ? 'fixed inset-0 flex items-center justify-center z-50 bg-black/30' : 'p-4'}`}>
          <div
            className={`${maximized ? 'w-[90vw] h-[90vh]' : ''} overflow-auto border border-gray-200 rounded-md bg-white`}
            ref={scrollRef}
          >
            <table className="min-w-full text-xs table-fixed">
              <tbody>
                <tr>
                  <td className="sticky left-0 z-10 bg-gray-100 text-gray-700 font-medium border border-gray-200 px-2 py-1 w-10">#</td>
                  {Array.from({ length: visibleCols }).map((_, c) => (
                    <td key={`h-${c}`} className="bg-gray-100 text-gray-700 font-medium border border-gray-200 px-3 py-1">
                      {getColumnLetter(c)}
                    </td>
                  ))}
                </tr>
                {Array.from({ length: Math.max(visibleRows, data.length) }).map((_, r) => (
                  <tr key={r}>
                    <td className="sticky left-0 z-10 bg-gray-100 text-gray-700 border border-gray-200 px-2 py-1 w-10">{r + 1}</td>
                    {Array.from({ length: visibleCols }).map((_, c) => {
                      const cell = (data as StyledCell[][])[r]?.[c] ?? { value: '' }
                      const value = (cell as StyledCell)?.value ?? (cell as any)
                      const style = (cell as StyledCell)?.style
                      const inlineStyle: React.CSSProperties = {
                        backgroundColor: style?.backgroundColor,
                        color: style?.color,
                        fontWeight: style?.bold ? 600 : undefined,
                        fontStyle: style?.italic ? 'italic' : undefined,
                        textDecoration: style?.underline ? 'underline' : undefined,
                        textAlign: (style?.align as any),
                      }
                      return (
                        <td key={`${r}-${c}`} className={`px-0 py-0 border border-gray-200 align-top`}>
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            role="textbox"
                            className={`px-3 py-2 min-w-[96px] whitespace-pre-wrap outline-none text-gray-800`}
                            style={inlineStyle}
                            onFocus={() => setFocused({ r, c })}
                            onBlur={(e) => {
                              if (!activeSheet) return
                              const nextValue = (e.currentTarget.textContent ?? '').toString()
                              ensureCellUpdate(activeSheet, r, c, nextValue)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                ;(e.currentTarget as HTMLElement).blur()
                              }
                            }}
                          >
                            {String(value ?? '')}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}


