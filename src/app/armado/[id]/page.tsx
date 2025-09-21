"use client"
import React, { useEffect, useRef, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import NextDynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import "handsontable/dist/handsontable.full.css";

export const dynamic = 'force-dynamic';

// Dynamically load heavy modules to speed up initial load
const DynamicHotTable = NextDynamic(() => import("@handsontable/react").then(m => m.HotTable), { ssr: false });
const ensureXLSX = async () => (await import("xlsx"));

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
    return () => { cancelled = true; };
  }, []);
};

function extractFilenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  // content-disposition: attachment; filename="myfile.xlsx"; filename*=UTF-8''myfile.xlsx
  const matchQuoted = header.match(/filename\s*=\s*"([^"]+)"/i);
  if (matchQuoted && matchQuoted[1]) return matchQuoted[1];
  const matchSimple = header.match(/filename\s*=\s*([^;]+)/i);
  if (matchSimple && matchSimple[1]) return decodeURIComponent(matchSimple[1].trim());
  return null;
}

function dataUrlToArrayBuffer(dataUrl: string): ArrayBuffer {
  const commaIndex = dataUrl.indexOf(",");
  const base64 = dataUrl.slice(commaIndex + 1);
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

const ArmadoFileById = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  useRegisterHandsontableModules();

  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[][]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workbookObj, setWorkbookObj] = useState<any | null>(null);
  const [prevYearFile, setPrevYearFile] = useState<File | null>(null);
  const [prevYearFileData, setPrevYearFileData] = useState<any[][]>([]);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState("2025");
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const prevYearFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadFromApi = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SERVICE_URL;
        const url = `${baseUrl}/api/archivo/${id}?raw=true`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`No se pudo obtener el archivo (HTTP ${response.status})`);
        }
        // Detect by content-type to avoid reading response twice for large files
        const contentType = (response.headers.get("content-type") || "").toLowerCase();
        let arrayBuffer: ArrayBuffer;
        if (contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") || contentType.includes("application/octet-stream")) {
          arrayBuffer = await response.arrayBuffer();
        } else {
          const asText = await response.text();
          if (!asText.startsWith("data:")) {
            throw new Error("Respuesta inesperada del servidor (no es binario ni data URL)");
          }
          arrayBuffer = dataUrlToArrayBuffer(asText);
        }
        const XLSX = await ensureXLSX();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        setWorkbookObj(workbook);
        setSheetNames(workbook.SheetNames);
        const firstSheet = workbook.SheetNames[0];
        setSelectedSheet(firstSheet);
        const worksheet = workbook.Sheets[firstSheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        setFileData(jsonData);

        const cd = response.headers.get("content-disposition");
        const filename = extractFilenameFromContentDisposition(cd) || `archivo-${id}.xlsx`;
        setSelectedFileName(filename);
        try {
          const file = new File([arrayBuffer], filename, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
          setSelectedFile(file);
        } catch {
          // File constructor may fail in some environments; ignore.
        }
      } catch (e: any) {
        setError(e?.message || "Error desconocido al cargar el archivo");
      } finally {
        setLoading(false);
      }
    };
    loadFromApi();
  }, [id]);

  const handleSheetChange = async (name: string) => {
    setSelectedSheet(name);
    if (!workbookObj) return;
    try {
      const worksheet = workbookObj.Sheets[name];
      if (!worksheet) return;
      const XLSX = await ensureXLSX();
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      setFileData(jsonData);
    } catch {
      // ignore
    }
  };

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
      } catch {
        // ignore
      }
    }
  };

  // Analyze automatically when both files are present
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
        setAnalysisResults(response.data);
      } catch (err: any) {
        setAnalysisError("No se pudo analizar el presupuesto");
      } finally {
        setAnalysisLoading(false);
      }
    };
    analyze();
  }, [selectedFile, prevYearFile, currentYear]);

  const allChecked = true;

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <div className="flex flex-col flex-1 h-full min-w-0">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-100 mr-4 transition-colors duration-200"
              title="Volver"
            >
              <ArrowLeft size={24} className="text-gray-900" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Armado de Presupuesto</h1>
              <p className="text-gray-600 mt-1">{selectedFileName ? `Editando: ${selectedFileName}` : 'Cargando archivo desde el servidor...'}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col min-h-0">
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <span className="ml-2 text-gray-600">Cargando archivo...</span>
                </div>
              ) : error ? (
                <div className="flex-1 flex items-center justify-center text-red-600 px-4">{error}</div>
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
                      autoWrapRow={false}
                      autoWrapCol={false}
                      contextMenu={false}
                      filters={false}
                      dropdownMenu={false}
                      columnSorting={false}
                      manualRowResize={false}
                      manualColumnResize={false}
                      comments={false}
                      licenseKey="non-commercial-and-evaluation"
                      className="htCenter"
                    />
                  </div>
                  {sheetNames.length > 1 && (
                    <div className="flex gap-2 px-4 pb-4 pt-2 border-t border-gray-200">
                      {sheetNames.map((name) => (
                        <button
                          key={name}
                          onClick={() => handleSheetChange(name)}
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

          <div className="w-[320px] bg-white text-gray-900 h-full flex flex-col border-l border-gray-200">
            <div className="p-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold">Cambios detectados</h3>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4">
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
                <div className="flex flex-col items-center gap-2 mb-3">
                  <button
                    className="px-8 py-2 bg-gray-600 text-white rounded-lg shadow-md text-sm font-semibold hover:bg-gray-700 transition"
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
                  {prevYearFile && <span className="text-green-600 text-xs">Archivo cargado: {prevYearFile.name}</span>}
                </div>
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
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ArmadoFileById />
    </Suspense>
  );
}


