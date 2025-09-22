"use client";

import React from "react";

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
  onSubmit?: () => void;
}) {
  return (
    <aside className="w-[320px] bg-white text-gray-900 h-full flex flex-col border-l border-gray-200">
      <div className="p-4">
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold">Cambios detectados</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {analysisLoading && <div className="mt-4 text-blue-600">Analizando presupuesto...</div>}
        {analysisError && <div className="mt-4 text-red-600">{analysisError}</div>}

        {!analysisLoading && !analysisError && (
          Array.isArray(analysisResults) ? (
            analysisResults.length > 0 ? (
              <div className="mt-4 flex flex-col gap-3">
                {analysisResults.map((result: AnalysisItem, idx: number) => (
                  <div key={idx} className="bg-gray-50 border-l-4 border-blue-500 rounded shadow p-3">
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
                ))}
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

      <div className="p-4">
        <div className="border-t border-gray-200 pt-4">
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
              allChecked ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={!allChecked}
            onClick={onSubmit}
          >
            Enviar
          </button>
        </div>
      </div>
    </aside>
  );
}
