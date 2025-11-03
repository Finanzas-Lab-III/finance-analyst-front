"use client";
import React, { useEffect, useState } from "react";
import { commentsService, Comment } from "@/api/commentsService";

export default function TestCommentsSimple() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComments = async () => {
      try {
        console.log('🧪 Testing comments service...');
        const result = await commentsService.getCommentsByDocument(123);
        console.log('📝 Comments result:', result);
        setComments(result.comments);
      } catch (err) {
        console.error('❌ Error loading comments:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">🧪 Test Simple de Comentarios</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="font-semibold">Configuración:</h2>
        <p>USE_MOCK_COMMENTS: {process.env.NEXT_PUBLIC_USE_MOCK_COMMENTS}</p>
        <p>SERVICE_URL: {process.env.NEXT_PUBLIC_SERVICE_URL}</p>
      </div>

      {loading && <p>Cargando comentarios...</p>}
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-red-700">Error:</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Comentarios encontrados: {comments.length}
          </h2>
          {comments.map((comment) => (
            <div key={comment.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <p className="text-gray-600 text-sm">
                Por: {comment.user_name} • {new Date(comment.created_at).toLocaleString()}
              </p>
              <div className="mt-2">{comment.content}</div>
              {comment.monthly_context && (
                <div className="bg-yellow-50 p-2 rounded mt-2 text-sm">
                  📅 Contexto mensual: {comment.monthly_context.month}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
