'use client'

import React from 'react'

type ArmadoHeaderProps = {
  title?: string
  fileId?: string
  loading: boolean
  error: string | null
  sheetCount: number
}

export default function ArmadoHeader({
  title = 'Presupuesto de Armado',
  fileId,
  loading,
  error,
  sheetCount,
}: ArmadoHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        {fileId && <span className="text-xs text-gray-500">Archivo #{fileId}</span>}
      </div>
      <div className="text-xs text-gray-500">
        {loading ? 'Cargando…' : error ? 'Error' : sheetCount ? `${sheetCount} hojas` : '—'}
      </div>
    </div>
  )
}


