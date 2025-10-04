// Comments Service API - Real Backend Implementation
const BASE_URL = "http://localhost:8000/api/comments";
const USE_MOCK_DATA = true;

export enum DocumentStatus {
  NOT_STARTED = "NOT_STARTED",
  BUDGET_STARTED = "BUDGET_STARTED", 
  NEEDS_CHANGES = "NEEDS_CHANGES",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  BUDGET_APPROVED = "BUDGET_APPROVED",
  FOLLOW_UP_AVAILABLE = "FOLLOW_UP_AVAILABLE"
}

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  document_id: number;
  document_status: DocumentStatus;
  user_name?: string;
  user_email?: string;
  document_metadata?: {
    document_type: string;
    document_title: string;
    document_file_key: string;
    document_notes?: string;
    document_area_year_id: number;
    document_created_at: string;
    document_updated_at: string;
  } | null;
}

export interface CreateCommentRequest {
  content: string;
  user_id: number;
  document_id: number;
  document_status: DocumentStatus;
  user_name?: string;
  user_email?: string;
  // Optional document metadata for tracking comments
  tracking_document_info?: {
    title: string;
    month: string;
    version: string;
    file_key?: string;
    notes?: string;
    area_year_id: number;
    created_at: string;
  };
}

export interface CommentsResponse {
  comments: Comment[];
}

export interface ErrorResponse {
  detail: string;
  errors?: Record<string, any>;
}

export interface DownloadResponse {
  url?: string;
  blob?: Blob;
  filename?: string;
}

// localStorage key for persisting comments
const COMMENTS_STORAGE_KEY = 'mockComments';
const NEXT_ID_STORAGE_KEY = 'nextCommentId';

// Initial mock comments
const initialMockComments: Comment[] = [
  {
    id: 1,
    content: "El presupuesto se ve bien estructurado.",
    created_at: "2024-12-15T10:30:00.000Z",
    updated_at: "2024-12-15T10:30:00.000Z", 
    user_id: 2,
    document_id: 1001,
    document_status: DocumentStatus.PENDING_APPROVAL,
    user_name: "Ana Martínez",
    user_email: "ana.martinez@austral.edu.ar"
    // NO document_metadata - this is a regular comment
  },
  {
    id: 2,
    content: "💬 Comentario de prueba sobre documento específico",
    created_at: "2024-12-15T13:45:00.000Z",
    updated_at: "2024-12-15T13:45:00.000Z", 
    user_id: 1,
    document_id: 1001,
    document_status: DocumentStatus.BUDGET_APPROVED,
    user_name: "Equipo Finanzas",
    user_email: "finanzas@austral.edu.ar",
    document_metadata: {
      document_type: "SEGUIMIENTO",
      document_title: "Seguimiento Marzo 2025 V2",
      document_file_key: "seguimiento_marzo_2025_v2.xlsx",
      document_notes: "Documento de seguimiento mensual actualizado",
      document_area_year_id: 1002,
      document_created_at: "2025-03-15T10:00:00.000Z",
      document_updated_at: "2025-03-15T10:00:00.000Z"
    }
  }
];

// Helper functions for localStorage persistence
function loadCommentsFromStorage(): Comment[] {
  if (typeof window === 'undefined') return [...initialMockComments];
  
  try {
    const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Comment[];
      console.log('📥 Comentarios cargados desde localStorage:', parsed.length);
      return parsed;
    }
  } catch (error) {
    console.warn('⚠️ Error cargando comentarios desde localStorage:', error);
  }
  
  // Si no hay datos guardados, usar los iniciales y guardarlos
  const comments = [...initialMockComments];
  saveCommentsToStorage(comments);
  return comments;
}

function saveCommentsToStorage(comments: Comment[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
    console.log('💾 Comentarios guardados en localStorage:', comments.length);
  } catch (error) {
    console.warn('⚠️ Error guardando comentarios en localStorage:', error);
  }
}

function loadNextIdFromStorage(): number {
  if (typeof window === 'undefined') return 3;
  
  try {
    const stored = localStorage.getItem(NEXT_ID_STORAGE_KEY);
    if (stored) {
      const id = parseInt(stored);
      if (!isNaN(id)) {
        console.log('📥 NextCommentId cargado desde localStorage:', id);
        return id;
      }
    }
  } catch (error) {
    console.warn('⚠️ Error cargando nextCommentId desde localStorage:', error);
  }
  
  return 3; // Default value
}

function saveNextIdToStorage(id: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(NEXT_ID_STORAGE_KEY, id.toString());
    console.log('💾 NextCommentId guardado en localStorage:', id);
  } catch (error) {
    console.warn('⚠️ Error guardando nextCommentId en localStorage:', error);
  }
}

