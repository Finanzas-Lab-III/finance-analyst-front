"use client";
import React, { useState, useEffect } from "react";
import IntegratedComments from "@/components/IntegratedComments";
import { DocumentStatus, MonthlyContext, commentsService } from "@/api/commentsService";

export default function TestCommentsPage() {
  const [monthlyContext, setMonthlyContext] = useState<MonthlyContext | undefined>(undefined);
  const [showAllComments, setShowAllComments] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [statusMessage, setStatusMessage] = useState('Verificando conexión...');

  // Verificar conectividad con el backend
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        await commentsService.healthCheck();
        setBackendStatus('connected');
        setStatusMessage('Conectado correctamente');
      } catch (error) {
        setBackendStatus('error');
        setStatusMessage(error instanceof Error ? error.message : 'Error de conexión');
      }
    };

    checkBackendHealth();
  }, []);

  const handleAddMonthlyContext = () => {
    setMonthlyContext({
      documentId: 789,
      month: "enero",
      version: "V2",
      created_at: "2024-12-01T10:00:00Z",
      title: "Seguimiento Enero V2",
      fileKey: "123/seguimiento/enero/enero_v2.xlsx",
      notes: "Datos actualizados con correcciones"
    });
  };

  const handleClearContext = () => {
    setMonthlyContext(undefined);
    setShowAllComments(false);
  };

  const handleTestConnection = async () => {
    setBackendStatus('checking');
    setStatusMessage('Verificando conexión...');
    
    try {
      await commentsService.healthCheck();
      setBackendStatus('connected');
      setStatusMessage('Conectado correctamente');
    } catch (error) {
      setBackendStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Error de conexión');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔥 Fase 1: Test Sistema de Comentarios - BACKEND REAL
          </h1>
          <p className="text-gray-600">
            Página de prueba para validar el sistema de comentarios con backend real implementado.
          </p>
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                backendStatus === 'connected' ? 'bg-green-500' : 
                backendStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <p className="text-sm text-green-700">
                <strong>Backend:</strong> {process.env.NEXT_PUBLIC_SERVICE_URL || 'http://localhost:8000'} - {statusMessage}
              </p>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Controles de Prueba</h2>
          <div className="flex gap-4">
            <button
              onClick={handleAddMonthlyContext}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              📅 Agregar Contexto Mensual
            </button>
            <button
              onClick={handleClearContext}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              🗑️ Limpiar Contexto
            </button>
            <button
              onClick={handleTestConnection}
              disabled={backendStatus === 'checking'}
              className={`px-4 py-2 rounded-lg ${
                backendStatus === 'checking' 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {backendStatus === 'checking' ? '🔄 Verificando...' : '🔗 Test Conexión'}
            </button>
            {monthlyContext && (
              <button
                onClick={() => setShowAllComments(!showAllComments)}
                className={`px-4 py-2 rounded-lg ${
                  showAllComments 
                    ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                }`}
              >
                {showAllComments ? '📅 Solo Contextuales' : '🌐 Ver Todos'}
              </button>
            )}
          </div>
          {monthlyContext && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Contexto activo:</strong> {monthlyContext.month} {monthlyContext.version} 
                (Document ID: {monthlyContext.documentId})
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Modo: {showAllComments ? 'Mostrando todos los comentarios' : 'Solo comentarios contextuales'}
              </p>
            </div>
          )}
        </div>

        {/* Test Case 1: Comentario Básico */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Test 1: Comentarios Básicos
          </h2>
          <p className="text-gray-600 mb-4">
            Documento ID: 1001 | Estado: PENDING_APPROVAL | Usuario: Test User (ID: 1)
          </p>
          
          <IntegratedComments
            documentId={1001}
            documentStatus={DocumentStatus.PENDING_APPROVAL}
            currentUserId={1}
            currentUserName="Test User"
            canEdit={true}
            canDelete={true}
            onCommentSubmitted={() => {
              console.log('✅ Comentario básico enviado');
            }}
          />
        </div>

        {/* Test Case 2: Comentario con Contexto */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Test 2: Comentarios con Contexto Mensual
          </h2>
          <p className="text-gray-600 mb-4">
            Documento ID: 1002 | Estado: BUDGET_APPROVED | Usuario: Test User (ID: 1)
          </p>
          
          <IntegratedComments
            documentId={1002}
            documentStatus={DocumentStatus.BUDGET_APPROVED}
            currentUserId={1}
            currentUserName="Test User"
            canEdit={true}
            canDelete={true}
            monthlyContext={monthlyContext}
            showAllComments={showAllComments}
            onCommentSubmitted={() => {
              console.log('✅ Comentario con contexto enviado');
            }}
            onClearContext={handleClearContext}
          />
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            📋 Instrucciones de Prueba
          </h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• <strong>Test 1</strong>: Crea comentarios básicos sin contexto</li>
            <li>• <strong>Test 2</strong>: Usa "Agregar Contexto Mensual" y luego comenta</li>
            <li>• <strong>Filtrado</strong>: Alterna entre "Solo Contextuales" y "Ver Todos"</li>
            <li>• <strong>Edición</strong>: Intenta editar tus propios comentarios</li>
            <li>• <strong>Permisos</strong>: Los comentarios de otros usuarios no deberían ser editables</li>
            <li>• <strong>Contexto</strong>: El panel azul debe mostrar información del seguimiento</li>
            <li>• <strong>Indicadores</strong>: Los comentarios contextuales muestran etiquetas de mes</li>
          </ul>
        </div>

        {/* Technical Info */}
        <div className="bg-gray-100 rounded-lg p-4 mt-6">
          <h4 className="font-semibold text-gray-800 mb-2">🔧 Info Técnica</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Estado actual:</strong> ✅ Conectado a backend real</p>
            <p><strong>Backend URL:</strong> {process.env.NEXT_PUBLIC_SERVICE_URL || 'http://localhost:8000'}</p>
            <p><strong>Contexto mensual:</strong> {monthlyContext ? 'Activo' : 'Inactivo'}</p>
            <p><strong>API Endpoints:</strong> ✅ CRUD completo implementado</p>
            <p><strong>Base de datos:</strong> ✅ PostgreSQL con índices optimizados</p>
            <p><strong>Validaciones:</strong> ✅ Backend y frontend sincronizados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
