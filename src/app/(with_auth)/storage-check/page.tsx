"use client";
import React, { useState } from "react";

export default function LocalStorageViewer() {
  const [storageData, setStorageData] = useState<string>("");

  const checkLocalStorage = () => {
    if (typeof window !== 'undefined') {
      const commentsData = localStorage.getItem('mock_comments_data');
      const nextIdData = localStorage.getItem('next_comment_id');
      
      const data = {
        mock_comments_data: commentsData ? JSON.parse(commentsData) : null,
        next_comment_id: nextIdData,
        localStorage_keys: Object.keys(localStorage)
      };
      
      setStorageData(JSON.stringify(data, null, 2));
    }
  };

  const clearStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mock_comments_data');
      localStorage.removeItem('next_comment_id');
      setStorageData("Datos eliminados del localStorage");
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">🔍 Verificar Datos de Comentarios</h1>
      
      <div className="space-y-4">
        <button 
          onClick={checkLocalStorage}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Ver Datos del Navegador
        </button>
        
        <button 
          onClick={clearStorage}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-4"
        >
          Limpiar Datos Mock
        </button>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg mt-6">
        <h2 className="font-semibold mb-2">📝 Explicación:</h2>
        <ul className="text-sm space-y-1">
          <li>✅ <strong>Actualmente</strong>: Los comentarios se guardan en localStorage del navegador</li>
          <li>❌ <strong>NO se guardan</strong>: En la base de datos PostgreSQL</li>
          <li>🔧 <strong>Para usar la DB</strong>: Necesitas cambiar NEXT_PUBLIC_USE_MOCK_COMMENTS=false</li>
          <li>🚨 <strong>Importante</strong>: Con mock=false necesitas backend Django funcionando</li>
        </ul>
      </div>

      {storageData && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Datos encontrados:</h3>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
            {storageData}
          </pre>
        </div>
      )}
    </div>
  );
}
