"use client"
import React from "react";
import { Download, Upload, FileText } from "lucide-react";
import { ArmadoDocument } from "@/api/userService";
import { useRouter } from "next/navigation";

interface BudgetTabProps {
  latest: ArmadoDocument | null | undefined;
  history: ArmadoDocument[] | undefined;
  onOpenUpload: () => void;
  areaYearId: string | number;
}

export default function BudgetTab({ latest, history = [], onOpenUpload, areaYearId }: BudgetTabProps) {
  const USERS_API_BASE = "/api/proxy";
  const router = useRouter();

  const handleDownload = (doc: ArmadoDocument) => {
    if (!doc?.id) return;
    const url = `${USERS_API_BASE}/api/archivo/${doc.id}?raw=true`;
    // Open in a new tab to let the browser handle file download (avoids CORS issues with fetch)
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900">Gestión de Presupuesto</h3>

      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-gray-900 text-lg">Presupuesto</h4>
            <p className="text-gray-600 text-sm mt-1">Versión actual del presupuesto</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => latest && handleDownload(latest)}
              disabled={!latest}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>Descargar</span>
            </button>
            <button 
              onClick={onOpenUpload}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Upload className="w-4 h-4" />
              <span>Nueva Versión</span>
            </button>
          </div>
        </div>
        {latest ? (
          <div
            className="bg-white rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-50"
            onClick={() => {
              if (!latest?.id) return;
              const url = `/armado/${areaYearId}/${latest.id}`;
              window.open(url, "_blank", "noopener,noreferrer");
            }}
            title="Abrir presupuesto actual"
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-gray-900 font-medium">{latest.title || latest.file_key}</p>
                <p className="text-gray-600 text-sm">{new Date(latest.created_at).toLocaleDateString('es-AR')}</p>
                {latest.notes && <p className="text-xs text-gray-500 mt-1">{latest.notes}</p>}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">No hay presupuesto disponible aún.</p>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 text-lg mb-4">Historial de Versiones</h4>
        <p className="text-gray-600 text-sm mb-4">Versiones históricas del presupuesto con cambios y mejoras</p>
        <div className="space-y-3">
          {history.map((doc, index) => (
            <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">v{index + 1 + 1}</span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{doc.title || doc.file_key}</h5>
                      {doc.notes && <p className="text-sm text-gray-600 mt-1">{doc.notes}</p>}
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString('es-AR')}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-900 font-medium truncate max-w-[240px]">{doc.file_key}</p>
                  </div>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="text-sm text-gray-500">No hay versiones anteriores.</div>
          )}
        </div>
      </div>
    </div>
  );
}


