'use client'

import React from 'react'

type ArmadoSheetTabsProps = {
  sheetNames: string[]
  activeSheet: string | null
  onSelect: (name: string) => void
}

export default function ArmadoSheetTabs({ sheetNames, activeSheet, onSelect }: ArmadoSheetTabsProps) {
  return (
    <div className="flex gap-2 px-4 py-2 bg-gray-100 border-b border-gray-200 overflow-x-auto">
      {sheetNames.map((name) => (
        <button
          key={name}
          onClick={() => onSelect(name)}
          className={`px-3 py-1.5 rounded text-sm border transition-colors whitespace-nowrap ${
            activeSheet === name
              ? 'bg-blue-600 text-white border-blue-700 shadow'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {name}
        </button>
      ))}
      {sheetNames.length === 0 && <span className="text-xs text-gray-500">Sin hojas</span>}
    </div>
  )
}


