'use client'
import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FileProvider } from '@/components/FileContext'
import {useArmadoSheet} from "@/components/armado/hooks/useArmadoSheets";
import ArmadoHeader from '@/components/armado/components/ArmadoHeader'
import ArmadoToolbar from '@/components/armado/components/ArmadoToolbar'
import ArmadoSheetTabs from '@/components/armado/components/ArmadoSheetTabs'
import ArmadoGrid from '@/components/armado/components/ArmadoGrid'
import ArmadoSidebar from "@/components/armado/components/ArmadoSidebar";
import { useArmadoAI } from '@/components/armado/hooks/useArmadoAI'

export default function ArmadoDocumentPage_Example() {
  // --- get params from the URL ---
  const params = useParams() as { areaYearId?: string; fileId?: string }
  const areaYearId = params?.areaYearId
  const fileId = params?.fileId
  const router = useRouter()


  const {
    loading,
    error,
    sheetNames,
    activeSheet,
    setActiveSheet,
    data,
    visibleRows,
    visibleCols,
    maximized,
    setMaximized,
    focused,
    setFocused,
    scrollRef,
    ensureCellUpdate,
    updateCellStyle,
    getColumnLetter,
  } = useArmadoSheet(fileId)

  const { analysisResults, analysisLoading, analysisError } = useArmadoAI(areaYearId)

  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const allChecked = Array.isArray(analysisResults) ? analysisResults.length === 0 : false

  return (
    <FileProvider>
      <div className="flex w-full h-screen overflow-hidden bg-gray-50 m-0 p-0">
        <div className="flex-1 min-w-0 h-full flex flex-col">
          {/* Header */}
          <ArmadoHeader
            title="Presupuesto de Armado"
            fileId={fileId}
            loading={loading}
            error={error}
            sheetCount={sheetNames.length}
          />

          {/* Toolbar */}
          <ArmadoToolbar
            maximized={maximized}
            onToggleMaximize={() => setMaximized((v) => !v)}
            activeSheet={activeSheet}
            focused={focused}
            data={data}
            updateCellStyle={updateCellStyle}
          />

          {/* Sheet Tabs */}
          <ArmadoSheetTabs
            sheetNames={sheetNames}
            activeSheet={activeSheet}
            onSelect={setActiveSheet}
          />

          {/* Grid */}
          <ArmadoGrid
            loading={loading}
            error={error}
            maximized={maximized}
            scrollRef={scrollRef as React.RefObject<HTMLDivElement | null>}
            data={data}
            visibleRows={visibleRows}
            visibleCols={visibleCols}
            getColumnLetter={getColumnLetter}
            activeSheet={activeSheet}
            setFocused={setFocused}
            ensureCellUpdate={ensureCellUpdate}
          />
        </div>

        {/* Right AI sidebar (reused) */}
        <ArmadoSidebar
          analysisResults={analysisResults}
          analysisLoading={analysisLoading}
          analysisError={analysisError}
          showDisclaimer={showDisclaimer}
          onCloseDisclaimer={() => setShowDisclaimer(false)}
          allChecked={allChecked}
          onSubmit={async ({ remaining }) => {
            if (remaining !== 0) return
            try {
              const API_BASE = process.env.NEXT_PUBLIC_SERVICE_URL ?? ''
              await fetch(`${API_BASE}/api/files/status/${encodeURIComponent(String(areaYearId ?? ''))}/revision_finanzas`, {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'ngrok-skip-browser-warning': 'true',
                },
                credentials: 'include',
              })
            } catch {
              // ignore network errors
            } finally {
              // Close the tab after hitting the endpoint when there are no remaining rules
              if (typeof window !== 'undefined') {
                window.close()
              }
            }
          }}
        />

      </div>
    </FileProvider>
  )
}
