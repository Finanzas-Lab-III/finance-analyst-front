"use client"
import React from 'react';
import Link from 'next/link';
import { ChevronRight, FileSpreadsheet, Calendar, TrendingUp } from 'lucide-react';

interface Budget {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'completed';
  lastModified: string;
  year: string;
}

export default function Home() {
  // For now, we have one budget but the structure supports multiple
  const budgets: Budget[] = [
    {
      id: 'lab-budget-2025',
      name: 'Presupuesto Laboratorio',
      description: 'Presupuesto para el laboratorio de investigación 2025',
      status: 'active',
      lastModified: '2024-12-15',
      year: '2025'
    }
  ];

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Sistema de Gestión de Presupuestos</h1>
          <p className="text-gray-400 text-lg">Administra y supervisa todos los presupuestos de manera centralizada</p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <FileSpreadsheet className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Total Presupuestos</p>
                <p className="text-2xl font-bold">{budgets.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Año Actual</p>
                <p className="text-2xl font-bold">2025</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Presupuestos Activos</p>
                <p className="text-2xl font-bold">{budgets.filter(b => b.status === 'active').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Budget List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Presupuestos Disponibles</h2>
          <div className="grid gap-4">
            {budgets.map((budget) => (
              <Link
                key={budget.id}
                href={`/budget/${budget.id}`}
                className="block bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors duration-200 border border-gray-700 hover:border-gray-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-semibold mr-3">{budget.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        budget.status === 'active' ? 'bg-green-900 text-green-300' :
                        budget.status === 'draft' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-gray-900 text-gray-300'
                      }`}>
                        {budget.status === 'active' ? 'Activo' :
                         budget.status === 'draft' ? 'Borrador' : 'Completado'}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-2">{budget.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>Año: {budget.year}</span>
                      <span className="mx-2">•</span>
                      <span>Última modificación: {new Date(budget.lastModified).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
