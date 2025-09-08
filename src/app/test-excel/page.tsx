'use client';

import React, { useState } from 'react';
import { fetchFile } from '@/api/fileService';

export default function TestExcelPage() {
  const [status, setStatus] = useState<string>('Ready to test');
  const [error, setError] = useState<string | null>(null);

  const testFetchFile = async () => {
    try {
      setStatus('Testing file fetch...');
      setError(null);
      
      const blob = await fetchFile('excel/2025.xlsx');
      setStatus(`Success! File size: ${blob.size} bytes, type: ${blob.type}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('Failed');
    }
  };

  const testDirectFetch = async () => {
    try {
      setStatus('Testing direct fetch...');
      setError(null);
      
      const response = await fetch('/excel/2025.xlsx');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      setStatus(`Direct fetch success! File size: ${blob.size} bytes, type: ${blob.type}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('Direct fetch failed');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Excel File Loading Test</h1>
      
      <div className="space-y-4">
        <div>
          <button 
            onClick={testFetchFile}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
          >
            Test fetchFile()
          </button>
          
          <button 
            onClick={testDirectFetch}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Test Direct Fetch
          </button>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <p><strong>Status:</strong> {status}</p>
          {error && <p className="text-red-500"><strong>Error:</strong> {error}</p>}
        </div>
      </div>
    </div>
  );
}
