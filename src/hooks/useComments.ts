import { useState, useEffect, useCallback } from 'react';
import { commentsService, Comment, DocumentStatus, CreateCommentRequest } from '@/api/commentsService';

interface UseCommentsOptions {
  documentId: number;
  documentStatus: DocumentStatus;
  currentUserId: number;
  currentUserName: string;
  currentUserEmail?: string;
  monthlyContext?: {
    month: string;
    version: string;
    createdAt: string;
    documentId: number;
    title?: string;
    fileKey?: string;
    notes?: string;
  } | null;
}

interface UseCommentsReturn {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  createComment: (content: string) => Promise<void>;
  updateComment: (commentId: number, content: string) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useComments({ documentId, documentStatus, currentUserId, currentUserName, currentUserEmail, monthlyContext }: UseCommentsOptions): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Cargando comentarios para documento ${documentId}...`);
      const response = await commentsService.getCommentsByDocument(documentId);
      console.log(`✅ Comentarios cargados: ${response.comments.length} comentarios`);
      
      const sortedComments = response.comments.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setComments(sortedComments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading comments';
      console.error('❌ Error fetching comments:', err);
      setError(errorMessage);
      // Don't clear existing comments on error, just set the error
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  const createComment = useCallback(async (content: string) => {
    if (!content.trim()) {
      throw new Error('El contenido del comentario no puede estar vacío');
    }

    if (content.length > 1000) {
      throw new Error('El comentario no puede exceder los 1000 caracteres');
    }

    try {
      console.log(`➕ Creando comentario para documento ${documentId}...`);
      console.log('👤 Usuario:', currentUserName, '(ID:', currentUserId, ')');
      
      const newCommentData: CreateCommentRequest = {
        content: content.trim(),
        user_id: currentUserId,
        document_id: documentId,
        document_status: documentStatus,
        user_name: currentUserName,
        user_email: currentUserEmail,
      };

      // Add tracking document info if this is a tracking comment with monthly context
      const isTrackingComment = content.trim().startsWith('💬') || 
                               content.includes('📋 **Comentario sobre seguimiento mensual');
      
      if (isTrackingComment && monthlyContext) {
        // Generate appropriate description based on the month and version
        const monthName = monthlyContext.month.charAt(0).toUpperCase() + monthlyContext.month.slice(1);
        const documentDescription = `Seguimiento mensual de ${monthName} 2025 (${monthlyContext.version})`;
        
        newCommentData.tracking_document_info = {
          title: monthlyContext.title || `Seguimiento ${monthName} 2025`,
          month: monthlyContext.month,
          version: monthlyContext.version,
          file_key: monthlyContext.fileKey || undefined,
          notes: documentDescription, // Use generated description instead of raw document notes
          area_year_id: documentId, // Using document ID as area_year_id for now
          created_at: monthlyContext.createdAt
        };
      }

      console.log('📦 Datos del comentario a enviar:', newCommentData);

      const newComment = await commentsService.createComment(newCommentData);
      console.log('✅ Comentario creado exitosamente:', newComment);
      
      // Add the new comment to the beginning of the list (most recent first)
      setComments(prev => [newComment, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating comment';
      console.error('❌ Error creating comment:', err);
      setError(errorMessage);
      throw err;
    }
  }, [documentId, documentStatus, currentUserId, currentUserName, currentUserEmail, monthlyContext]);

  const updateComment = useCallback(async (commentId: number, content: string) => {
    if (!content.trim()) {
      throw new Error('El contenido del comentario no puede estar vacío');
    }

    if (content.length > 1000) {
      throw new Error('El comentario no puede exceder los 1000 caracteres');
    }

    try {
      const updatedComment = await commentsService.updateComment(commentId, content.trim(), currentUserId, currentUserName);
      
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId ? updatedComment : comment
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating comment';
      setError(errorMessage);
      throw err;
    }
  }, [currentUserId, currentUserName]);

  const deleteComment = useCallback(async (commentId: number) => {
    try {
      await commentsService.deleteComment(commentId, currentUserId);
      
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting comment';
      setError(errorMessage);
      throw err;
    }
  }, [currentUserId]);

  const refresh = useCallback(async () => {
    await fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    error,
    createComment,
    updateComment,
    deleteComment,
    refresh,
  };
}
