# Finance Analyst Frontend

This is a [Next.js](https://nextjs.org) project that provides a web interface for viewing and analyzing Excel files.

## Features

- **File Tree Navigation**: Browse Excel files organized in folders
- **Spreadsheet Viewer**: View Excel files with an interactive spreadsheet interface
- **Real-time File Loading**: Fetch files from a backend API
- **File Size Display**: See file sizes in the file tree
- **Responsive Design**: Works on different screen sizes

## Prerequisites

Before running this application, you need to have the backend servers running. Configure the API URLs in your environment variables (see Environment Configuration section below):

- `GET /excel/files` - Returns the file tree structure
- `GET /excel/file/{filepath}` - Returns the actual Excel file as a blob

### Backend API Response Format

The `/excel/files` endpoint should return data in this format:

```json
{
  "tree": {
    "type": "directory",
    "name": "excel",
    "path": "",
    "files": [
      {
        "filename": "Control_Junio.xlsx",
        "path": "Control_Junio.xlsx",
        "size_bytes": 14007,
        "size_mb": 0.01,
        "type": "excel_file"
      }
    ],
    "folders": [
      {
        "type": "directory",
        "name": "sample",
        "path": "sample",
        "files": [],
        "folders": []
      }
    ]
  },
  "total_excel_files": 4,
  "folder": "excel"
}
```

## Getting Started

1. **Configure Environment Variables**: Copy `.env.example` to `.env.local` and update the URLs as needed
2. **Start the Backend Servers**: Make sure your backend servers are running (see Environment Configuration for URLs)

2. **Install Dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open the Application**: Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Configuration

This application uses environment variables to configure API endpoints. Create a `.env.local` file in the root directory with the following variables:

```env
# API Configuration
NEXT_PUBLIC_SERVICE_URL=http://localhost:8000          # Main AI analysis API
```

Copy `.env.example` to `.env.local` and modify the URLs according to your backend service configuration.

## Usage

1. **Browse Files**: Use the sidebar to navigate through the file tree
2. **Select a File**: Click on any Excel file to load it in the spreadsheet viewer
3. **View Spreadsheet**: The selected file will be displayed in an interactive spreadsheet interface
4. **Refresh**: Use the refresh button (↻) in the file tree to reload the file list

## Project Structure

- `src/components/FileTree.tsx` - File tree navigation component
- `src/components/SpreadsheetViewer.tsx` - Excel file viewer component
- `src/components/fileService.ts` - API service for fetching files
- `src/components/FileContext.tsx` - Context for managing file state
- `src/components/fileSystemData.ts` - TypeScript interfaces for file data

## Technologies Used

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Handsontable** - Spreadsheet viewer
- **XLSX** - Excel file parsing
- **Tailwind CSS** - Styling

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
