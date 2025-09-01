"use client"
import React from "react";
import { User, Send } from "lucide-react";
import { BudgetComment } from "./types";

interface CommentsTabProps {
  comments: BudgetComment[];
  newComment: string;
  setNewComment: (s: string) => void;
  onSubmit: () => void;
}

export default function CommentsTab({ comments, newComment, setNewComment, onSubmit }: CommentsTabProps) {
  const getCommentTypeColor = (type: BudgetComment['type']) => {
    switch (type) {
      case 'approval':
        return 'bg-green-50 border-green-200';
      case 'rejection':
        return 'bg-red-50 border-red-200';
      case 'revision':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-900">Comentarios y Comunicación</h3>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Agregar Comentario</h4>
        <div className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe tu comentario o observación..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
          />
          <div className="flex justify-end">
            <button
              onClick={onSubmit}
              disabled={!newComment.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>Enviar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className={`border rounded-lg p-4 ${getCommentTypeColor(comment.type)}`}>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900">{comment.author}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {comment.type !== 'general' && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      comment.type === 'approval' ? 'bg-green-100 text-green-800' :
                      comment.type === 'rejection' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {comment.type === 'approval' ? 'Aprobación' :
                       comment.type === 'rejection' ? 'Rechazo' : 'Revisión'}
                    </span>
                  )}
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


