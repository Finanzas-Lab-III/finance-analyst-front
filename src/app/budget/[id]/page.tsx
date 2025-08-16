"use client"
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, FileText, BarChart3, History, Calendar, TrendingUp, DollarSign } from 'lucide-react';

interface BudgetOverviewProps {
  params: { id: string };
}

export default function BudgetOverview({ params }: BudgetOverviewProps) {
  const { id } = params;

  // Mock data - in a real app this would come from an API
  const budgetData = {
    id: id,
    name: 'Presupuesto Laboratorio',
    description: 'Presupuesto para el laboratorio de investigación 2025',
    year: '2025',
    status: 'active',
    totalBudget: 850000,
    usedBudget: 320000,
    lastModified: '2024-12-15',
    department: 'Laboratorio de Investigación',
    manager: 'Dr. Elena Martínez'
  };

  const progressPercentage = (budgetData.usedBudget / budgetData.totalBudget) * 100;

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <Link 
            href="/"
            className="p-2 rounded-full hover:bg-gray-100 mr-4 transition-colors duration-200"
          >
            <ArrowLeft size={24} className="text-gray-900" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{budgetData.name}</h1>
            <p className="text-gray-600 mt-1">{budgetData.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              budgetData.status === 'active' ? 'bg-green-100 text-green-800' :
              budgetData.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {budgetData.status === 'active' ? 'Activo' :
               budgetData.status === 'draft' ? 'Borrador' : 'Completado'}
            </span>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link 
            href="/armado"
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg transition-colors duration-200 block"
          >
            <div className="flex items-center mb-3">
              <Settings className="h-8 w-8 mr-3" />
              <h3 className="text-xl font-semibold">Armado de Presupuesto</h3>
            </div>
            <p className="text-blue-200">
              Crear y editar el presupuesto, cargar archivos Excel y configurar partidas presupuestarias.
            </p>
          </Link>

          <Link 
            href="/seguimiento"
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg transition-colors duration-200 block"
          >
            <div className="flex items-center mb-3">
              <BarChart3 className="h-8 w-8 mr-3" />
              <h3 className="text-xl font-semibold">Seguimiento de Presupuesto</h3>
            </div>
            <p className="text-green-200">
              Monitorear la ejecución del presupuesto, ver análisis y generar reportes de seguimiento.
            </p>
          </Link>

          <button className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg transition-colors duration-200 text-left">
            <div className="flex items-center mb-3">
              <History className="h-8 w-8 mr-3" />
              <h3 className="text-xl font-semibold">Presupuestos Anteriores</h3>
            </div>
            <p className="text-purple-200">
              Acceder al historial de presupuestos de años anteriores y comparar con el actual.
            </p>
          </button>
        </div>

        {/* Budget Information Card */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Información del Presupuesto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Detalles Generales</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Departamento:</span>
                  <span className="text-gray-900">{budgetData.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Responsable:</span>
                  <span className="text-gray-900">{budgetData.manager}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Año Fiscal:</span>
                  <span className="text-gray-900">{budgetData.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Última Modificación:</span>
                  <span className="text-gray-900">{new Date(budgetData.lastModified).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 