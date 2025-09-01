"use client"
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft,
  Calendar,
  Search,
  Building2,
  GraduationCap
} from "lucide-react";

interface Budget {
  id: string;
  name: string;
  faculty: string;
  area: string;
  year: number;
  quarter?: string;
  status: 'draft' | 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'archived';
  createdBy: string;
  createdAt: string;
  lastModified: string;
  amount?: number;
  isActive: boolean;
}

// Mock data - this would come from an API in a real application
const mockBudgets: Budget[] = [
  // Current/Active budgets for Ingeniería - Laboratorio
  {
    id: "active-1",
    name: "Presupuesto Laboratorio 2025",
    faculty: "Ingeniería",
    area: "Laboratorio",
    year: 2025,
    quarter: "Q1",
    status: "approved",
    createdBy: "Dr. Juan Pérez",
    createdAt: "2025-01-15",
    lastModified: "2025-08-20",
    amount: 1500000,
    isActive: true
  },
  {
    id: "active-2",
    name: "Presupuesto Equipamiento Laboratorio 2025",
    faculty: "Ingeniería",
    area: "Laboratorio", 
    year: 2025,
    quarter: "Q2",
    status: "reviewing",
    createdBy: "Dr. Juan Pérez",
    createdAt: "2025-03-10",
    lastModified: "2025-08-15",
    amount: 800000,
    isActive: true
  },
  {
    id: "active-3",
    name: "Presupuesto Materiales Q3 2025",
    faculty: "Ingeniería",
    area: "Laboratorio",
    year: 2025,
    quarter: "Q3",
    status: "submitted",
    createdBy: "Dr. Ana López",
    createdAt: "2025-06-01",
    lastModified: "2025-08-22",
    amount: 600000,
    isActive: true
  },
  // Historical budgets for Ingeniería - Laboratorio
  {
    id: "hist-1",
    name: "Presupuesto Laboratorio 2024",
    faculty: "Ingeniería",
    area: "Laboratorio",
    year: 2024,
    quarter: "Q4",
    status: "archived",
    createdBy: "Dr. Juan Pérez",
    createdAt: "2024-01-15",
    lastModified: "2024-12-20",
    amount: 1200000,
    isActive: false
  },
  {
    id: "hist-2",
    name: "Presupuesto Laboratorio 2023",
    faculty: "Ingeniería",
    area: "Laboratorio",
    year: 2023,
    status: "archived",
    createdBy: "Dr. María García",
    createdAt: "2023-02-10",
    lastModified: "2023-11-15",
    amount: 1000000,
    isActive: false
  },
  {
    id: "hist-3",
    name: "Presupuesto Laboratorio 2022",
    faculty: "Ingeniería",
    area: "Laboratorio",
    year: 2022,
    status: "archived",
    createdBy: "Dr. Fernando López",
    createdAt: "2022-01-20",
    lastModified: "2022-12-30",
    amount: 900000,
    isActive: false
  },
  {
    id: "hist-4",
    name: "Presupuesto Equipamiento 2024",
    faculty: "Ingeniería",
    area: "Laboratorio",
    year: 2024,
    quarter: "Q2",
    status: "archived",
    createdBy: "Dr. Ana López",
    createdAt: "2024-04-01",
    lastModified: "2024-06-15",
    amount: 750000,
    isActive: false
  },
  // For Ingeniería - Biomédica
  {
    id: "bio-1",
    name: "Presupuesto Biomédica 2025",
    faculty: "Ingeniería",
    area: "Biomédica",
    year: 2025,
    status: "approved",
    createdBy: "Dra. Ana Martínez",
    createdAt: "2025-02-01",
    lastModified: "2025-08-10",
    amount: 2000000,
    isActive: true
  },
  {
    id: "bio-2",
    name: "Presupuesto Investigación Biomédica 2025",
    faculty: "Ingeniería",
    area: "Biomédica",
    year: 2025,
    quarter: "Q3",
    status: "reviewing",
    createdBy: "Dr. Carlos Rodríguez",
    createdAt: "2025-05-15",
    lastModified: "2025-08-18",
    amount: 1200000,
    isActive: true
  },
  {
    id: "bio-hist-1",
    name: "Presupuesto Biomédica 2024",
    faculty: "Ingeniería",
    area: "Biomédica",
    year: 2024,
    status: "archived",
    createdBy: "Dra. Ana Martínez",
    createdAt: "2024-01-10",
    lastModified: "2024-12-15",
    amount: 1800000,
    isActive: false
  },
  {
    id: "bio-hist-2",
    name: "Presupuesto Biomédica 2023",
    faculty: "Ingeniería",
    area: "Biomédica",
    year: 2023,
    status: "archived",
    createdBy: "Dr. Luis Fernández",
    createdAt: "2023-03-05",
    lastModified: "2023-11-20",
    amount: 1600000,
    isActive: false
  },
  // For Medicina - Investigación
  {
    id: "med-1",
    name: "Presupuesto Investigación Clínica 2025",
    faculty: "Medicina",
    area: "Investigación",
    year: 2025,
    quarter: "Q1",
    status: "approved",
    createdBy: "Dr. Roberto Silva",
    createdAt: "2025-01-20",
    lastModified: "2025-08-12",
    amount: 2500000,
    isActive: true
  },
  {
    id: "med-2",
    name: "Presupuesto Equipos Médicos 2025",
    faculty: "Medicina",
    area: "Investigación",
    year: 2025,
    quarter: "Q2",
    status: "submitted",
    createdBy: "Dra. Patricia Gómez",
    createdAt: "2025-04-10",
    lastModified: "2025-08-20",
    amount: 1800000,
    isActive: true
  },
  {
    id: "med-hist-1",
    name: "Presupuesto Investigación 2024",
    faculty: "Medicina",
    area: "Investigación",
    year: 2024,
    status: "archived",
    createdBy: "Dr. Roberto Silva",
    createdAt: "2024-02-15",
    lastModified: "2024-12-10",
    amount: 2200000,
    isActive: false
  },
  {
    id: "med-hist-2",
    name: "Presupuesto Investigación 2023",
    faculty: "Medicina",
    area: "Investigación",
    year: 2023,
    status: "archived",
    createdBy: "Dra. Elena Ruiz",
    createdAt: "2023-01-25",
    lastModified: "2023-12-05",
    amount: 2000000,
    isActive: false
  }
];

