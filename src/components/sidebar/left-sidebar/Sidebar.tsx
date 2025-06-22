'use client';

import React from 'react';
import FileTree from '../../FileTree';
import { useFileContext } from '@/components/FileContext';
import { ResizableSidebar } from '@/components/sidebar/ai-agent-sidebar/components';
import { ArrowLeft } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { setSelectedFile } = useFileContext();

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
  };

  return (
    <ResizableSidebar
      defaultWidth={256}
      minWidth={200}
      maxWidth={500}
      position="left"
      className="bg-[#3D3F40] text-white p-5 flex flex-col"
    >
      <div className="flex-grow overflow-y-auto">
        <div className="flex items-center sticky top-0 -mx-5 px-5 py-3 bg-[#3D3F40] z-10">
          <button className="p-1 rounded-full hover:bg-gray-700 mr-4">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-l font-bold">Seguimientos</h2>
        </div>
        <div>
          <FileTree onFileSelect={handleFileSelect} />
        </div>
      </div>
    </ResizableSidebar>
  );
};

export default Sidebar; 