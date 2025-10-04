"use client"
import React, { useState, useEffect } from "react";
import { MessageSquare, Send, Edit2, Trash2, AlertCircle, User, Clock, CheckCircle, XCircle, Loader2, FileText, Calendar, X, Download } from "lucide-react";
import { useComments } from "@/hooks/useComments";
import { DocumentStatus, Comment, commentsService } from "@/api/commentsService";
import { formatRelativeTime, getUserInitials, getDocumentStatusLabel, getDocumentTypeLabel, downloadFile } from "@/lib/commentUtils";

interface IntegratedCommentsProps {
  documentId: number;
  documentStatus: DocumentStatus;
  currentUserId: number;
  currentUserName: string;
  canEdit?: boolean;
  canDelete?: boolean;
  onCommentSubmitted?: () => void;
  monthlyContext?: {
    month: string;
    version: string;
    createdAt: string;
    documentId: number;
    title?: string;
    fileKey?: string;
    notes?: string;
  } | null;
  onClearContext?: () => void;
}

export default function IntegratedComments({
  documentId,
  documentStatus,
  currentUserId,
  currentUserName,
  canEdit = true,
  canDelete = true,
  onCommentSubmitted,
  monthlyContext,
  onClearContext,
}: IntegratedCommentsProps) {
  const { comments, loading, error, createComment, updateComment, deleteComment } = useComments({
    documentId,
    documentStatus,
    currentUserId,
    currentUserName,
    currentUserEmail: `${currentUserName.toLowerCase().replace(/\s+/g, '.')}@austral.edu.ar`,
    monthlyContext,
  });

  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<number | null>(null);

  // Check backend connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('🔍 Verificando conexión con el backend de comentarios...');
        await commentsService.healthCheck();
        setConnectionStatus('connected');
        console.log('✅ Conexión con backend de comentarios establecida');
      } catch (error) {
        setConnectionStatus('error');
        console.warn('⚠️ No se pudo conectar con el backend de comentarios:', error);
      }
    };
    
    checkConnection();
  }, []);

  // Pre-llenar comentario con contexto de seguimiento mensual
  useEffect(() => {
    if (monthlyContext && !newComment) {
      // Simple marker for tracking comments - the visual context is now provided by the metadata panel
      const contextComment = `💬 `;
      
      setNewComment(contextComment);
    } else if (!monthlyContext && newComment.includes('💬') && newComment.trim() === '💬') {
      // Limpiar comentario pre-llenado si se quita el contexto mensual
      setNewComment("");
    }
  }, [monthlyContext, newComment]);

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
      
      // Show user-friendly error messages
      let errorMessage = 'Error al actualizar el comentario';
      if (err instanceof Error) {
        if (err.message.includes('403') || err.message.includes('Forbidden')) {
          errorMessage = 'No tienes permisos para editar este comentario';
        } else if (err.message.includes('404') || err.message.includes('Not Found')) {
          errorMessage = 'El comentario ya no existe';
        } else if (err.message.includes('400') || err.message.includes('Bad Request')) {
          errorMessage = 'Error en los datos del comentario';
        }
      }
      
      // You can use your toast system here if available
      alert(errorMessage);
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
      
      // Show user-friendly error messages
      let errorMessage = 'Error al eliminar el comentario';
      if (err instanceof Error) {
        if (err.message.includes('403') || err.message.includes('Forbidden')) {
          errorMessage = 'No tienes permisos para eliminar este comentario';
        } else if (err.message.includes('404') || err.message.includes('Not Found')) {
          errorMessage = 'El comentario ya no existe';
        } else if (err.message.includes('400') || err.message.includes('Bad Request')) {
          errorMessage = 'Error en la solicitud de eliminación';
        }
      }
      
      // You can use your toast system here if available
      alert(errorMessage);
    }
  };

  const startEditing = (comment: Comment) => {
    console.log('🔧 startEditing called with comment:', comment);
    console.log('🔧 startEditing - comment.id:', comment.id, 'type:', typeof comment.id);
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

  const handleDownloadDocument = async (documentId: number, filename?: string) => {
    try {
      setDownloadingDocumentId(documentId);
      const response = await commentsService.downloadDocument(documentId);
      
      if (response.blob) {
        const finalFilename = response.filename || filename || `document_${documentId}.pdf`;
        downloadFile(response.blob, finalFilename);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error al descargar el documento. Por favor, inténtelo de nuevo.');
    } finally {
      setDownloadingDocumentId(null);
    }
  };

  const getStatusBadgeColor = (status: DocumentStatus) => {
    const colorMap: Record<DocumentStatus, string> = {
      [DocumentStatus.NOT_STARTED]: 'bg-gray-100 text-gray-800',
      [DocumentStatus.BUDGET_STARTED]: 'bg-blue-100 text-blue-800',
      [DocumentStatus.NEEDS_CHANGES]: 'bg-yellow-100 text-yellow-800',
      [DocumentStatus.PENDING_APPROVAL]: 'bg-orange-100 text-orange-800',
      [DocumentStatus.BUDGET_APPROVED]: 'bg-green-100 text-green-800',
      [DocumentStatus.FOLLOW_UP_AVAILABLE]: 'bg-purple-100 text-purple-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
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
      {/* Connection Status Indicator */}
      {connectionStatus === 'error' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Modo offline: Los comentarios no se guardarán en el servidor
            </span>
          </div>
        </div>
      )}
      
      {connectionStatus === 'connected' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">
              Conectado al servidor - Los comentarios se guardan automáticamente
            </span>
          </div>
        </div>
      )}

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
                  Comentarios sobre seguimiento mensual
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
                  <span>{new Date(monthlyContext.createdAt).toLocaleDateString('es-AR')}</span>
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
          <>
            {comments.map((comment) => (
            <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {getUserInitials(comment.user_name || (comment.user_id === currentUserId ? currentUserName : `Usuario ${comment.user_id}`))}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h5 className="font-medium text-gray-900">
                      {comment.user_name || (comment.user_id === currentUserId ? currentUserName : `Usuario ${comment.user_id}`)}
                    </h5>
                    <span className="text-sm text-gray-500">
                      {formatRelativeTime(comment.created_at)}
                    </span>
                    
                    {/* Document Status Badge - ONLY for SEGUIMIENTO documents */}
                    {comment.document_metadata && comment.document_metadata.document_type === 'SEGUIMIENTO' && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(comment.document_status)}`}>
                        {getDocumentStatusLabel(comment.document_status)}
                      </span>
                    )}
                    
                    {/* Download icon for SEGUIMIENTO documents ONLY */}
                    {comment.document_metadata && comment.document_metadata.document_type === 'SEGUIMIENTO' && (
                      <button
                        onClick={() => handleDownloadDocument(
                          comment.document_metadata!.document_area_year_id,
                          comment.document_metadata!.document_title
                        )}
                        disabled={downloadingDocumentId === comment.document_metadata.document_area_year_id}
                        className="inline-flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
                        title={`Descargar documento: ${comment.document_metadata.document_title}`}
                      >
                        {downloadingDocumentId === comment.document_metadata.document_area_year_id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Download className="w-3 h-3" />
                        )}
                        <span className="ml-1">Descargar</span>
                      </button>
                    )}
                  </div>
                  
                  {/* Document metadata info - ONLY for SEGUIMIENTO documents */}
                  {comment.document_metadata && comment.document_metadata.document_type === 'SEGUIMIENTO' && (
                    <div className="mb-2 p-2 bg-gray-50 rounded-md">
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Documento:</span> {getDocumentTypeLabel(comment.document_metadata.document_type)} - {comment.document_metadata.document_title}
                        {comment.document_metadata.document_notes && (
                          <span className="block mt-1">
                            <span className="font-medium">Notas:</span> {comment.document_metadata.document_notes}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

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
          ))}
          </>
        )}
      </div>
    </div>
  );
}
