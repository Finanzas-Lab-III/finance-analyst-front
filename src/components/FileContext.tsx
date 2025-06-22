'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { fetchFile } from '../api/fileService';

interface FileContextType {
  selectedFile: string | undefined;
  setSelectedFile: (filePath: string | undefined) => void;
  fileData: Blob | null;
  loading: boolean;
  error: string | null;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const useFileContext = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
};

interface FileProviderProps {
  children: ReactNode;
}

export const FileProvider: React.FC<FileProviderProps> = ({ children }) => {
  const [selectedFile, setSelectedFileState] = useState<string | undefined>();
  const [fileData, setFileData] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setSelectedFile = async (filePath: string | undefined) => {
    setSelectedFileState(filePath);
    setFileData(null);
    setError(null);

    if (filePath) {
      try {
        setLoading(true);
        const blob = await fetchFile(filePath);
        setFileData(blob);
      } catch (err) {
        setError('Failed to load file');
        console.error('Error loading file:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <FileContext.Provider value={{ selectedFile, setSelectedFile, fileData, loading, error }}>
      {children}
    </FileContext.Provider>
  );
}; 