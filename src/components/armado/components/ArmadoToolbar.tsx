'use client'

import React from 'react'
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Palette, Maximize2, Minimize2 } from 'lucide-react'
import { StyledCell } from '@/components/armado/types'

type ArmadoToolbarProps = {
  maximized: boolean
  onToggleMaximize: () => void
  activeSheet: string | null
  focused: { r: number; c: number } | null
  data: StyledCell[][]
  updateCellStyle: (
    sheetName: string,
    rIdx: number,
    cIdx: number,
    updater: (prev?: any) => any,
  ) => void
}

export default function ArmadoToolbar({
  maximized,
  onToggleMaximize,
  activeSheet,
  focused,
  data,
  updateCellStyle,
}: ArmadoToolbarProps) {
  const currentStyle = React.useMemo(() => {
    if (!activeSheet || !focused) return undefined
    return (data?.[focused.r]?.[focused.c] as any)?.style
  }, [activeSheet, focused, data])

  return (
    <div className="bg-gray-100 border-b border-gray-200 px-2 py-2 flex items-center gap-1">
      <button
        className="px-2 py-1 text-gray-700 hover:bg-gray-200 rounded"
        title={maximized ? 'Restaurar' : 'Maximizar'}
        onClick={onToggleMaximize}
      >
        {maximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>
      <div className="mx-2 w-px h-5 bg-gray-300" />
      <button
        className="px-2 py-1 text-gray-700 hover:bg-gray-200 rounded"
        title="Negrita"
        onClick={() => {
          if (!activeSheet || !focused) return
          updateCellStyle(activeSheet, focused.r, focused.c, (s: any) => ({ ...s, bold: !s?.bold }))
        }}
      >
        <Bold size={16} />
      </button>
      <button
        className="px-2 py-1 text-gray-700 hover:bg-gray-200 rounded"
        title="Cursiva"
        onClick={() => {
          if (!activeSheet || !focused) return
          updateCellStyle(activeSheet, focused.r, focused.c, (s: any) => ({ ...s, italic: !s?.italic }))
        }}
      >
        <Italic size={16} />
      </button>
      <button
        className="px-2 py-1 text-gray-700 hover:bg-gray-200 rounded"
        title="Subrayado"
        onClick={() => {
          if (!activeSheet || !focused) return
          updateCellStyle(activeSheet, focused.r, focused.c, (s: any) => ({ ...s, underline: !s?.underline }))
        }}
      >
        <Underline size={16} />
      </button>
      <div className="mx-2 w-px h-5 bg-gray-300" />
      <button
        className="px-2 py-1 text-gray-700 hover:bg-gray-200 rounded"
        title="Alinear izquierda"
        onClick={() => {
          if (!activeSheet || !focused) return
          updateCellStyle(activeSheet, focused.r, focused.c, (s: any) => ({ ...s, align: 'left' }))
        }}
      >
        <AlignLeft size={16} />
      </button>
      <button
        className="px-2 py-1 text-gray-700 hover:bg-gray-200 rounded"
        title="Alinear centro"
        onClick={() => {
          if (!activeSheet || !focused) return
          updateCellStyle(activeSheet, focused.r, focused.c, (s: any) => ({ ...s, align: 'center' }))
        }}
      >
        <AlignCenter size={16} />
      </button>
      <button
        className="px-2 py-1 text-gray-700 hover:bg-gray-200 rounded"
        title="Alinear derecha"
        onClick={() => {
          if (!activeSheet || !focused) return
          updateCellStyle(activeSheet, focused.r, focused.c, (s: any) => ({ ...s, align: 'right' }))
        }}
      >
        <AlignRight size={16} />
      </button>
      <div className="mx-2 w-px h-5 bg-gray-300" />
      <label className="flex items-center gap-1 text-xs text-gray-700 px-2 py-1 rounded hover:bg-gray-200 cursor-pointer">
        <Palette size={14} />
        <span>Texto</span>
        <input
          type="color"
          className="w-6 h-6 p-0 border-0 bg-transparent cursor-pointer"
          value={(currentStyle?.color as string) || '#000000'}
          onChange={(e) => {
            if (!activeSheet || !focused) return
            const hex = e.target.value
            updateCellStyle(activeSheet, focused.r, focused.c, (s: any) => ({ ...s, color: hex }))
          }}
        />
      </label>
      <label className="flex items-center gap-1 text-xs text-gray-700 px-2 py-1 rounded hover:bg-gray-200 cursor-pointer">
        <Palette size={14} />
        <span>Fondo</span>
        <input
          type="color"
          className="w-6 h-6 p-0 border-0 bg-transparent cursor-pointer"
          value={(currentStyle?.backgroundColor as string) || '#ffffff'}
          onChange={(e) => {
            if (!activeSheet || !focused) return
            const hex = e.target.value
            updateCellStyle(
              activeSheet,
              focused.r,
              focused.c,
              (s: any) => ({ ...s, backgroundColor: hex }),
            )
          }}
        />
      </label>
    </div>
  )
}


