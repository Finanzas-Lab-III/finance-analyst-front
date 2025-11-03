// Comments Service API - Configurable Implementation
const BASE_URL = `${process.env.NEXT_PUBLIC_SERVICE_URL || 'http://localhost:8000'}/api/comments`;
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_COMMENTS === 'true';

export enum DocumentStatus {
  NOT_STARTED = "NOT_STARTED",
  BUDGET_STARTED = "BUDGET_STARTED", 
  NEEDS_CHANGES = "NEEDS_CHANGES",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  BUDGET_APPROVED = "BUDGET_APPROVED",
  FOLLOW_UP_AVAILABLE = "FOLLOW_UP_AVAILABLE"
}

export interface MonthlyContext {
  month: string;
  version: string;
  created_at: string;
  documentId: number;
  title?: string;
  fileKey?: string;
  notes?: string;
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
  monthly_context?: MonthlyContext;
}

export interface CreateCommentRequest {
  content: string;
  user_id: number;
  document_id: number;
  document_status: DocumentStatus;
  user_name?: string;
  user_email?: string;
  monthly_context?: MonthlyContext;
}

export interface CommentsResponse {
  comments: Comment[];
}

export interface ErrorResponse {
  detail: string;
  errors?: Record<string, any>;
}

// LocalStorage keys for persistence
const MOCK_COMMENTS_KEY = 'finance_app_mock_comments';
const NEXT_COMMENT_ID_KEY = 'finance_app_next_comment_id';

// Default mock comments
const defaultMockComments: Comment[] = [
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
  },
  {
    id: 2,
    content: "📋 **Comentario sobre seguimiento mensual de Enero**\n🗓️ Documento: V2 (01/12/2024)\n\n💬 Revisé el seguimiento de enero, los gastos están controlados. Todo va según lo planificado.",
    created_at: "2024-12-15T14:45:00.000Z",
    updated_at: "2024-12-15T14:45:00.000Z",
    user_id: 3,
    document_id: 1002,
    document_status: DocumentStatus.BUDGET_APPROVED,
    user_name: "Carlos González",
    user_email: "carlos.gonzalez@austral.edu.ar",
    monthly_context: {
      month: "enero",
      version: "V2",
      created_at: "2024-12-01T10:00:00Z",
      documentId: 789,
      title: "Seguimiento Enero V2",
      fileKey: "123/seguimiento/enero/enero_v2.xlsx",
      notes: "Datos actualizados con correcciones"
    }
  },
  {
    id: 3,
    content: "Los números del segundo trimestre necesitan revisión.",
    created_at: "2024-12-16T09:15:00.000Z",
    updated_at: "2024-12-16T09:15:00.000Z",
    user_id: 1,
    document_id: 1001,
    document_status: DocumentStatus.NEEDS_CHANGES,
    user_name: "Test User",
    user_email: "test.user@austral.edu.ar"
  },
  {
    id: 4,
    content: "📋 **Comentario sobre seguimiento mensual de Febrero**\n🗓️ Documento: V1 (05/12/2024)\n\n💬 Los gastos de febrero muestran una desviación del 5% respecto al presupuesto aprobado. Necesitamos ajustar las proyecciones.",
    created_at: "2024-12-16T11:20:00.000Z",
    updated_at: "2024-12-16T11:20:00.000Z",
    user_id: 2,
    document_id: 1002,
    document_status: DocumentStatus.BUDGET_APPROVED,
    user_name: "Ana Martínez",
    user_email: "ana.martinez@austral.edu.ar",
    monthly_context: {
      month: "febrero",
      version: "V1",
      created_at: "2024-12-05T15:00:00Z",
      documentId: 790,
      title: "Seguimiento Febrero V1",
      fileKey: "123/seguimiento/febrero/febrero_v1.xlsx",
      notes: "Primer reporte del mes"
    }
  },
  {
    id: 5,
    content: "Comentario general sobre el documento sin contexto mensual específico.",
    created_at: "2024-12-16T16:00:00.000Z",
    updated_at: "2024-12-16T16:00:00.000Z",
    user_id: 1,
    document_id: 1002,
    document_status: DocumentStatus.BUDGET_APPROVED,
    user_name: "Test User",
    user_email: "test.user@austral.edu.ar"
  }
];

