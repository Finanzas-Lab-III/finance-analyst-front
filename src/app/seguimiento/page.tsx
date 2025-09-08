'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileSpreadsheet, FileText } from 'lucide-react';
import { useFileContext } from '@/components/FileContext';
import SpreadsheetViewer from '@/components/SpreadsheetViewer';
import AIAgentSidebar from '@/components/sidebar/ai-agent-sidebar/AIAgentSidebar';
import { fetchFileTree } from '@/api/fileService';
import { FileSystemNode } from '@/api/fileSystemData';

const Page: React.FC = () => {
  const { selectedFile, setSelectedFile } = useFileContext();
  const [files, setFiles] = useState<FileSystemNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Debug: Log the selectedFile value
  console.log('Seguimiento page - selectedFile:', selectedFile);

  useEffect(() => {
    if (!selectedFile) {
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
  }, [selectedFile]);

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
  };

  // Nuevo handler para abrir seguimiento en vista detallada
  const handleOpenSeguimientoDetailed = (file: FileSystemNode) => {
    // Simular un ID de documento y extraer información del nombre del archivo
    const mockDocumentId = Math.floor(Math.random() * 1000);
    const mockAreaYearId = "2"; // Usando un ID fijo por ahora
    const subarea = extractSubareaFromFileName(file.name);
    
    const url = `/seguimiento/vista-detallada?id=${mockDocumentId}&areaYearId=${mockAreaYearId}&subarea=${subarea}&fileName=${encodeURIComponent(file.name)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Función para extraer el tipo de seguimiento del nombre del archivo
  const extractSubareaFromFileName = (fileName: string) => {
    const nameLower = fileName.toLowerCase();
    if (nameLower.includes('3+9') || nameLower.includes('3mas9')) return '3plus9';
    if (nameLower.includes('6+6') || nameLower.includes('6mas6')) return '6plus6';
    if (nameLower.includes('9+3') || nameLower.includes('9mas3')) return '9plus3';
    
    // Check for month names
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    for (const month of months) {
      if (nameLower.includes(month)) return month;
    }
    
    return 'general';
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
    if (fileList.length === 0) {
      return (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">{title}</h3>
          <p className="text-gray-600 mb-6">{description}</p>
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <div className="p-8 text-center text-gray-500">
              <FileSpreadsheet size={48} className="text-gray-400 mx-auto mb-4" />
              <p>No hay archivos disponibles en esta categoría</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">{title}</h3>
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
              onClick={() => handleOpenSeguimientoDetailed(file)}
              className="grid grid-cols-4 gap-4 p-4 items-center border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              title="Haz clic para abrir el seguimiento en una nueva pestaña"
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

  if (!selectedFile) {
    return (
      <main className="min-h-screen bg-white text-gray-900">
        <div className="container mx-auto px-6 py-8">
          {/* Header with back button */}
          <div className="flex items-center mb-8">
            <Link 
              href="/presupuesto/laboratorio"
              className="p-2 rounded-full hover:bg-gray-100 mr-4 transition-colors duration-200"
            >
              <ArrowLeft size={24} className="text-gray-900" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Seguimiento de Presupuesto</h1>
              <p className="text-gray-600 mt-1">Selecciona un archivo para comenzar el análisis de seguimiento</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Documentos de Seguimiento</h2>
            
            {loading && (
              <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando archivos disponibles...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 rounded-lg p-6 border border-red-200">
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
              <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                <FileSpreadsheet size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay archivos disponibles</h3>
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
              </>
            )}

            {/* Instructions */}
            {!loading && !error && files.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 mt-8">
                <h3 className="font-semibold text-blue-900 mb-3">💡 ¿Cómo analizar un archivo?</h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>1. <strong>Haz clic en cualquier fila</strong> de la tabla para abrir el seguimiento en una nueva pestaña</p>
                  <p>2. <strong>El archivo se cargará automáticamente</strong> en el visor de seguimiento detallado</p>
                  <p>3. <strong>Podrás ver los datos del presupuesto</strong> en formato de hoja de cálculo interactivo</p>
                  <p>4. <strong>Usa las herramientas de IA</strong> para obtener insights personalizados sobre el documento</p>
                  <p>5. <strong>Accede a comentarios y funciones avanzadas</strong> desde la nueva pestaña</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="flex h-screen overflow-hidden">
        <div className="flex flex-col flex-1 h-full min-w-0">
          <div className="p-6 border-b border-gray-200">
            <div className="mb-4 flex items-center">
              <button
                onClick={() => setSelectedFile(undefined)}
                className="p-2 rounded-full hover:bg-gray-100 mr-4 transition-colors duration-200"
              >
                <ArrowLeft size={24} className="text-gray-900" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Seguimiento de Presupuesto</h1>
                <div className="flex items-center text-gray-600 text-sm mt-1">
                  <FileSpreadsheet size={14} className="mr-1" />
                  <span>{selectedFile?.split('/').pop() || selectedFile}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-hidden">
              <SpreadsheetViewer />
            </div>
          </div>
        </div>
        {selectedFile && <AIAgentSidebar />}
      </div>
    </main>
  );
};

export default Page;