"use client"
import React, { useState, useEffect } from "react";
import { MessageSquare, Send, Edit2, Trash2, AlertCircle, User, Clock, CheckCircle, XCircle, Loader2, FileText, Calendar, X } from "lucide-react";
import { useComments } from "@/hooks/useComments";
import { DocumentStatus, Comment, MonthlyContext } from "@/api/commentsService";
import { formatRelativeTime, getUserInitials, getDocumentStatusLabel } from "@/lib/commentUtils";

interface IntegratedCommentsProps {
  documentId: number;
  documentStatus: DocumentStatus;
  currentUserId: number;
  currentUserName: string;
  canEdit?: boolean;
  canDelete?: boolean;
  monthlyContext?: MonthlyContext;
  onCommentSubmitted?: () => void;
  onClearContext?: () => void;
  showAllComments?: boolean;
}

export default function IntegratedComments({
  documentId,
  documentStatus,
  currentUserId,
  currentUserName,
  canEdit = true,
  canDelete = true,
  monthlyContext,
  onCommentSubmitted,
  onClearContext,
  showAllComments = false,
}: IntegratedCommentsProps) {
  const { comments, loading, error, createComment, updateComment, deleteComment } = useComments({
    documentId,
    documentStatus,
    currentUserId,
    currentUserName,
    currentUserEmail: `${currentUserName.toLowerCase()
      .replace(/\s+/g, '.')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    }@austral.edu.ar`,
    monthlyContext,
  });

  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showOnlyContextual, setShowOnlyContextual] = useState(false);

  // Pre-rellenar comentario con contexto de documento mensual
  useEffect(() => {
    if (monthlyContext && !newComment) {
      const monthNames: Record<string, string> = {
        enero: 'Enero', febrero: 'Febrero', marzo: 'Marzo', abril: 'Abril',
        mayo: 'Mayo', junio: 'Junio', julio: 'Julio', agosto: 'Agosto',
        septiembre: 'Septiembre', octubre: 'Octubre', noviembre: 'Noviembre', diciembre: 'Diciembre'
      };
      
      const monthDisplay = monthNames[monthlyContext.month] || monthlyContext.month;
      const dateDisplay = new Date(monthlyContext.created_at).toLocaleDateString('es-AR');
      
      const contextComment = `📋 **Comentario sobre seguimiento mensual de ${monthDisplay}**\n🗓️ Documento: ${monthlyContext.version} (${dateDisplay})\n\n💬 `;
      
      setNewComment(contextComment);
    }
  }, [monthlyContext?.documentId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createComment(newComment);
      setNewComment("");
      if (onCommentSubmitted) {
        onCommentSubmitted();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar comentario';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      await updateComment(commentId, editContent);
      setEditingCommentId(null);
      setEditContent("");
    } catch (err) {
      console.error('Error updating comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    try {
      await deleteComment(commentId);
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const canUserEditComment = (comment: Comment) => {
    return canEdit && comment.user_id === currentUserId;
  };

  const canUserDeleteComment = (comment: Comment) => {
    return canDelete && comment.user_id === currentUserId;
  };

  if (loading && comments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Cargando comentarios...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monthly Context Banner */}
      {monthlyContext && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600 mt-1" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium text-blue-900">
                  Comentarios sobre documento mensual
                </h4>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {monthlyContext.month.charAt(0).toUpperCase() + monthlyContext.month.slice(1)} 2025
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-blue-700">
                <div className="flex items-center space-x-1">
                  <span className="font-medium">Versión:</span>
                  <span>{monthlyContext.version}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(monthlyContext.created_at).toLocaleDateString('es-AR')}</span>
                </div>
              </div>
              <p className="text-sm text-blue-600 mt-2">
                Puedes agregar comentarios específicos sobre el documento del mes de{' '}
                <strong>{monthlyContext.month}</strong>.
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => {
                  setNewComment("");
                  if (onClearContext) {
                    onClearContext();
                  }
                }}
                className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded"
                title="Ver todos los comentarios"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* New Comment Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Agregar Comentario</h4>
        <div className="relative">
          <textarea
            value={newComment}
            onChange={(e) => {
              setNewComment(e.target.value);
              setSubmitError(null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
            rows={4}
            placeholder="Escribe tu comentario aquí..."
            disabled={isSubmitting}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {newComment.length}/1000
          </div>
        </div>

        {submitError && (
          <div className="mt-2 flex items-center space-x-1 text-red-600">
            <AlertCircle className="w-3 h-3" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-gray-500">
            Estado del documento: {getDocumentStatusLabel(documentStatus)}
          </div>
          <button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            <span>{isSubmitting ? 'Enviando...' : 'Enviar'}</span>
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 && !loading ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No hay comentarios todavía.</p>
            <p className="text-sm">¡Sé el primero en comentar!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {getUserInitials(comment.user_name || 'Usuario')}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h5 className="font-medium text-gray-900">
                      {comment.user_name || 'Usuario'}
                    </h5>
                    {comment.monthly_context && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        📅 {comment.monthly_context.month}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {formatRelativeTime(comment.created_at)}
                    </span>
                  </div>

                  {editingCommentId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                        rows={3}
                      />
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          disabled={!editContent.trim()}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  )}
                </div>

                {editingCommentId !== comment.id && (
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {canUserEditComment(comment) && (
                      <button
                        onClick={() => startEditing(comment)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar comentario"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {canUserDeleteComment(comment) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar comentario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
