"use client";
import React from "react";

export default function EnvCheck() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">🔧 Verificación de Variables de Entorno</h1>
      
      <div className="bg-gray-50 p-6 rounded-lg space-y-3">
        <div>
          <strong>NEXT_PUBLIC_USE_MOCK_COMMENTS:</strong>{" "}
          <code className="bg-yellow-100 px-2 py-1 rounded">
            {process.env.NEXT_PUBLIC_USE_MOCK_COMMENTS}
          </code>
        </div>
        
        <div>
          <strong>NEXT_PUBLIC_SERVICE_URL:</strong>{" "}
          <code className="bg-yellow-100 px-2 py-1 rounded">
            {process.env.NEXT_PUBLIC_SERVICE_URL}
          </code>
        </div>
        
        <div>
          <strong>NODE_ENV:</strong>{" "}
          <code className="bg-yellow-100 px-2 py-1 rounded">
            {process.env.NODE_ENV}
          </code>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Estado esperado:</h2>
        <ul className="space-y-1 text-sm">
          <li>✅ NEXT_PUBLIC_USE_MOCK_COMMENTS debería ser "true"</li>
          <li>✅ NEXT_PUBLIC_SERVICE_URL debería ser "http://localhost:8000"</li>
          <li>ℹ️  Los errores 404 que ves son de otras APIs, no de comentarios</li>
        </ul>
      </div>
    </div>
  );
}