// Mock data persistence functions
function getMockComments(): Comment[] {
  if (typeof window === 'undefined') return defaultMockComments;
  
  try {
    const stored = localStorage.getItem(MOCK_COMMENTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Error loading mock comments from localStorage:', error);
  }
  
  // If no stored comments, initialize with defaults
  saveMockComments(defaultMockComments);
  return defaultMockComments;
}

function saveMockComments(comments: Comment[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(MOCK_COMMENTS_KEY, JSON.stringify(comments));
  } catch (error) {
    console.warn('Error saving mock comments to localStorage:', error);
  }
}

function getNextCommentId(): number {
  if (typeof window === 'undefined') return 6;
  
  try {
    const stored = localStorage.getItem(NEXT_COMMENT_ID_KEY);
    if (stored) {
      return parseInt(stored, 10);
    }
  } catch (error) {
    console.warn('Error loading next comment ID from localStorage:', error);
  }
  
  // Default starting ID
  const defaultId = 6;
  setNextCommentId(defaultId);
  return defaultId;
}

function setNextCommentId(id: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(NEXT_COMMENT_ID_KEY, id.toString());
  } catch (error) {
    console.warn('Error saving next comment ID to localStorage:', error);
  }
}

// Utility function to clear mock data (for testing/debugging)
export function clearMockComments(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(MOCK_COMMENTS_KEY);
    localStorage.removeItem(NEXT_COMMENT_ID_KEY);
    console.log('Mock comments data cleared from localStorage');
  } catch (error) {
    console.warn('Error clearing mock comments data:', error);
  }
}

// Utility function to reset mock data to defaults
export function resetMockCommentsToDefaults(): void {
  if (typeof window === 'undefined') return;
  
  try {
    saveMockComments(defaultMockComments);
    setNextCommentId(6);
    console.log('Mock comments reset to default data');
  } catch (error) {
    console.warn('Error resetting mock comments:', error);
  }
}

class CommentsService {
  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (url.includes("/health/")) {
        return { status: "ok" } as T;
      }
      
