'use client';

import React from 'react';
import FileTree from '../../FileTree';
import { useFileContext } from '@/components/FileContext';
import { ResizableSidebar } from '@/components/sidebar/ai-agent-sidebar/components';

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
        <h2 className="text-2xl font-bold mb-10 sticky top-0 px-5 -mx-5">Finance Analyst</h2>
        <div>
          <FileTree onFileSelect={handleFileSelect} />
        </div>
      </div>
    </ResizableSidebar>
  );
};

export default Sidebar; 