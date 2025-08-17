"use client"
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Upload, Calendar, Settings, Edit, ExternalLink } from "lucide-react";
import BudgetPreviewModal from "@/components/BudgetPreviewModal";
import { getBudgetData, getAllBudgetYears, BudgetData } from "@/data/mockBudgetData";
import { useFileContext } from '@/components/FileContext';
import { fetchFileTree } from '@/api/fileService';
import { FileSystemNode } from '@/api/fileSystemData';

interface BudgetAreaPageProps {
  params: Promise<{ area: string }>;
}

// Configuration for different budget areas
const budgetAreaConfig = {
  laboratorio: {
    title: "Presupuesto de Laboratorio",
    department: "Departamento de Laboratorio",
    description: "Gestión del presupuesto del laboratorio de investigación"
  },
  biomedica: {
    title: "Presupuesto de Facultad Biomédica", 
    department: "Facultad Biomédica",
    description: "Presupuesto específico para el área biomédica"
  },
  informatica: {
    title: "Presupuesto de Informática",
    department: "Departamento de Informática", 
    description: "Gestión presupuestaria del departamento de informática"
  },
  industrial: {
    title: "Presupuesto de Ingeniería Industrial",
    department: "Ingeniería Industrial",
    description: "Presupuesto del área de ingeniería industrial"
  },
  ingenieria: {
    title: "Presupuesto de Ingeniería",
    department: "Facultad de Ingeniería",
    description: "Presupuesto general de la Facultad de Ingeniería"
  }
};