// Load comments and nextId from localStorage or use defaults
let mockComments = loadCommentsFromStorage();
let nextCommentId = loadNextIdFromStorage();

class CommentsService {
  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (url.includes("/health/")) {
        return { status: "ok" } as T;
      }
      
      if (url.includes("/document/") && options?.method !== "POST") {
        console.log('🔧 Mock GET - Returning comments');
        console.log('🔧 Mock GET - mockComments:', mockComments);
        const commentsResponse: CommentsResponse = { comments: [...mockComments] };
        return commentsResponse as T;
      }
      
      if (options?.method === "POST") {
        console.log('🔧 Mock POST - Creating new comment');
        console.log('🔧 Mock POST - nextCommentId before:', nextCommentId);
        const body = JSON.parse(options.body as string) as CreateCommentRequest;
        console.log('🔧 Mock POST - Request body:', JSON.stringify(body, null, 2));
        
        // Detect tracking comment by checking if it starts with the context marker
        // or has been created from monthly context (monthlyContext will add the marker)
        const isTrackingComment = body.content.trim().startsWith('💬') || 
                                 body.content.includes('📋 **Comentario sobre seguimiento mensual');
        
        console.log('🔧 Mock POST - Is tracking comment:', isTrackingComment);
        console.log('🔧 Mock POST - Has tracking document info:', !!body.tracking_document_info);
        
        const newComment: Comment = {
          id: nextCommentId++,
          content: body.content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: body.user_id,
          document_id: body.document_id,
          document_status: body.document_status,
          user_name: body.user_name || "Usuario Actual",
          user_email: body.user_email || "usuario@austral.edu.ar"
        };
        
        // Add metadata only for tracking comments
        if (isTrackingComment) {
          // Use tracking document info if provided, otherwise use generic data
          if (body.tracking_document_info) {
            const trackingInfo = body.tracking_document_info;
            const documentTitle = trackingInfo.title || `Seguimiento ${trackingInfo.month.charAt(0).toUpperCase() + trackingInfo.month.slice(1)} 2025 ${trackingInfo.version}`;
            const fileKey = trackingInfo.file_key || `seguimiento_${trackingInfo.month}_2025_${trackingInfo.version.toLowerCase()}.xlsx`;
            const notes = trackingInfo.notes || `Seguimiento mensual de ${trackingInfo.month} - ${trackingInfo.version}`;
            
            newComment.document_metadata = {
              document_type: "SEGUIMIENTO",
              document_title: documentTitle,
              document_file_key: fileKey,
              document_notes: notes,
              document_area_year_id: trackingInfo.area_year_id,
              document_created_at: trackingInfo.created_at,
              document_updated_at: new Date().toISOString()
            };
            
            console.log('🔧 Mock POST - Using real tracking document info:', {
              title: documentTitle,
              fileKey,
              notes,
              areaYearId: trackingInfo.area_year_id
            });
          } else {
            // Fallback to generic metadata
            newComment.document_metadata = {
              document_type: "SEGUIMIENTO",
              document_title: "Documento de Seguimiento",
              document_file_key: `documento_${body.document_id}.pdf`,
              document_notes: "Documento generado automáticamente",
              document_area_year_id: body.document_id,
              document_created_at: new Date().toISOString(),
              document_updated_at: new Date().toISOString()
            };
          }
        }
        console.log('🔧 Mock POST - Created comment:', newComment);
        console.log('🔧 Mock POST - nextCommentId after:', nextCommentId);
        mockComments.unshift(newComment);
        
        // Save to localStorage
        saveCommentsToStorage(mockComments);
        saveNextIdToStorage(nextCommentId);
        
        return newComment as T;
      }
      
      if (options?.method === "PUT") {
        // URL será algo como "/1/" entonces necesitamos extraer el número
        console.log('🔧 PUT request URL:', url);
        const urlParts = url.split("/").filter(part => part !== "");
        console.log('🔧 URL parts:', urlParts);
        const commentId = parseInt(urlParts[0]);
        console.log('🔧 Parsed commentId:', commentId);
        
        // Validate that commentId is a valid number
        if (isNaN(commentId)) {
          console.log('❌ Invalid commentId:', urlParts[0]);
          throw new Error("ID de comentario inválido");
        }
        
        console.log('🔧 Available comments:', mockComments.map(c => ({ id: c.id, content: c.content.substring(0, 20) + '...' })));
        const body = JSON.parse(options.body as string);
        console.log('🔧 Request body:', body);
        const comment = mockComments.find(c => c.id === commentId);
        if (comment) {
          console.log('🔧 Found comment to update:', comment);
          comment.content = body.content;
          comment.updated_at = new Date().toISOString();
          // Preserve the original user info, but update if new user info is provided
          if (body.user_name) {
            comment.user_name = body.user_name;
          }
          if (body.user_email) {
            comment.user_email = body.user_email;
          }
          console.log('🔧 Updated comment:', comment);
          
          // Save to localStorage
          saveCommentsToStorage(mockComments);
          
          return comment as T;
        }
        console.log('❌ Comment not found for ID:', commentId);
        throw new Error("Comentario no encontrado");
      }
      
