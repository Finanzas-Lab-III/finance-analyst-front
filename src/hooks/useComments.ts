import { useState, useEffect, useCallback } from 'react';
import { commentsService, Comment, DocumentStatus, CreateCommentRequest } from '@/api/commentsService';

interface UseCommentsOptions {
  documentId: number;
  documentStatus: DocumentStatus;
  currentUserId: number;
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

export function useComments({ documentId, documentStatus, currentUserId }: UseCommentsOptions): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await commentsService.getCommentsByDocument(documentId, true);
      setComments(response.comments.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading comments';
      setError(errorMessage);
      console.error('Error fetching comments:', err);
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
      const newCommentData: CreateCommentRequest = {
        content: content.trim(),
        user_id: currentUserId,
        document_id: documentId,
        document_status: documentStatus,
      };

      const newComment = await commentsService.createComment(newCommentData);
      
      // Add the new comment to the beginning of the list (most recent first)
      setComments(prev => [newComment, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating comment';
      setError(errorMessage);
      throw err;
    }
  }, [documentId, documentStatus, currentUserId]);

  const updateComment = useCallback(async (commentId: number, content: string) => {
    if (!content.trim()) {
      throw new Error('El contenido del comentario no puede estar vacío');
    }

    if (content.length > 1000) {
      throw new Error('El comentario no puede exceder los 1000 caracteres');
    }

    try {
      const updatedComment = await commentsService.updateComment(commentId, content.trim());
      
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
  }, []);

  const deleteComment = useCallback(async (commentId: number) => {
    try {
      await commentsService.deleteComment(commentId);
      
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting comment';
      setError(errorMessage);
      throw err;
    }
  }, []);

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
