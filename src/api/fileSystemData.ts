export interface FileSystemNode {
  name: string;
  type: 'folder' | 'file' | 'directory' | 'excel_file';
  children?: FileSystemNode[];
  path?: string;
  filename?: string;
  size_bytes?: number;
  size_mb?: number;
  files?: FileSystemNode[];
  folders?: FileSystemNode[];
}

export interface ApiFile {
  filename: string;
  path: string;
  size_bytes: number;
  size_mb: number;
  type: 'excel_file';
}

export interface ApiFolder {
  type: 'directory';
  name: string;
  path: string;
  files: ApiFile[];
  folders: ApiFolder[];
}

export interface ApiResponse {
  tree: ApiFolder;
  total_excel_files: number;
  folder: string;
}

export const fileSystemData: FileSystemNode[] = [
  {
    name: 'data',
    type: 'folder',
    path: 'data',
    children: [
      {
        name: '2024',
        type: 'folder',
        path: 'data/2024',
        children: [
          { name: 'En-Abr.XLSX', type: 'file', path: 'data/2024/En-Abr.XLSX' },
        ]
      }
    ],
  },
]; 