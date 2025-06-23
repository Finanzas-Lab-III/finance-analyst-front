"use client"
import React, { useRef, useState } from "react";
import LintErrorCard from "@/components/LintErrorCard";
import * as XLSX from "xlsx";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import { ArrowLeft } from "lucide-react";
import "handsontable/dist/handsontable.full.css";

registerAllModules();

// Simulación de errores de linting
const mockLintErrors = [
  {
    id: 1,
    message: "Falta punto y coma en la línea 10",
    line: 10,
    columns: [5, 8],
    rule: "semi"
  },
  {
    id: 2,
    message: "Variable no usada en la línea 15",
    line: 15,
    columns: [7],
    rule: "no-unused-vars"
  },
  {
    id: 3,
    message: "Indentación incorrecta en la línea 20",
    line: 20,
    columns: [1, 2, 3],
    rule: "indent"
  }
];

const Page = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[][]>([]);
  const [checkedErrors, setCheckedErrors] = useState<{ [id: number]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);

  // Procesa el archivo cargado y lo convierte a datos para Handsontable
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
    setCheckedErrors({});
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

  const handleCheck = (id: number) => {
    setCheckedErrors((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allChecked = mockLintErrors.every((err) => checkedErrors[err.id]);

  return (
    <div className="flex flex-col h-full bg-[#2d2f30]">
      {/* Botón de carga centrado y estilizado */}
      {!selectedFile && (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <button
            className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow-md text-lg font-semibold hover:bg-blue-700 transition mb-4"
            onClick={() => fileInputRef.current?.click()}
          >
            Cargar archivo
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept=".xlsx,.xls,.csv,.txt"
          />
          <p className="text-gray-400 mt-2 text-base">Selecciona un archivo para comenzar el armado</p>
        </div>
      )}

      {/* Display de archivo y dashboard de errores */}
      {selectedFile && (
        <div className="flex flex-1 overflow-hidden">
          {/* Columna principal: preview */}
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            <div className="mb-4 flex items-center">
              <button
                className="p-1 rounded-full hover:bg-gray-700 mr-4"
                onClick={() => setSelectedFile(null)}
              >
                <ArrowLeft size={24} className="text-white" />
              </button>
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
                <h3 className="text-lg font-semibold">Errores de formato</h3>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4">
              {mockLintErrors.map((err) => (
                <LintErrorCard
                  key={err.id}
                  id={err.id}
                  message={err.message}
                  line={err.line}
                  columns={err.columns}
                  rule={err.rule}
                  checked={!!checkedErrors[err.id]}
                  onCheck={handleCheck}
                />
              ))}
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
                  className={`w-full py-2 rounded text-white font-semibold transition-colors ${allChecked ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}
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
  );
};

export default Page;