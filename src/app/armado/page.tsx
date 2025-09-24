"use client"
import React, { useRef, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import NextDynamic from "next/dynamic";
import LintErrorCard from "@/components/LintErrorCard";
import { useFileContext } from "@/components/FileContext";
import { ArrowLeft } from "lucide-react";
import "handsontable/dist/handsontable.full.css";
import axios from "axios";

export const dynamic = 'force-dynamic';

// Dynamically load heavy modules to speed up initial load
const DynamicHotTable = NextDynamic(() => import("@handsontable/react").then(m => m.HotTable), { ssr: false });
const ensureXLSX = async () => (await import("xlsx"));

// Register Handsontable modules once on client after mount
// Avoids pulling in handsontable registry at build/SSR time
// This keeps initial bundle smaller and speeds up first paint
const useRegisterHandsontableModules = () => {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("handsontable/registry");
        if (!cancelled) mod.registerAllModules();
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
};

const ArmadoContent = () => {
  const router = useRouter();
  useRegisterHandsontableModules();
  const searchParams = useSearchParams();
  const { selectedFile: contextSelectedFile } = useFileContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[][]>([]);
  const [prevYearFile, setPrevYearFile] = useState<File | null>(null);
  const [prevYearFileData, setPrevYearFileData] = useState<any[][]>([]);
  const [loading, setLoading] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevYearFileInputRef = useRef<HTMLInputElement>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState("2025");

  // Get context parameters
  const context = searchParams.get('context');
  const areaYearId = searchParams.get('id');
  const fileParam = searchParams.get('file');
  
  // Determine page title based on context
  const getPageTitle = () => {
    if (context === 'area_year' && areaYearId) {
      // Map area IDs to their names and codes
      const areaMap: Record<string, { code: string; name: string }> = {
        '103': { code: 'FI', name: 'Facultad de Ingeniería' },
        '203': { code: 'FCB', name: 'Facultad de Ciencias Biomédicas' },
        '303': { code: 'FCE', name: 'Facultad de Ciencias Empresariales' },
        '403': { code: 'FD', name: 'Facultad de Derecho' },
        '503': { code: 'FC', name: 'Facultad de Comunicación' },
        '603': { code: 'FI-SIS', name: 'Departamento de Sistemas' },
        '703': { code: 'FI-IND', name: 'Departamento de Ingeniería Industrial' },
        '1': { code: 'FI', name: 'Facultad de Ingeniería' },
        '2': { code: 'FCB', name: 'Facultad de Ciencias Biomédicas' },
        '3': { code: 'FCE', name: 'Facultad de Ciencias Empresariales' },
        '4': { code: 'FD', name: 'Facultad de Derecho' },
        '5': { code: 'FC', name: 'Facultad de Comunicación' },
        '6': { code: 'FI-SIS', name: 'Departamento de Sistemas' },
        '7': { code: 'FI-IND', name: 'Departamento de Ingeniería Industrial' },
      };
      
      const area = areaMap[areaYearId];
      if (area) {
        return `Presupuesto ${area.code} 2025`;
      }
      return `Presupuesto Área ${areaYearId}`;
    }
    return "Armado de Presupuesto";
  };

  // Determine page description based on context
  const getPageDescription = () => {
    if (context === 'area_year' && areaYearId) {
      // Map area IDs to their names
      const areaMap: Record<string, { code: string; name: string }> = {
        '103': { code: 'FI', name: 'Facultad de Ingeniería' },
        '203': { code: 'FCB', name: 'Facultad de Ciencias Biomédicas' },
        '303': { code: 'FCE', name: 'Facultad de Ciencias Empresariales' },
        '403': { code: 'FD', name: 'Facultad de Derecho' },
        '503': { code: 'FC', name: 'Facultad de Comunicación' },
        '603': { code: 'FI-SIS', name: 'Departamento de Sistemas' },
        '703': { code: 'FI-IND', name: 'Departamento de Ingeniería Industrial' },
        '1': { code: 'FI', name: 'Facultad de Ingeniería' },
        '2': { code: 'FCB', name: 'Facultad de Ciencias Biomédicas' },
        '3': { code: 'FCE', name: 'Facultad de Ciencias Empresariales' },
        '4': { code: 'FD', name: 'Facultad de Derecho' },
        '5': { code: 'FC', name: 'Facultad de Comunicación' },
        '6': { code: 'FI-SIS', name: 'Departamento de Sistemas' },
        '7': { code: 'FI-IND', name: 'Departamento de Ingeniería Industrial' },
      };
      
      const area = areaMap[areaYearId];
      if (selectedFile) {
        return `Editando: ${selectedFile.name}`;
      } else if (area) {
        return `Presupuesto para equipamiento y personal de ${area.name} para el año 2025`;
      }
      return `Cargando presupuesto del área ${areaYearId}...`;
    }
    return selectedFile ? `Editando: ${selectedFile.name}` : 'Carga y edita archivos de presupuesto';
  };

  // Load default file based on context
  useEffect(() => {
    if (context === 'area_year' && areaYearId && !selectedFile) {
      // Load the specific Excel file
      loadDefaultExcelFile();
    }
  }, [context, areaYearId, selectedFile]);

  const loadDefaultExcelFile = async () => {
    setLoading(true);
    try {
      // Determine the file path for the Excel file download endpoint
      let filePath: string;
      let API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      
      if (fileParam) {
        // If file parameter is provided, use it directly with the correct path format
        filePath = fileParam;
      } else if (context === 'area_year' && areaYearId) {
        // Default files based on area and current year
        filePath = `${areaYearId}/presupuesto/${currentYear}.xlsx`;
      } else {
        throw new Error('No file path specified');
      }

      // Load the specific Excel file from the download endpoint
      const response = await fetch(`${API_BASE}/api/excel/file/${filePath}/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const XLSX = await ensureXLSX();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      
      // Set sheet information
      setSheetNames(workbook.SheetNames);
      const firstSheet = workbook.SheetNames[0];
      setSelectedSheet(firstSheet);
      
      // Parse the first sheet
      const worksheet = workbook.Sheets[firstSheet];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      setFileData(jsonData);
      
      // Create a File object for display
      const fileName = filePath.split('/').pop() || "presupuesto.xlsx";
      const file = new File([arrayBuffer], fileName, {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      setSelectedFile(file);
    } catch (error) {
      console.error('Error loading file:', error);
      setProcessingError('No se pudo cargar el archivo. Por favor, intente nuevamente.');
      setFileData([]);
      setSheetNames([]);
      setSelectedSheet(null);
    } finally {
      setLoading(false);
    }
  };

  // Elimino el manejo de errores mockeados y el check
  const allChecked = true;

  // Handle back navigation
  const handleBack = () => {
    if (context === 'area_year' && areaYearId) {
      router.push(`/backoffice/faculty-data/${areaYearId}`);
    } else {
      router.push('/');
    }
  };

  // Procesa el archivo cargado y lo convierte a datos para Handsontable
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
    setProcessingError(null);
    setFileData([]);
    setSheetNames([]);
    setSelectedSheet(null);
    if (file) {
      setLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const XLSX = await ensureXLSX();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        setSheetNames(workbook.SheetNames);
        const firstSheet = workbook.SheetNames[0];
        setSelectedSheet(firstSheet);
        const worksheet = workbook.Sheets[firstSheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        setFileData(jsonData);
      } catch (err) {
        setProcessingError("No se pudo procesar el archivo");
      } finally {
        setLoading(false);
      }
    }
  };

  // Nuevo: Procesa el archivo del año anterior y lo guarda en el estado, pero no lo muestra
  const handlePrevYearFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPrevYearFile(file || null);
    setPrevYearFileData([]);
    if (file) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const XLSX = await ensureXLSX();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        setPrevYearFileData(jsonData);
      } catch (err) {
        // No hacer nada por ahora
      }
    }
  };

  // Cuando cambia la hoja seleccionada
  const handleSheetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedFile) return;
    const sheet = e.target.value;
    setSelectedSheet(sheet);
    setLoading(true);
    setTimeout(async () => {
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const XLSX = await ensureXLSX();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const worksheet = workbook.Sheets[sheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        setFileData(jsonData);
      } catch (err) {
        setProcessingError("No se pudo procesar la hoja seleccionada");
      } finally {
        setLoading(false);
      }
    }, 0);
  };

  // Analizar automáticamente cuando ambos archivos estén presentes
  useEffect(() => {
    const analyze = async () => {
      if (!selectedFile || !prevYearFile) return;
      setAnalysisLoading(true);
      setAnalysisError(null);
      setAnalysisResults([]);
      try {
        const formData = new FormData();
        formData.append("current_year", currentYear);
        formData.append("budget_file", selectedFile);
        formData.append("previous_years_files", prevYearFile);
        const budgetAnalysisUrl = process.env.NEXT_PUBLIC_SERVICE_URL;
        const response = await axios.post(`${budgetAnalysisUrl}/analyze-budget/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("API response", response.data);
        setAnalysisResults(response.data);
      } catch (err: any) {
        setAnalysisError("No se pudo analizar el presupuesto");
      } finally {
        setAnalysisLoading(false);
      }
    };
    analyze();
  }, [selectedFile, prevYearFile, currentYear]);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <div className="flex flex-col flex-1 h-full min-w-0">
        {/* Header with back button */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-100 mr-4 transition-colors duration-200"
              title="Volver al inicio"
            >
              <ArrowLeft size={24} className="text-gray-900" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
              <p className="text-gray-600 mt-1">
                {getPageDescription()}
              </p>
            </div>
          </div>
        </div>

        {/* Inputs de carga centrados y estilizados */}
        {!selectedFile && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
            <div className="flex flex-col items-center gap-2">
              <button
                className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow-md text-lg font-semibold hover:bg-blue-700 transition mb-2"
                onClick={() => fileInputRef.current?.click()}
              >
                Cargar presupuesto año actual
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept=".xlsx,.xls,.csv,.txt"
              />
              <p className="text-gray-600 text-base">Selecciona el archivo del presupuesto de este año</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button
                className="px-8 py-3 bg-gray-600 text-white rounded-lg shadow-md text-lg font-semibold hover:bg-gray-700 transition mb-2"
                onClick={() => prevYearFileInputRef.current?.click()}
              >
                Cargar presupuesto año anterior
              </button>
              <input
                type="file"
                ref={prevYearFileInputRef}
                className="hidden"
                onChange={handlePrevYearFileChange}
                accept=".xlsx,.xls,.csv,.txt"
              />
              <p className="text-gray-600 text-base">Selecciona el archivo del presupuesto del año anterior (opcional)</p>
              {prevYearFile && <span className="text-green-600 text-xs">Archivo cargado: {prevYearFile.name}</span>}
            </div>
          </div>
        )}

        {/* Loading state for automatic file loading */}
        {!selectedFile && loading && (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">{getPageDescription()}</p>
          </div>
        )}

        {/* Display de archivo y dashboard de errores */}
        {selectedFile && (
          <div className="flex flex-1 overflow-hidden">
            {/* Columna principal: preview */}
            <div className="flex-1 flex flex-col p-6 overflow-hidden">
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col min-h-0">
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <span className="ml-2 text-gray-600">Procesando archivo...</span>
                </div>
              ) : processingError ? (
                <div className="text-red-600 px-4">{processingError}</div>
              ) : fileData.length > 0 ? (
                <>
                  <div className="flex-1 min-h-0 overflow-auto p-2">
                    <DynamicHotTable
                      data={fileData}
                      colHeaders={true}
                      rowHeaders={true}
                      height="100%"
                      width="100%"
                      minRows={fileData.length}
                      maxRows={fileData.length}
                      stretchH="all"
                      autoWrapRow={true}
                      autoWrapCol={true}
                      contextMenu={true}
                      filters={true}
                      dropdownMenu={true}
                      columnSorting={true}
                      manualRowResize={true}
                      manualColumnResize={true}
                      comments={true}
                      className="htCenter"
                    />
                  </div>
                  {/* Selector de hoja como botones debajo de la tabla */}
                  {sheetNames.length > 1 && (
                    <div className="flex gap-2 px-4 pb-4 pt-2 border-t border-gray-200">
                      {sheetNames.map((name) => (
                        <button
                          key={name}
                          onClick={() => handleSheetChange({ target: { value: name } } as any)}
                          className={`px-3 py-1 rounded text-sm font-medium border transition-colors duration-150 ${
                            selectedSheet === name
                              ? "bg-blue-600 text-white border-blue-700 shadow"
                              : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">No hay datos para mostrar.</div>
              )}
            </div>
          </div>

          {/* Dashboard de errores a la derecha - estilo chat */}
          <div className="w-[320px] bg-white text-gray-900 h-full flex flex-col border-l border-gray-200">
            <div className="p-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold">Cambios detectados</h3>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4">
              {/* Cards de análisis de presupuesto */}
              {analysisLoading && (
                <div className="mt-4 text-blue-600">Analizando presupuesto...</div>
              )}
              {analysisError && (
                <div className="mt-4 text-red-600">{analysisError}</div>
              )}
              {!analysisLoading && !analysisError && (
                Array.isArray(analysisResults) ? (
                  analysisResults.length > 0 ? (
                    <div className="mt-4 flex flex-col gap-3">
                      {analysisResults.map((result, idx) => (
                        <div key={idx} className="bg-gray-50 border-l-4 border-blue-500 rounded shadow p-3">
                          <div className="font-semibold text-base mb-1 text-gray-900">{result.message}</div>
                          <div className="text-xs text-gray-600 mb-1">{result.description}</div>
                          <div className="text-sm text-gray-500">{result.comments}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 text-gray-500">No se encontraron observaciones en el análisis.</div>
                  )
                ) : (
                  <div className="mt-4 text-yellow-600">
                    Respuesta inesperada de la API:<br />
                    <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(analysisResults, null, 2)}</pre>
                  </div>
                )
              )}
            </div>
            <div className="p-4">
              <div className="border-t border-gray-200 pt-4">
                {/* Disclaimer arriba del botón de enviar */}
                {showDisclaimer && (
                  <div className="relative bg-yellow-100 text-yellow-800 text-xs rounded px-3 py-2 mb-3 flex items-start shadow-sm">
                    <span className="flex-1 pr-4">
                      Esta es una verificación automatizada y puede contener errores. Por favor, revisa manualmente si es necesario.
                    </span>
                    <button
                      className="ml-2 text-yellow-700 hover:text-yellow-900 text-lg font-bold leading-none focus:outline-none"
                      onClick={() => setShowDisclaimer(false)}
                      aria-label="Cerrar aviso"
                    >
                      ×
                    </button>
                  </div>
                )}
                <button
                  className={`w-full py-2 mt-2 rounded text-white font-semibold transition-colors ${allChecked ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}
                  disabled={!allChecked}
                >
                  Enviar
                </button>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ArmadoContent />
    </Suspense>
  );
}