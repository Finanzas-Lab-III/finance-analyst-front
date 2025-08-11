"use client"
import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import LintErrorCard from "@/components/LintErrorCard";
import BudgetSidebar from "@/components/sidebar/BudgetSidebar";
import AIAgentSidebar from "@/components/sidebar/ai-agent-sidebar/AIAgentSidebar";
import { useFileContext } from "@/components/FileContext";
import * as XLSX from "xlsx";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { ArrowLeft } from "lucide-react";
import "handsontable/dist/handsontable.full.css";
import axios from "axios";

registerAllModules();

const Page = () => {
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

  // Elimino el manejo de errores mockeados y el check
  const allChecked = true;

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
        const response = await axios.post("http://localhost:8001/analyze-budget/", formData, {
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
    <div className="flex h-screen bg-[#2d2f30]">
      <BudgetSidebar currentPage="armado" />
      <div className="flex flex-col flex-1 h-full">
      {/* Inputs de carga centrados y estilizados */}
      {!selectedFile && (
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
            <p className="text-gray-400 text-base">Selecciona el archivo del presupuesto de este año</p>
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
            <p className="text-gray-400 text-base">Selecciona el archivo del presupuesto del año anterior (opcional)</p>
            {prevYearFile && <span className="text-green-400 text-xs">Archivo cargado: {prevYearFile.name}</span>}
          </div>
        </div>
      )}

      {/* Display de archivo y dashboard de errores */}
      {selectedFile && (
        <div className="flex flex-1 overflow-hidden">
          {/* Columna principal: preview */}
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            <div className="mb-4 flex items-center">
              <Link
                href="/budget/lab-budget-2025"
                className="p-1 rounded-full hover:bg-gray-700 mr-4"
              >
                <ArrowLeft size={24} className="text-white" />
              </Link>
              <h2 className="text-l font-bold text-white mr-4">Armado</h2>
              <p className="text-gray-400 text-sm truncate">Archivo: {selectedFile.name}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col min-h-0">
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
                    <HotTable
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
          <div className="w-[320px] bg-[#1D1F20] text-white h-full flex flex-col">
            <div className="p-4">
              <div className="border-b border-gray-700 pb-4">
                <h3 className="text-lg font-semibold">Cambios detectados</h3>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4">
              {/* Cards de análisis de presupuesto */}
              {analysisLoading && (
                <div className="mt-4 text-blue-400">Analizando presupuesto...</div>
              )}
              {analysisError && (
                <div className="mt-4 text-red-400">{analysisError}</div>
              )}
              {!analysisLoading && !analysisError && (
                Array.isArray(analysisResults) ? (
                  analysisResults.length > 0 ? (
                    <div className="mt-4 flex flex-col gap-3">
                      {analysisResults.map((result, idx) => (
                        <div key={idx} className="bg-[#232425] border-l-4 border-blue-500 rounded shadow p-3">
                          <div className="font-semibold text-base mb-1">{result.message}</div>
                          <div className="text-xs text-gray-300 mb-1">{result.description}</div>
                          <div className="text-sm text-gray-400">{result.comments}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 text-gray-400">No se encontraron observaciones en el análisis.</div>
                  )
                ) : (
                  <div className="mt-4 text-yellow-400">
                    Respuesta inesperada de la API:<br />
                    <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(analysisResults, null, 2)}</pre>
                  </div>
                )
              )}
            </div>
            <div className="p-4">
              <div className="border-t border-gray-700 pt-4">
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
      {(selectedFile || contextSelectedFile) && <AIAgentSidebar />}
    </div>
  );
};

export default Page;