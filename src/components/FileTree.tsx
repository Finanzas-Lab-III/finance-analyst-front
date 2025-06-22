'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FileSystemNode } from '@/api/fileSystemData';
import { fetchFileTree } from '@/api/fileService';

interface FileTreeProps {
  onFileSelect?: (filePath: string) => void;
}

const FileOrFolder = ({ node, onFileSelect }: { node: FileSystemNode; onFileSelect?: (filePath: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = node.type === 'folder' || node.type === 'directory';

  const handleToggle = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else if (node.path && onFileSelect) {
      onFileSelect(node.path);
    }
  };

  return (
    <div>
      <div
        className="flex items-center cursor-pointer hover:bg-gray-700 rounded p-1 select-none"
        onClick={handleToggle}
      >
        {isFolder ? (
          <span className="w-4 mr-2">{isOpen ? '▼' : '►'}</span>
        ) : (
          <Image
            src="/Microsoft_Office_Excel_2019.png"
            alt="Excel file"
            width={16}
            height={16}
            className="mr-2"
          />
        )}
        <span>{node.name}</span>
      </div>
      {isFolder && isOpen && node.children && (
        <div className="ml-4">
          {node.children.map((childNode: FileSystemNode, index: number) => (
            <FileOrFolder key={index} node={childNode} onFileSelect={onFileSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTree: React.FC<FileTreeProps> = ({ onFileSelect }) => {
  const [nodes, setNodes] = useState<FileSystemNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFileTree = async () => {
    try {
      setLoading(true);
      setError(null);
      const fileTreeData = await fetchFileTree();
      setNodes(fileTreeData);
    } catch (err) {
      setError('Failed to load file tree');
      console.error('Error loading file tree:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFileTree();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        <span className="ml-2">Loading files...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 p-4 text-center">
        {error}
        <button 
          onClick={loadFileTree} 
          className="block mt-2 text-blue-400 hover:text-blue-300"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">Files</h3>
        <button 
          onClick={loadFileTree}
          className="text-xs text-blue-400 hover:text-blue-300"
          title="Refresh file list"
        >
          ↻
        </button>
      </div>
      {nodes.map((node: FileSystemNode, index: number) => (
        <FileOrFolder key={index} node={node} onFileSelect={onFileSelect} />
      ))}
    </div>
  );
};

export default FileTree; 