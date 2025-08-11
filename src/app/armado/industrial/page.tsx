"use client"
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Upload, Calendar, Settings, Edit, ExternalLink } from "lucide-react";
import BudgetPreviewModal from "@/components/BudgetPreviewModal";
import { getBudgetData, getAllBudgetYears, BudgetData } from "@/data/mockBudgetData";

const IndustrialPage = () => {
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
    router.push(`/armado/budget-view?year=${year}&area=industrial`);
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <Link 
            href="/armado"
            className="p-2 rounded-full hover:bg-gray-100 mr-4 transition-colors duration-200"
          >
            <ArrowLeft size={24} className="text-gray-900" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Armado Presupuestal</h1>
            <p className="text-gray-600 mt-1">Presupuesto de Ingeniería Industrial</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gray-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Ingeniería Industrial 2025</h2>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-gray-200 rounded-lg p-1">
            <button 
              onClick={() => setActiveTab("armado")}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === "armado" 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-300"
              }`}
            >
              Armado
            </button>
            <button 
              onClick={() => setActiveTab("seguimientos")}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === "seguimientos" 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-300"
              }`}
            >
              Seguimientos
            </button>
            <button 
              onClick={() => setActiveTab("años-anteriores")}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === "años-anteriores" 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-300"
              }`}
            >
              Años anteriores
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === "años-anteriores" && (
            <>
              {/* Documentation Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Documentación</h3>
                <p className="text-gray-600 mb-6">Esta sección trata los documentos presupuestarios del área de Ingeniería Industrial para el año 2025</p>
                
                {/* Documents Table */}
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  <div className="grid grid-cols-4 gap-4 p-4 bg-gray-100 font-semibold text-gray-900">
                    <div>Documento</div>
                    <div>Estatus</div>
                    <div>Última Actualización</div>
                    <div>Actualizado por</div>
                  </div>
                  
                  {budgetYears.map((year) => {
                    const budgetData = getBudgetData(year);
                    if (!budgetData) return null;
                    
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
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="Vista rápida"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleFullViewClick(year)}
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="Vista completa"
                            >
                              <ExternalLink size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === "armado" && (
            <>
              {/* Documentation Section for Armado */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Documentación</h3>
                <p className="text-gray-600 mb-6">Esta sección trata los documentos presupuestarios del área de Ingeniería Industrial para el año 2025</p>
                
                {/* Documents Table - Same as años anteriores but with 2025 */}
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200 mb-6">
                  <div className="grid grid-cols-4 gap-4 p-4 bg-gray-100 font-semibold text-gray-900">
                    <div>Documento</div>
                    <div>Estatus</div>
                    <div>Última Actualización</div>
                    <div>Actualizado por</div>
                  </div>
                  
                  {budgetYears.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No hay datos de presupuesto disponibles
                    </div>
                  ) : (
                    budgetYears.map((year) => {
                      const budgetData = getBudgetData(year);
                      if (!budgetData) return null;
                      
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
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                title="Vista rápida"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleFullViewClick(year)}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                title="Vista completa"
                              >
                                <ExternalLink size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Link
                    href="/armado/industrial/crear-nuevo"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Crear Nuevo Presupuesto
                  </Link>
                  <Link
                    href="/armado/industrial/editar"
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors duration-200"
                  >
                    Editar Presupuesto Existente
                  </Link>
                  <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200">
                    Cargar desde Excel
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "seguimientos" && (
            <div className="mb-8">
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
};

export default IndustrialPage;
