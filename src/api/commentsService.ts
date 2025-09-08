// Comments Service API - Mock Implementation
const BASE_URL = "http://localhost:8000/api/comments"\;
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
}

export interface CreateCommentRequest {
  content: string;
  user_id: number;
  document_id: number;
  document_status: DocumentStatus;
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
        const commentsResponse: CommentsResponse = { comments: [...mockComments] };
        return commentsResponse as T;
      }
      
      if (options?.method === "POST") {
        const body = JSON.parse(options.body as string) as CreateCommentRequest;
        const newComment: Comment = {
          id: nextCommentId++,
          content: body.content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: body.user_id,
          document_id: body.document_id,
          document_status: body.document_status,
          user_name: "Usuario Actual",
          user_email: "usuario@austral.edu.ar"
        };
        mockComments.unshift(newComment);
        return newComment as T;
      }
      
      if (options?.method === "PUT") {
        const commentId = parseInt(url.split("/")[1]);
        const body = JSON.parse(options.body as string);
        const comment = mockComments.find(c => c.id === commentId);
        if (comment) {
          comment.content = body.content;
          comment.updated_at = new Date().toISOString();
          return comment as T;
        }
        throw new Error("Comentario no encontrado");
      }
      
      if (options?.method === "DELETE") {
        const commentId = parseInt(url.split("/")[1]);
        const index = mockComments.findIndex(c => c.id === commentId);
        if (index !== -1) {
          mockComments.splice(index, 1);
          return undefined as T;
        }
        throw new Error("Comentario no encontrado");
      }
      
      throw new Error("Mock endpoint not implemented");
    }
    
    throw new Error("Real API not implemented");
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

  async updateComment(commentId: number, content: string): Promise<Comment> {
    return this.request<Comment>(`/${commentId}/`, {
      method: "PUT", 
      body: JSON.stringify({ content }),
    });
  }

  async deleteComment(commentId: number): Promise<void> {
    await this.request<void>(`/${commentId}/`, {
      method: "DELETE",
    });
  }
}

export const commentsService = new CommentsService();
