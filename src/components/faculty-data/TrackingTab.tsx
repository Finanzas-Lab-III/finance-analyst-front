"use client"
import React from "react";
import { Download, FileText, MessageSquare } from "lucide-react";

export default function TrackingTab() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900">Seguimientos Presupuestarios</h3>
        <p className="text-gray-600 mt-2">Documentos de seguimiento y análisis presupuestario organizados por períodos</p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border-2 border-blue-200">
        <div className="flex items-center mb-6">
          <div className="w-3 h-8 bg-blue-600 rounded-full mr-4"></div>
          <div>
            <h4 className="text-2xl font-bold text-gray-900">Seguimientos 2025 (Año Actual)</h4>
            <p className="text-blue-700 font-medium">Análisis y proyecciones del año en curso</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h5 className="font-semibold text-gray-900">Trimestral (3+9)</h5>
                <p className="text-sm text-gray-600">3 meses ejecutados + 9 proyectados</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 text-sm">Q3 2025</p>
                  <p className="text-xs text-gray-600">30/09/2025</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 p-1">
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 text-sm">Q2 2025</p>
                  <p className="text-xs text-gray-600">30/06/2025</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 p-1">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-green-200 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h5 className="font-semibold text-gray-900">Semestral (6+6)</h5>
                <p className="text-sm text-gray-600">6 meses ejecutados + 6 proyectados</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 text-sm">S2 2025</p>
                  <p className="text-xs text-gray-600">31/12/2025</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 p-1">
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 text-sm">S1 2025</p>
                  <p className="text-xs text-gray-600">30/06/2025</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 p-1">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-purple-200 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h5 className="font-semibold text-gray-900">Avanzado (9+3)</h5>
                <p className="text-sm text-gray-600">9 meses ejecutados + 3 proyectados</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 text-sm">2025</p>
                  <p className="text-xs text-gray-600">30/11/2025</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 p-1">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center mb-6">
          <div className="w-3 h-8 bg-green-600 rounded-full mr-4"></div>
          <div>
            <h4 className="text-xl font-bold text-gray-900">Seguimientos Mensuales 2025</h4>
            <p className="text-gray-600">Análisis detallado mes a mes del año actual</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 bg-gray-100 border-b border-gray-200 rounded-t-lg">
            <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-700">
              <div>Mes</div>
              <div>Ejecutado</div>
              <div>Proyectado</div>
              <div>Fecha</div>
              <div>Acciones</div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {[
              { month: "Agosto", executed: "$ 1.200.000", projected: "$ 150.000", date: "31/08/2025", available: true },
              { month: "Julio", executed: "$ 1.050.000", projected: "$ 300.000", date: "31/07/2025", available: true },
              { month: "Junio", executed: "$ 900.000", projected: "$ 450.000", date: "30/06/2025", available: true },
              { month: "Mayo", executed: "$ 750.000", projected: "$ 600.000", date: "31/05/2025", available: true },
              { month: "Abril", executed: "$ 600.000", projected: "$ 750.000", date: "30/04/2025", available: true },
              { month: "Marzo", executed: "$ 450.000", projected: "$ 900.000", date: "31/03/2025", available: true },
              { month: "Febrero", executed: "$ 300.000", projected: "$ 1.050.000", date: "28/02/2025", available: true },
              { month: "Enero", executed: "$ 150.000", projected: "$ 1.200.000", date: "31/01/2025", available: true },
            ].map((item, index) => (
              <div key={index} className="px-6 py-4 hover:bg-gray-50">
                <div className="grid grid-cols-5 gap-4 items-center">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-gray-900 font-medium">{item.month}</span>
                  </div>
                  <div className="text-gray-900 font-medium">{item.executed}</div>
                  <div className="text-gray-600">{item.projected}</div>
                  <div className="text-gray-600 text-sm">{item.date}</div>
                  <div>
                    {item.available ? (
                      <div className="flex items-center space-x-1">
                        <button 
                          className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50 transition-colors"
                          title="Comentarios"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors"
                          title="Descargar"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Pendiente</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center mb-6">
          <div className="w-2 h-6 bg-gray-400 rounded-full mr-3"></div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Seguimientos de Años Anteriores</h4>
            <p className="text-gray-600 text-sm">Archivos históricos para referencia y comparación</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h5 className="font-semibold text-gray-900 mb-3">Año 2024</h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-900">Seguimiento anual 2024</span>
                </div>
                <button className="text-blue-600 hover:text-blue-800">
                  <Download className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-900">Análisis 9+3 2024</span>
                </div>
                <button className="text-blue-600 hover:text-blue-800">
                  <Download className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h5 className="font-semibold text-gray-900 mb-3">Año 2023</h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-900">Seguimiento anual 2023</span>
                </div>
                <button className="text-blue-600 hover:text-blue-800">
                  <Download className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-900">Análisis 6+6 2023</span>
                </div>
                <button className="text-blue-600 hover:text-blue-800">
                  <Download className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


