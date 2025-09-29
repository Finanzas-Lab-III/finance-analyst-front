import { ApiResponse, FileSystemNode } from './fileSystemData';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVICE_URL;

export const fetchFileTree = async (): Promise<FileSystemNode[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/excel/files`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ApiResponse = await response.json();
    return convertApiResponseToFileSystemNodes(data.tree);
  } catch (error) {
    console.error('Error fetching file tree:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check if the backend is running.');
    }
    throw error;
  }
};

export const fetchFile = async (filePath: string): Promise<Blob> => {
  try {
    // Handle public Excel files (served from Next.js public folder)
    if (filePath.startsWith('excel/') || filePath.includes('2023.xlsx') || filePath.includes('2024.xlsx') || filePath.includes('2025.xlsx')) {
      const publicPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
      
      const response = await fetch(publicPath, {
        method: 'GET',
        cache: 'no-store' // Ensure we get fresh data
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      
      return await response.blob();
    }
    
    // Handle backend files (original behavior)
    const response = await fetch(`${API_BASE_URL}/excel/file/${encodeURIComponent(filePath)}`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Error fetching file:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check if the backend is running.');
    }
    throw error;
  }
};

const convertApiResponseToFileSystemNodes = (apiFolder: any): FileSystemNode[] => {
  const nodes: FileSystemNode[] = [];
  
  // Add files
  if (apiFolder.files) {
    apiFolder.files.forEach((file: any) => {
      nodes.push({
        name: file.filename,
        type: 'excel_file',
        path: file.path,
        filename: file.filename,
        size_bytes: file.size_bytes,
        size_mb: file.size_mb,
      });
    });
  }
  
  // Add folders
  if (apiFolder.folders) {
    apiFolder.folders.forEach((folder: any) => {
      nodes.push({
        name: folder.name,
        type: 'directory',
        path: folder.path,
        children: convertApiResponseToFileSystemNodes(folder),
      });
    });
  }
  
  return nodes;
}; 