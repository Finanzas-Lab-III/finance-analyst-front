'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import * as XLSX from 'xlsx';
import { useFileContext } from './FileContext';
import 'handsontable/dist/handsontable.full.css';

// Register all Handsontable modules
registerAllModules();

const SpreadsheetViewer: React.FC = () => {
  const { selectedFile, fileData, loading, error } = useFileContext();
  const [data, setData] = useState<any[][]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const hotTableRef = useRef<any>(null);

  const processSheetData = (worksheet: any) => {
    try {
      // Get the range to ensure we capture all data
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      
      // Convert worksheet to JSON with better options
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        range: range,
        defval: '', // Fill empty cells with empty string
        blankrows: true // Include blank rows
      }) as any[][];
      
      // Ensure we have valid data
      if (!jsonData || jsonData.length === 0) {
        return [['']];
      }
      
      // Ensure all rows have the same number of columns
      const maxCols = Math.max(...jsonData.map(row => row ? row.length : 0), range.e.c + 1);
      const normalizedData = jsonData.map(row => {
        if (!row) return new Array(maxCols).fill('');
        const newRow = [...row];
        while (newRow.length < maxCols) {
          newRow.push('');
        }
        return newRow;
      });
      
      // Ensure we have at least one row and column
      if (normalizedData.length === 0) {
        return [['']];
      }
      
      return normalizedData;
    } catch (err) {
      console.error('Error processing sheet data:', err);
      return [['']];
    }
  };

  useEffect(() => {
    const processSpreadsheet = async () => {
      if (!fileData) {
        setData([]);
        setSheetNames([]);
        setSelectedSheet(null);
        return;
      }

      try {
        setProcessing(true);
        setProcessingError(null);
        
        const arrayBuffer = await fileData.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        const names = workbook.SheetNames;
        setSheetNames(names);

        if (names.length > 0) {
          const firstSheetName = names[0];
          setSelectedSheet(firstSheetName);
          const worksheet = workbook.Sheets[firstSheetName];
          const processedData = processSheetData(worksheet);
          setData(processedData);
        } else {
          setData([['']]);
        }
      } catch (err) {
        console.error('Error processing spreadsheet:', err);
        setProcessingError('Failed to process spreadsheet data');
        setData([['']]);
      } finally {
        setProcessing(false);
      }
    };

    processSpreadsheet();
  }, [fileData]);
  
  const handleSheetChange = async (sheetName: string) => {
    if (!fileData || sheetName === selectedSheet) return;

    try {
      setProcessing(true);
      setProcessingError(null);
      setSelectedSheet(sheetName);

      const arrayBuffer = await fileData.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      const worksheet = workbook.Sheets[sheetName];
      const processedData = processSheetData(worksheet);
      setData(processedData);
    } catch (err) {
      console.error(`Error processing sheet ${sheetName}:`, err);
      setProcessingError(`Failed to process sheet: ${sheetName}`);
      setData([['']]);
    } finally {
      setProcessing(false);
    }
  };

  if (!selectedFile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">Select a file to view</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading file</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing spreadsheet...</p>
        </div>
      </div>
    );
  }

  if (processingError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error processing spreadsheet</h3>
            <p className="text-sm text-red-700 mt-1">{processingError}</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate columns for better display - ensure we have valid data
  const numCols = data.length > 0 ? Math.max(...data.map(row => Array.isArray(row) ? row.length : 0)) : 1;
  const numRows = data.length || 1;

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="bg-gray-800 border-b border-gray-600 p-2 flex gap-2 flex-shrink-0">
        <button className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white hover:bg-gray-600">
          Bold
        </button>
        <button className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white hover:bg-gray-600">
          Italic
        </button>
        <button className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white hover:bg-gray-600">
          Underline
        </button>
        <div className="border-l border-gray-600 mx-2"></div>
        <button className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white hover:bg-gray-600">
          Align Left
        </button>
        <button className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white hover:bg-gray-600">
          Align Center
        </button>
        <button className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white hover:bg-gray-600">
          Align Right
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-auto p-2">
        <HotTable
          ref={hotTableRef}
          data={data}
          colHeaders={true}
          rowHeaders={true}
          height="100%"
          width="100%"
          startRows={Math.max(numRows, 10)}
          startCols={Math.max(numCols, 5)}
          stretchH="none"
          colWidths={100}
          autoWrapRow={true}
          autoWrapCol={true}
          contextMenu={true}
          filters={true}
          dropdownMenu={true}
          columnSorting={true}
          manualRowResize={true}
          manualColumnResize={true}
          comments={true}
          allowInsertRow={true}
          allowInsertColumn={true}
          allowRemoveRow={true}
          allowRemoveColumn={true}
          className="htCenter"
        />
      </div>
      {sheetNames.length > 1 && (
        <div className="flex-shrink-0 flex gap-2 px-4 pb-4 pt-2 border-t border-gray-200 bg-white">
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
    </div>
  );
};

export default SpreadsheetViewer; 