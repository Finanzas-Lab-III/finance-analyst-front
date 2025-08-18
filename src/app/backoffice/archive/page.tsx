"use client"
import React, { useState } from "react";
import { 
  Archive, 
  Search, 
  Download, 
  Eye, 
  Calendar,
  Filter,
  FileText,
  FolderOpen,
  Clock
} from "lucide-react";

interface ArchivedBudget {
  id: string;
  name: string;
  faculty: string;
  area: string;
  year: number;
  quarter?: string;
  finalStatus: 'approved' | 'rejected' | 'cancelled';
  createdBy: string;
  createdAt: string;
  finalizedAt: string;
  finalAmount: number;
  variations: number;
  documents: string[];
}

const mockArchivedBudgets: ArchivedBudget[] = [
  {
    id: "arch-1",
    name: "Presupuesto Laboratorio 2024",
    faculty: "Ingeniería",
    area: "Laboratorio",
    year: 2024,
    quarter: "Q4",
    finalStatus: "approved",
    createdBy: "Dr. Juan Pérez",
    createdAt: "2024-01-15",
    finalizedAt: "2024-12-20",
    finalAmount: 1200000,
    variations: 4,
    documents: ["lab_2024_original.xlsx", "lab_2024_final.xlsx", "lab_2024_report.pdf"]
  },
  {
    id: "arch-2",
    name: "Presupuesto Biomédica 2023",
    faculty: "Ingeniería",
    area: "Biomédica",
    year: 2023,
    finalStatus: "approved",
    createdBy: "Dra. María García",
    createdAt: "2023-02-10",
    finalizedAt: "2023-11-15",
    finalAmount: 1800000,
    variations: 3,
    documents: ["biomedica_2023_original.xlsx", "biomedica_2023_final.xlsx"]
  },
  {
    id: "arch-3",
    name: "Presupuesto Investigación Especial 2024",
    faculty: "Medicina", 
    area: "Investigación",
    year: 2024,
    quarter: "Q2",
    finalStatus: "rejected",
    createdBy: "Dr. Carlos Rodríguez",
    createdAt: "2024-03-05",
    finalizedAt: "2024-05-20",
    finalAmount: 0,
    variations: 2,
    documents: ["invest_2024_original.xlsx", "invest_2024_rejection_report.pdf"]
  },
  {
    id: "arch-4",
    name: "Presupuesto General Ingeniería 2023",
    faculty: "Ingeniería",
    area: "General", 
    year: 2023,
    finalStatus: "approved",
    createdBy: "Dr. Fernando López",
    createdAt: "2023-01-20",
    finalizedAt: "2023-12-30",
    finalAmount: 4500000,
    variations: 6,
    documents: ["ingenieria_2023_original.xlsx", "ingenieria_2023_v2.xlsx", "ingenieria_2023_final.xlsx", "ingenieria_2023_summary.pdf"]
  },
  {
    id: "arch-5",
    name: "Presupuesto Equipamiento 2022",
    faculty: "Ciencias",
    area: "Equipamiento",
    year: 2022,
    quarter: "Q3",
    finalStatus: "cancelled",
    createdBy: "Dra. Ana Martínez",
    createdAt: "2022-06-15",
    finalizedAt: "2022-08-10",
    finalAmount: 0,
    variations: 1,
    documents: ["equipamiento_2022_original.xlsx", "equipamiento_2022_cancellation.pdf"]
  }
];

const getStatusColor = (status: ArchivedBudget['finalStatus']) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: ArchivedBudget['finalStatus']) => {
  switch (status) {
    case 'approved':
      return 'Aprobado';
    case 'rejected':
      return 'Rechazado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return 'Desconocido';
  }
};

export default function ArchivePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [facultyFilter, setFacultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<ArchivedBudget['finalStatus'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'amount'>('date');

  const filteredBudgets = mockArchivedBudgets.filter(budget => {
    const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = yearFilter === 'all' || budget.year.toString() === yearFilter;
    const matchesFaculty = facultyFilter === 'all' || budget.faculty === facultyFilter;
    const matchesStatus = statusFilter === 'all' || budget.finalStatus === statusFilter;
    
    return matchesSearch && matchesYear && matchesFaculty && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.finalizedAt).getTime() - new Date(a.finalizedAt).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'amount':
        return b.finalAmount - a.finalAmount;
      default:
        return 0;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const years = Array.from(new Set(mockArchivedBudgets.map(b => b.year))).sort((a, b) => b - a);
  const faculties = Array.from(new Set(mockArchivedBudgets.map(b => b.faculty)));

  const stats = {
    total: mockArchivedBudgets.length,
    approved: mockArchivedBudgets.filter(b => b.finalStatus === 'approved').length,
    rejected: mockArchivedBudgets.filter(b => b.finalStatus === 'rejected').length,
    cancelled: mockArchivedBudgets.filter(b => b.finalStatus === 'cancelled').length,
    totalAmount: mockArchivedBudgets
      .filter(b => b.finalStatus === 'approved')
      .reduce((sum, b) => sum + b.finalAmount, 0)
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Archive className="w-8 h-8 mr-3 text-gray-600" />
              Archivo de Presupuestos
            </h1>
            <p className="text-gray-600">Presupuestos históricos finalizados y documentación asociada</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Archivados</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Aprobados</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rechazados</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-600">Cancelados</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{formatCurrency(stats.totalAmount)}</div>
            <div className="text-sm text-gray-600">Monto Aprobado</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar presupuestos archivados..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Year Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="all">Todos los años</option>
              {years.map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>
          </div>

          {/* Faculty Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={facultyFilter}
              onChange={(e) => setFacultyFilter(e.target.value)}
            >
              <option value="all">Todas las facultades</option>
              {faculties.map(faculty => (
                <option key={faculty} value={faculty}>{faculty}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ArchivedBudget['finalStatus'] | 'all')}
            >
              <option value="all">Todos los estados</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-4">
          <span className="text-sm text-gray-600">Ordenar por:</span>
          <select
            className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'amount')}
          >
            <option value="date">Fecha de finalización</option>
            <option value="name">Nombre</option>
            <option value="amount">Monto</option>
          </select>
        </div>
      </div>

      {/* Archived Budgets Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Presupuestos Archivados ({filteredBudgets.length})
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
                  Estado Final
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Año
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creado por
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Finalizado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto Final
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documentos
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
                      {budget.quarter && (
                        <div className="text-xs text-gray-400">{budget.quarter}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(budget.finalStatus)}`}>
                      {getStatusText(budget.finalStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {budget.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {budget.createdBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(budget.finalizedAt).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {budget.finalAmount > 0 ? formatCurrency(budget.finalAmount) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <FolderOpen className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{budget.documents.length} archivos</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900 p-1 rounded"
                        title="Descargar archivo"
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
            <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron presupuestos archivados con los filtros aplicados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
