"use client"
import React, { useState } from "react";
import { Search, Filter, Download, Eye, Edit, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Budget {
  id: string;
  name: string;
  faculty: string;
  area: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_review' | 'draft';
  createdBy: string;
  createdAt: string;
  lastModified: string;
  originalBudget: string;
  financeBudget?: string;
  variations: number;
  totalAmount: number;
}

const mockBudgets: Budget[] = [
  {
    id: "1",
    name: "Presupuesto Laboratorio 2025",
    faculty: "Ingeniería",
    area: "Laboratorio",
    status: "pending",
    createdBy: "Dr. Juan Pérez",
    createdAt: "2024-01-15",
    lastModified: "2024-01-20",
    originalBudget: "lab_2025_original.xlsx",
    variations: 3,
    totalAmount: 1500000
  },
  {
    id: "2", 
    name: "Presupuesto Biomédica 2025",
    faculty: "Ingeniería",
    area: "Biomédica",
    status: "in_review",
    createdBy: "Dra. María García",
    createdAt: "2024-01-10",
    lastModified: "2024-01-22",
    originalBudget: "biomedica_2025_original.xlsx",
    financeBudget: "biomedica_2025_finance.xlsx",
    variations: 5,
    totalAmount: 2200000
  },
  {
    id: "3",
    name: "Presupuesto General Ingeniería 2025",
    faculty: "Ingeniería", 
    area: "General",
    status: "approved",
    createdBy: "Dr. Carlos López",
    createdAt: "2024-01-05",
    lastModified: "2024-01-25",
    originalBudget: "ingenieria_2025_original.xlsx",
    financeBudget: "ingenieria_2025_finance.xlsx",
    variations: 2,
    totalAmount: 5000000
  },
  {
    id: "4",
    name: "Presupuesto Laboratorio 2024",
    faculty: "Ingeniería",
    area: "Laboratorio", 
    status: "rejected",
    createdBy: "Dr. Ana Rodríguez",
    createdAt: "2023-12-15",
    lastModified: "2024-01-18",
    originalBudget: "lab_2024_original.xlsx",
    financeBudget: "lab_2024_finance.xlsx",
    variations: 1,
    totalAmount: 1200000
  }
];

const getStatusIcon = (status: Budget['status']) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'approved':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'rejected':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'in_review':
      return <AlertCircle className="w-4 h-4 text-blue-500" />;
    case 'draft':
      return <Edit className="w-4 h-4 text-gray-500" />;
    default:
      return null;
  }
};

const getStatusText = (status: Budget['status']) => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'approved':
      return 'Aprobado';
    case 'rejected':
      return 'Rechazado';
    case 'in_review':
      return 'En Revisión';
    case 'draft':
      return 'Borrador';
    default:
      return 'Desconocido';
  }
};

const getStatusColor = (status: Budget['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'in_review':
      return 'bg-blue-100 text-blue-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function BudgetsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Budget['status'] | 'all'>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');

  const filteredBudgets = mockBudgets.filter(budget => {
    const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || budget.status === statusFilter;
    const matchesArea = areaFilter === 'all' || budget.area === areaFilter;
    
    return matchesSearch && matchesStatus && matchesArea;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Presupuestos</h1>
        <p className="text-gray-600">Gestión y supervisión de todos los presupuestos universitarios</p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar presupuestos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:w-48">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Budget['status'] | 'all')}
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="in_review">En Revisión</option>
              <option value="approved">Aprobado</option>
              <option value="rejected">Rechazado</option>
              <option value="draft">Borrador</option>
            </select>
          </div>

          {/* Area Filter */}
          <div className="md:w-48">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
            >
              <option value="all">Todas las áreas</option>
              <option value="General">General</option>
              <option value="Laboratorio">Laboratorio</option>
              <option value="Biomédica">Biomédica</option>
            </select>
          </div>
        </div>
      </div>

      {/* Budgets Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Presupuestos ({filteredBudgets.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Presupuesto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creado por
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última modificación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variaciones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBudgets.map((budget) => (
                <tr key={budget.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{budget.name}</div>
                      <div className="text-sm text-gray-500">{budget.faculty} - {budget.area}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(budget.status)}`}>
                      {getStatusIcon(budget.status)}
                      <span className="ml-1">{getStatusText(budget.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {budget.createdBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(budget.lastModified).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(budget.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {budget.variations} variaciones
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link 
                        href={`/backoffice/budget/${budget.id}`}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button 
                        className="text-gray-600 hover:text-gray-900 p-1 rounded"
                        title="Descargar"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBudgets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron presupuestos con los filtros aplicados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