const BudgetAreaPage = ({ params }: BudgetAreaPageProps) => {
  const { area } = React.use(params);
  const [activeTab, setActiveTab] = useState("armado");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetData | null>(null);
  const router = useRouter();

  // Seguimiento state
  const { setSelectedFile } = useFileContext();
  const [files, setFiles] = useState<FileSystemNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get configuration for this area
  const config = budgetAreaConfig[area as keyof typeof budgetAreaConfig];

  const allBudgetYears = getAllBudgetYears();
  
  // Filtrar años según el tab activo
  const budgetYears = activeTab === "años-anteriores" 
    ? allBudgetYears.filter(year => year === "2024" || year === "2023")
    : allBudgetYears.filter(year => year === "2025");

  // Load files when seguimientos tab is active
  useEffect(() => {
    if (activeTab === "seguimientos") {
      const loadFiles = async () => {
        try {
          setLoading(true);
          const fileTree = await fetchFileTree();
          
          // Flatten the file tree to get all Excel files
          const allFiles: FileSystemNode[] = [];
          const flattenFiles = (nodes: FileSystemNode[]) => {
            nodes.forEach(node => {
              if (node.type === 'excel_file') {
                allFiles.push(node);
              } else if (node.children) {
                flattenFiles(node.children);
              }
            });
          };
          
          flattenFiles(fileTree);
          setFiles(allFiles);
        } catch (err) {
          console.error('Error loading files:', err);
          setError('Error al cargar los archivos. Por favor, intenta de nuevo.');
        } finally {
          setLoading(false);
        }
      };

      loadFiles();
    }
  }, [activeTab]);

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
    // Navigate to the seguimiento viewer
    router.push('/seguimiento');
  };

  const formatFileSize = (sizeBytes?: number) => {
    if (!sizeBytes) return 'N/A';
    const sizeMB = sizeBytes / (1024 * 1024);
    return `${sizeMB.toFixed(1)} MB`;
  };

  const getFileDate = (filename: string) => {
    // Try to extract year from filename
    const yearMatch = filename.match(/20\d{2}/);
    return yearMatch ? yearMatch[0] : 'N/A';
  };

  const getFileStatus = (filename: string) => {
    // Simulate file status based on year or name
    const year = getFileDate(filename);
    if (year === '2025') return 'En Progreso';
    if (year === '2024') return 'Aprobado';
    return 'Completado';
  };

  const getLastUpdated = (filename: string) => {
    // Simulate last updated date
    const year = getFileDate(filename);
    if (year === '2025') return '15/12/2024';
    if (year === '2024') return '20/11/2024';
    return '10/01/2024';
  };

  // Categorize files arbitrarily
  const categorizeFiles = (fileList: FileSystemNode[]) => {
    const variaciones: FileSystemNode[] = [];
    const proyecciones: FileSystemNode[] = [];

    fileList.forEach((file, index) => {
      // Alternate between categories or use some logic
      if (index % 2 === 0) {
        variaciones.push(file);
      } else {
        proyecciones.push(file);
      }
    });

    return { variaciones, proyecciones };
  };

  const { variaciones, proyecciones } = categorizeFiles(files);

  const renderFileTable = (fileList: FileSystemNode[], title: string, description: string) => {
    if (fileList.length === 0 && !loading) {
      return (
        <div className="mb-8">
          <h4 className="text-lg font-semibold mb-4 text-gray-900">{title}</h4>
          <p className="text-gray-600 mb-6">{description}</p>
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="p-8 text-center text-gray-500">
              <FileText size={48} className="text-gray-400 mx-auto mb-4" />
              <p>No hay archivos disponibles en esta categoría</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-8">
        <h4 className="text-lg font-semibold mb-4 text-gray-900">{title}</h4>
        <p className="text-gray-600 mb-6">{description}</p>
        
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-100 font-semibold text-gray-900">
            <div>Documento</div>
            <div>Año</div>
            <div>Estatus</div>
            <div>Última Actualización</div>
          </div>
          
          {fileList.map((file, index) => (
            <div 
              key={index} 
              onClick={() => handleFileSelect(file.path || '')}
              className="grid grid-cols-4 gap-4 p-4 items-center border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              title="Haz clic para analizar este archivo"
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-gray-900 truncate">{file.name}</span>
              </div>
              <div className="text-gray-600">{getFileDate(file.name)}</div>
              <div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  getFileStatus(file.name) === 'Aprobado' 
                    ? 'bg-green-100 text-green-800' 
                    : getFileStatus(file.name) === 'En Progreso'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {getFileStatus(file.name)}
                </span>
              </div>
              <div className="text-gray-600">{getLastUpdated(file.name)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handlePreviewClick = (year: string) => {
    const budgetData = getBudgetData(year);
    setSelectedBudget(budgetData);
    setIsModalOpen(true);
  };

  const handleFullViewClick = (year: string) => {
    router.push(`/presupuesto/vista-detallada?year=${year}&area=${area}`);
  };

  const handleArmadoClick = () => {
    router.push('/armado');
  };

  // If area doesn't exist in config, show error
  if (!config) {
    return (
      <main className="min-h-screen bg-white text-gray-900">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Área de presupuesto no encontrada</h1>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <Link 
            href="/"
            className="p-2 rounded-full hover:bg-gray-100 mr-4 transition-colors duration-200"
          >
            <ArrowLeft size={24} className="text-gray-900" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Gestión Presupuestaria</h1>
            <p className="text-gray-600 mt-1">{config.title}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gray-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">{config.department} 2025</h2>
          
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
                <p className="text-gray-600 mb-6">Esta sección contiene los documentos presupuestarios del {config.department} de años anteriores</p>
                
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
                <p className="text-gray-600 mb-6">Esta sección contiene los documentos presupuestarios del {config.department} para el año 2025</p>
                
                {/* Documents Table - Same as años anteriores but with 2025 and clickable rows */}
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
                        <div 
                          key={year} 
                          onClick={handleArmadoClick}
                          className="grid grid-cols-4 gap-4 p-4 items-center border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                          title="Haz clic para editar este archivo en el armado"
                        >
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
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleArmadoClick}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Crear Nuevo Presupuesto
                  </button>
                  <button
                    onClick={handleArmadoClick}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors duration-200"
                  >
                    Editar Presupuesto Existente
                  </button>
                  <button 
                    onClick={handleArmadoClick}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Cargar desde Excel
                  </button>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 mt-8">
                  <h4 className="font-semibold text-blue-900 mb-3">💡 ¿Cómo trabajar con un archivo?</h4>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p>1. <strong>Haz clic en cualquier fila</strong> de la tabla para abrir el editor de armado</p>
                    <p>2. <strong>Carga archivos Excel</strong> para crear o editar presupuestos</p>
                    <p>3. <strong>Compara con años anteriores</strong> para análisis automático</p>
                    <p>4. <strong>Usa las herramientas de edición</strong> para modificar datos directamente</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "seguimientos" && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Seguimiento de Presupuesto</h3>
              <p className="text-gray-600 mb-6">Monitorea y analiza la ejecución del presupuesto mediante documentos de seguimiento</p>
              
              {loading && (
                <div className="bg-white rounded-lg p-8 text-center border border-gray-200 mb-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando archivos disponibles...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 rounded-lg p-6 border border-red-200 mb-8">
                  <p className="text-red-800">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              )}

              {!loading && !error && files.length === 0 && (
                <div className="bg-white rounded-lg p-8 text-center border border-gray-200 mb-8">
                  <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">No hay archivos disponibles</h4>
                  <p className="text-gray-600">No se encontraron archivos de presupuesto en el sistema.</p>
                </div>
              )}

              {!loading && !error && files.length > 0 && (
                <>
                  {/* Variaciones presupuestarias */}
                  {renderFileTable(
                    variaciones, 
                    "Variaciones Presupuestarias", 
                    "Documentos que reflejan cambios y ajustes en el presupuesto durante el período de ejecución"
                  )}

                  {/* Proyecciones de presupuestos */}
                  {renderFileTable(
                    proyecciones, 
                    "Proyecciones de Presupuestos", 
                    "Documentos con estimaciones y proyecciones futuras del comportamiento presupuestario"
                  )}

                  {/* Instructions */}
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 mt-8">
                    <h4 className="font-semibold text-blue-900 mb-3">💡 ¿Cómo analizar un archivo?</h4>
                    <div className="text-sm text-blue-800 space-y-2">
                      <p>1. <strong>Haz clic en cualquier fila</strong> de la tabla para seleccionar un archivo</p>
                      <p>2. <strong>El archivo se cargará automáticamente</strong> en el visor de seguimiento</p>
                      <p>3. <strong>Podrás ver los datos del presupuesto</strong> en formato de hoja de cálculo</p>
                      <p>4. <strong>Usa las herramientas de IA</strong> para obtener insights personalizados sobre el documento</p>
                    </div>
                  </div>
                </>
              )}
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

export default BudgetAreaPage; 