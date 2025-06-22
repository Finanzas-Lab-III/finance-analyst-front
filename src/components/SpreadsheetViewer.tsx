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
  const [processing, setProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const hotTableRef = useRef<any>(null);

  useEffect(() => {
    const processSpreadsheet = async () => {
      if (!fileData) {
        setData([]);
        return;
      }

      try {
        setProcessing(true);
        setProcessingError(null);
        
        // Convert blob to array buffer
        const arrayBuffer = await fileData.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert worksheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        setData(jsonData);
      } catch (err) {
        console.error('Error processing spreadsheet:', err);
        setProcessingError('Failed to process spreadsheet data');
      } finally {
        setProcessing(false);
      }
    };

    processSpreadsheet();
  }, [fileData]);

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

  return (
    <div className="h-full overflow-hidden">
      <div className="bg-gray-800 border-b border-gray-600 p-2 flex gap-2">
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
      <HotTable
        ref={hotTableRef}
        data={data}
        colHeaders={true}
        rowHeaders={true}
        height="calc(100% - 40px)"
        width="100%"
        minRows={data.length}
        maxRows={data.length}
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
  );
};

export default SpreadsheetViewer; 