      if (options?.method === "DELETE") {
        // URL será algo como "/1/" entonces necesitamos extraer el número
        const urlParts = url.split("/").filter(part => part !== "");
        const commentId = parseInt(urlParts[0]);
        const index = mockComments.findIndex(c => c.id === commentId);
        if (index !== -1) {
          mockComments.splice(index, 1);
          
          // Save to localStorage
          saveCommentsToStorage(mockComments);
          
          return undefined as T;
        }
        throw new Error("Comentario no encontrado");
      }
      
      throw new Error("Mock endpoint not implemented");
    }
    
    // Real API implementation
    const fullUrl = BASE_URL + url;
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options?.headers,
      },
    };

    console.log(`📡 Comments API Request: ${options?.method || 'GET'} ${fullUrl}`);
    if (options?.body) {
      console.log('📦 Request body:', options.body);
    }

    try {
      const response = await fetch(fullUrl, requestOptions);
      
      console.log(`📡 Comments API Response: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        // Try to parse error response
        let errorData: ErrorResponse;
        try {
          errorData = await response.json() as ErrorResponse;
          console.error('❌ API Error Response:', errorData);
        } catch {
          errorData = { 
            detail: `HTTP Error ${response.status}: ${response.statusText}` 
          };
        }
        
        throw new Error(errorData.detail || `HTTP Error ${response.status}`);
      }

      // Handle successful responses
      if (response.status === 204 || options?.method === "DELETE") {
        console.log('✅ Comments API: Delete successful (no content)');
        return undefined as T;
      }

      const data = await response.json();
      console.log('✅ Comments API Response data:', data);
      return data as T;
      
    } catch (error) {
      console.error('❌ Comments API Error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('No se puede conectar con el servidor de comentarios. Verifica que el backend esté ejecutándose en http://localhost:8000');
      }
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión con el servidor');
    }
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>("/health/");
  }

  async createComment(data: CreateCommentRequest): Promise<Comment> {
    return this.request<Comment>("/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getCommentsByDocument(documentId: number): Promise<CommentsResponse> {
    return this.request<CommentsResponse>(`/document/${documentId}/`);
  }

  async updateComment(commentId: number, content: string, userId: number, userName?: string): Promise<Comment> {
    const updateData: any = { 
      content,
      user_id: userId 
    };
    
    // Include user_name if provided to ensure it's preserved
    if (userName) {
      updateData.user_name = userName;
    }
    
    return this.request<Comment>(`/${commentId}/`, {
      method: "PUT", 
      body: JSON.stringify(updateData),
    });
  }

  async deleteComment(commentId: number, userId: number): Promise<void> {
    await this.request<void>(`/${commentId}/`, {
      method: "DELETE",
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async downloadDocument(documentId: number): Promise<DownloadResponse> {
    try {
      const response = await fetch(`http://localhost:8000/api/document/${documentId}/download/`, {
        method: "GET",
        headers: {
          "Accept": "application/octet-stream",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Download failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `document_${documentId}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      return { blob, filename };
    } catch (error) {
      console.error("Download error:", error);
      throw error;
    }
  }

  // Utility method for debugging: clear all stored comments
  clearStoredComments(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(COMMENTS_STORAGE_KEY);
      localStorage.removeItem(NEXT_ID_STORAGE_KEY);
      mockComments.length = 0;
      mockComments.push(...initialMockComments);
      nextCommentId = 3;
      saveCommentsToStorage(mockComments);
      saveNextIdToStorage(nextCommentId);
      console.log('🗑️ Comentarios limpiados y resetdeados a valores iniciales');
    }
  }

  // Utility method for debugging: get current stored comments count
  getStoredCommentsCount(): number {
    return mockComments.length;
  }
}

export const commentsService = new CommentsService();

// Make utility functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).clearStoredComments = () => commentsService.clearStoredComments();
  (window as any).getStoredCommentsCount = () => commentsService.getStoredCommentsCount();
}
