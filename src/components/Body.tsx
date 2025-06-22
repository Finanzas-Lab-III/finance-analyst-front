'use client';

import React from 'react';
import { useFileContext } from '@/components/FileContext';
import SpreadsheetViewer from '@/components/SpreadsheetViewer';

const Body: React.FC = () => {
  const { selectedFile } = useFileContext();

  if (!selectedFile) {
    return (
      <div className="p-6 flex-1 flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <h1 className="text-3xl font-bold mb-4">Welcome to Finance Analyst</h1>
          <p className="text-lg">Select a file from the sidebar to view its contents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2 text-white">Spreadsheet Viewer</h1>
        <p className="text-gray-400 text-sm">Currently viewing: {selectedFile}</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm flex-grow overflow-auto">
        <SpreadsheetViewer />
      </div>
    </div>
  );
};

export default Body; 