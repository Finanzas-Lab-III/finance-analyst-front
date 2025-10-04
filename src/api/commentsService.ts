// Comments Service API - Real Backend Implementation
const BASE_URL = "http://localhost:8000/api/comments";
const USE_MOCK_DATA = false;

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
}

export interface CreateCommentRequest {
  content: string;
  user_id: number;
  document_id: number;
  document_status: DocumentStatus;
  user_name?: string;
  user_email?: string;
}

export interface CommentsResponse {
  comments: Comment[];
}

export interface ErrorResponse {
  detail: string;
  errors?: Record<string, any>;
}

const mockComments: Comment[] = [
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
  }
];

let nextCommentId = 2;

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
        console.log('🔧 Mock POST - Created comment:', newComment);
        console.log('🔧 Mock POST - nextCommentId after:', nextCommentId);
        mockComments.unshift(newComment);
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
}

export const commentsService = new CommentsService();
