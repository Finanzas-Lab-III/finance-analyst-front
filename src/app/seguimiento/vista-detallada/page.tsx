'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileSpreadsheet, MessageSquare, Bot } from 'lucide-react';
import * as XLSX from 'xlsx';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import AIAgentSidebar from '@/components/sidebar/ai-agent-sidebar/AIAgentSidebar';
import 'handsontable/dist/handsontable.full.css';

// Register all Handsontable modules
registerAllModules();

const SeguimientoDetailedViewContent = () => {
  const searchParams = useSearchParams();
  const documentId = searchParams.get('id');
  const areaYearId = searchParams.get('areaYearId');
  const fileName = searchParams.get('fileName');
  const subarea = searchParams.get('subarea');

  // Local state for Excel data
  const [data, setData] = useState<any[][]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Excel file
  useEffect(() => {
    const loadExcelFile = async () => {
      if (!fileName) return;

      try {
        setLoading(true);
        setError(null);

        // Decode the URL-encoded fileName
        const decodedFileName = decodeURIComponent(fileName);
        
        // Build the file path
        let filePath = '';
        if (decodedFileName.startsWith('excel/')) {
          filePath = `/${decodedFileName}`;
        } else if (decodedFileName.startsWith('data/')) {
          filePath = `/${decodedFileName}`;
        } else if (decodedFileName.endsWith('.xlsx') || decodedFileName.endsWith('.XLSX')) {
          // Check if it might be in the data directory first
          if (decodedFileName.includes('FCB') || decodedFileName.includes('BIOTERIO') || decodedFileName.includes('En-Abr')) {
            filePath = `/data/2025/${decodedFileName}`;
          } else {
            filePath = `/excel/${decodedFileName}`;
          }
        } else {
          // Default to budget file for seguimientos
          filePath = '/data/2025/05- FCB BIOTERIO 3+9.xlsx';
        }

        // Fetch the Excel file
        const response = await fetch(filePath, {
          method: 'GET',
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        const names = workbook.SheetNames;
        if (!names || names.length === 0) {
          throw new Error('No sheets found in Excel file');
        }
        
        setSheetNames(names);

        const firstSheetName = names[0];
        setSelectedSheet(firstSheetName);
        const worksheet = workbook.Sheets[firstSheetName];
        
        if (!worksheet) {
          throw new Error('Sheet not found in Excel file');
        }

        // Process sheet data with better error handling
        try {
          // Get all data from the worksheet
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '', // Fill empty cells with empty string
            blankrows: true // Include blank rows
          }) as any[][];
          
          // Ensure we have valid data
          if (!Array.isArray(jsonData) || jsonData.length === 0) {
            setData([['No data found in Excel file']]);
            return;
          }
          
          // Process the data to ensure consistency
          const processedData = jsonData.map(row => {
            if (!Array.isArray(row)) return [''];
            return row.map(cell => cell == null ? '' : String(cell));
          });
          
          setData(processedData);
        } catch (processingError) {
          console.error('Error processing sheet data:', processingError);
          // Set basic data as fallback
          setData([['Error processing Excel data: ' + (processingError instanceof Error ? processingError.message : 'Unknown error')]]);
        }
      } catch (err) {
        console.error('Error loading Excel file:', err);
        setError(err instanceof Error ? err.message : 'Failed to load file');
        setData([['']]);
      } finally {
        setLoading(false);
      }
    };

    loadExcelFile();
  }, [fileName]);

  if (!documentId || !areaYearId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Seguimiento no encontrado</h1>
          <Link
            href="/backoffice"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al portal
          </Link>
        </div>
      </div>
    );
  }

  // Format subarea display name
  const getSubareaDisplayName = (subarea: string) => {
    const subareaNames: Record<string, string> = {
      '3plus9': 'Trimestral (3+9)',
      '6plus6': 'Semestral (6+6)', 
      '9plus3': 'Avanzado (9+3)',
      'enero': 'Enero',
      'febrero': 'Febrero',
      'marzo': 'Marzo',
      'abril': 'Abril',
      'mayo': 'Mayo',
      'junio': 'Junio',
      'julio': 'Julio',
      'agosto': 'Agosto',
      'septiembre': 'Septiembre',
      'octubre': 'Octubre',
      'noviembre': 'Noviembre',
      'diciembre': 'Diciembre',
      'general': 'General'
    };
    return subareaNames[subarea || 'general'] || subarea || 'General';
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="flex h-screen overflow-hidden">
        <div className="flex flex-col flex-1 h-full min-w-0">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Link
                  href={`/backoffice/faculty-data/${areaYearId}`}
                  className="p-2 rounded-full hover:bg-gray-100 mr-4 transition-colors duration-200"
                >
                  <ArrowLeft size={24} className="text-gray-900" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Vista Detallada del Seguimiento</h1>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <FileSpreadsheet size={14} className="mr-1" />
                    <span>{fileName || `Seguimiento ${getSubareaDisplayName(subarea || 'general')}`}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comentarios
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Bot className="h-4 w-4 mr-2" />
                  Consultar IA
                </button>
              </div>
            </div>

            {/* Breadcrumb and File Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tipo de Seguimiento</p>
                  <p className="font-semibold text-gray-900">{getSubareaDisplayName(subarea || 'general')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 bg-green-100 text-green-800">
                    Disponible
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha de Carga</p>
                  <p className="font-semibold text-gray-900">{new Date().toLocaleDateString('es-AR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Archivo</p>
                  <p className="font-semibold text-gray-900 truncate" title={fileName || 'N/A'}>
                    {fileName ? fileName.split('/').pop() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Spreadsheet Viewer */}
          <div className="flex-1 p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-hidden">
              {loading && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando archivo Excel...</p>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
                  <div className="flex items-center mb-4">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error cargando archivo</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {!loading && !error && (
                <div className="h-full">
                  {/* Sheet Tabs */}
                  {sheetNames.length > 1 && (
                    <div className="border-b border-gray-200 px-4 py-2">
                      <div className="flex space-x-1">
                        {sheetNames.map((sheetName) => (
                          <button
                            key={sheetName}
                            onClick={() => setSelectedSheet(sheetName)}
                            className={`px-3 py-1 text-sm rounded-t-lg border-b-2 transition-colors ${
                              selectedSheet === sheetName
                                ? 'border-blue-500 text-blue-600 bg-blue-50'
                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            {sheetName}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Spreadsheet */}
                  <div className="h-full p-4">
                    {data.length > 0 && (
                      <HotTable
                        data={data}
                        colHeaders={true}
                        rowHeaders={true}
                        width="100%"
                        height="100%"
                        licenseKey="non-commercial-and-evaluation"
                        readOnly={true}
                        contextMenu={false}
                        fillHandle={false}
                        outsideClickDeselects={false}
                        stretchH="all"
                        columnSorting={true}
                        filters={true}
                        dropdownMenu={true}
                        manualColumnResize={true}
                        manualRowResize={true}
                        wordWrap={false}
                        autoWrapRow={false}
                        autoWrapCol={false}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Agent Sidebar */}
        <AIAgentSidebar />
      </div>
    </main>
  );
};

const LoadingSeguimientoDetails = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Cargando detalles del seguimiento...</p>
    </div>
  </div>
);

const SeguimientoDetailedViewPage = () => {
  return (
    <Suspense fallback={<LoadingSeguimientoDetails />}>
      <SeguimientoDetailedViewContent />
    </Suspense>
  );
};

export default SeguimientoDetailedViewPage;