      if (url.includes("/document/") && options?.method !== "POST") {
        const pathParts = url.split('/');
        const documentId = parseInt(pathParts[pathParts.indexOf('document') + 1]);
        
        // Get current mock comments from localStorage
        const mockComments = getMockComments();
        
        // Filter comments by document ID and add some specific to this document if none exist
        let filteredComments = mockComments.filter((c: Comment) => c.document_id === documentId);
        
        // If no comments exist for this document, add some sample ones
        if (filteredComments.length === 0 && documentId) {
          const sampleComments: Comment[] = [
            {
              id: 1000 + documentId,
              content: `Revisión inicial del presupuesto para el documento ${documentId}. Los números se ven bien estructurados.`,
              created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              updated_at: new Date(Date.now() - 86400000).toISOString(),
              user_id: 2,
              document_id: documentId,
              document_status: DocumentStatus.PENDING_APPROVAL,
              user_name: "Ana Martínez",
              user_email: "ana.martinez@austral.edu.ar"
            },
            {
              id: 2000 + documentId,
              content: `📋 **Comentario sobre seguimiento mensual**\n🗓️ Documento: V1 (${new Date().toLocaleDateString('es-AR')})\n\n💬 Análisis detallado completado. Los gastos están dentro del rango esperado.`,
              created_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
              updated_at: new Date(Date.now() - 43200000).toISOString(),
              user_id: 3,
              document_id: documentId,
              document_status: DocumentStatus.BUDGET_APPROVED,
              user_name: "Carlos González",
              user_email: "carlos.gonzalez@austral.edu.ar",
              monthly_context: {
                month: "noviembre",
                version: "V1",
                created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
                documentId: documentId,
                title: `Seguimiento Noviembre V1 - Documento ${documentId}`,
                fileKey: `${documentId}/seguimiento/noviembre/noviembre_v1.xlsx`,
                notes: "Análisis mensual actualizado"
              }
            }
          ];
          
          // Add these sample comments to the mock data and persist
          const updatedComments = [...mockComments, ...sampleComments];
          saveMockComments(updatedComments);
          filteredComments = sampleComments;
        }
        
        const commentsResponse: CommentsResponse = { 
          comments: filteredComments.sort((a: Comment, b: Comment) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        };
        return commentsResponse as T;
      }
      
      if (options?.method === "POST") {
        const body = JSON.parse(options.body as string) as CreateCommentRequest;
        const currentComments = getMockComments();
        const nextId = getNextCommentId();
        
        const newComment: Comment = {
          id: nextId,
          content: body.content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: body.user_id,
          document_id: body.document_id,
          document_status: body.document_status,
          user_name: body.user_name || "Usuario Actual",
          user_email: body.user_email || "usuario@austral.edu.ar",
          monthly_context: body.monthly_context // Preservar contexto mensual
        };
        
        const updatedComments = [newComment, ...currentComments];
        saveMockComments(updatedComments);
        setNextCommentId(nextId + 1);
        
        return newComment as T;
      }
      
      if (options?.method === "PUT") {
        const commentId = parseInt(url.split("/")[1]);
        const body = JSON.parse(options.body as string);
        const currentComments = getMockComments();
        const comment = currentComments.find((c: Comment) => c.id === commentId);
        
        if (comment) {
          comment.content = body.content;
          comment.updated_at = new Date().toISOString();
          saveMockComments(currentComments);
          return comment as T;
        }
        throw new Error("Comentario no encontrado");
      }
      
      if (options?.method === "DELETE") {
        const commentId = parseInt(url.split("/")[1]);
        const currentComments = getMockComments();
        const index = currentComments.findIndex((c: Comment) => c.id === commentId);
        
        if (index !== -1) {
          currentComments.splice(index, 1);
          saveMockComments(currentComments);
          return undefined as T;
        }
        throw new Error("Comentario no encontrado");
      }
      
      throw new Error("Mock endpoint not implemented");
    }
    
    // Real API implementation
    const fullUrl = `${BASE_URL}${url}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(fullUrl, config);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.errors) {
            errorMessage = Object.values(errorData.errors).flat().join(', ');
          }
        } catch {
          // Si no podemos parsear el error como JSON, usar el mensaje HTTP
        }
        
        throw new Error(errorMessage);
      }

      // Para DELETE requests que retornan 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de red al conectar con el servidor');
    }
  }

  async createComment(data: CreateCommentRequest): Promise<Comment> {
    return this.request<Comment>("/", {
      method: "POST",
      body: JSON.stringify({
        content: data.content,
        user_id: data.user_id,
        document_id: data.document_id,
        document_status: data.document_status,
        user_name: data.user_name,
        user_email: data.user_email,
        monthly_context: data.monthly_context,
      }),
    });
  }

  async getCommentsByDocument(documentId: number): Promise<CommentsResponse> {
    return this.request<CommentsResponse>(`/document/${documentId}/`);
  }

  async updateComment(commentId: number, content: string, userId: number): Promise<Comment> {
    return this.request<Comment>(`/${commentId}/`, {
      method: "PUT", 
      body: JSON.stringify({ 
        content,
        user_id: userId 
      }),
    });
  }

  async deleteComment(commentId: number, userId: number): Promise<void> {
    await this.request<void>(`/${commentId}/`, {
      method: "DELETE",
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>("/health/");
  }
}

export const commentsService = new CommentsService();
