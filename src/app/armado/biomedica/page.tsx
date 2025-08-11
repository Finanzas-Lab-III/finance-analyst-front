"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import BudgetPreviewModal from "@/components/BudgetPreviewModal";
import { getBudgetData, getAllBudgetYears, BudgetData } from "@/data/mockBudgetData";

export default function BiomedicaPage() {
  const [activeTab, setActiveTab] = useState("años-anteriores");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetData | null>(null);
  const router = useRouter();

  const allBudgetYears = getAllBudgetYears();
  
  // Filtrar años según el tab activo
  const budgetYears = activeTab === "años-anteriores" 
    ? allBudgetYears.filter(year => year === "2024" || year === "2023")
    : allBudgetYears.filter(year => year === "2025");

  const handlePreviewClick = (year: string) => {
    const budgetData = getBudgetData(year);
    setSelectedBudget(budgetData);
    setIsModalOpen(true);
  };

  const handleFullViewClick = (year: string) => {
    router.push(`/armado/budget-view?year=${year}&area=biomedica`);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.push("/armado")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Presupuesto Biomédica</h1>
            <p className="text-gray-600 mt-1">Gestiona los presupuestos del área biomédica</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 max-w-md">
          <button
            onClick={() => setActiveTab("años-anteriores")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "años-anteriores"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Años anteriores
          </button>
          <button
            onClick={() => setActiveTab("armado")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "armado"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Armado
          </button>
          <button
            onClick={() => setActiveTab("seguimientos")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "seguimientos"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Seguimientos
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {(activeTab === "años-anteriores" || activeTab === "armado") && (
            <>
              {/* Budget List Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                  <div>Archivo</div>
                  <div>Estatus</div>
                  <div>Última actualización</div>
                  <div>Actualizado por</div>
                </div>
              </div>

              {/* Budget List */}
              <div className="divide-y divide-gray-200">
                {budgetYears.length > 0 ? (
                  budgetYears.map((year) => {
                    const budgetData = getBudgetData(year);
                    return (
                      <div key={year} className="grid grid-cols-4 gap-4 p-4 items-center border-b border-gray-200 last:border-b-0">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-gray-900">{budgetData.archivo}</span>
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            budgetData.estatus === 'Aprobado' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {budgetData.estatus}
                          </span>
                        </div>
                        <div className="text-gray-600">{budgetData.ultima_actualizacion}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900">{budgetData.actualizado_por}</span>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handlePreviewClick(year)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Vista previa
                            </button>
                            <button 
                              onClick={() => handleFullViewClick(year)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Ver completo
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay presupuestos disponibles para esta sección</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones disponibles</h3>
                <div className="flex space-x-4">
                  <Link
                    href="/armado/biomedica/crear-nuevo"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Crear Nuevo Presupuesto
                  </Link>
                  <Link
                    href="/armado/biomedica/editar"
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    Editar Presupuesto Existente
                  </Link>
                </div>
              </div>
            </>
          )}

          {activeTab === "seguimientos" && (
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Seguimientos</h3>
              <p className="text-gray-600">Contenido de seguimientos del presupuesto...</p>
            </div>
          )}
        </div>
      </div>

      {/* Budget Preview Modal */}
      <BudgetPreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        budgetData={selectedBudget}
      />
    </main>
  );
}