const getStatusColor = (status: Budget['status']) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'reviewing':
      return 'bg-yellow-100 text-yellow-800';
    case 'submitted':
      return 'bg-blue-100 text-blue-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'archived':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: Budget['status']) => {
  switch (status) {
    case 'approved':
      return 'Aprobado';
    case 'reviewing':
      return 'En Revisión';
    case 'submitted':
      return 'Enviado';
    case 'draft':
      return 'Borrador';
    case 'rejected':
      return 'Rechazado';
    case 'archived':
      return 'Archivado';
    default:
      return 'Desconocido';
  }
};

function FacultyAreaBudgetsPage() {
  const params = useParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const faculty = decodeURIComponent(params.faculty as string);
  const area = decodeURIComponent(params.area as string);

  // Filter budgets for this specific faculty-old and area
  const relevantBudgets = mockBudgets.filter(budget => 
    budget.faculty === faculty && budget.area === area
  );

  // Filter by search term
  const filteredBudgets = relevantBudgets.filter(budget =>
    budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate active and historical budgets
  const activeBudgets = filteredBudgets.filter(budget => budget.isActive);
  const historicalBudgets = filteredBudgets.filter(budget => !budget.isActive)
    .sort((a, b) => b.year - a.year); // Sort by year descending

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleBudgetClick = (budgetId: string) => {
    router.push(`/backoffice/budget/${budgetId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header with breadcrumb */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </button>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar presupuestos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:font-bold placeholder:text-gray-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Building2 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {faculty} - {area}
            </h1>
            <p className="text-gray-600">
              Presupuestos vigentes e históricos del área
            </p>
          </div>
        </div>
      </div>

      {/* Active Budgets Section */}
      {activeBudgets.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <GraduationCap className="w-6 h-6 mr-2 text-green-600" />
              Presupuestos Vigentes ({activeBudgets.length})
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
                    Última Modificación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeBudgets.map((budget) => (
                  <tr 
                    key={budget.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleBudgetClick(budget.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
                          {budget.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {budget.quarter ? `${budget.quarter} ${budget.year}` : budget.year}
                          {budget.amount && ` • ${formatCurrency(budget.amount)}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(budget.lastModified).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(budget.status)}`}>
                        {getStatusText(budget.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Historical Budgets Section */}
      {historicalBudgets.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-gray-600" />
              Presupuestos Históricos ({historicalBudgets.length})
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
                    Última Modificación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historicalBudgets.map((budget) => (
                  <tr 
                    key={budget.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleBudgetClick(budget.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
                          {budget.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {budget.quarter ? `${budget.quarter} ${budget.year}` : budget.year}
                          {budget.amount && ` • ${formatCurrency(budget.amount)}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(budget.lastModified).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(budget.status)}`}>
                        {getStatusText(budget.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredBudgets.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron presupuestos
            </h3>
            <p className="text-gray-500">
              No hay presupuestos para {faculty} - {area} con los criterios de búsqueda aplicados.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacultyAreaBudgetsPage;
