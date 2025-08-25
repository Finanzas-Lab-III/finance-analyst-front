"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Archive, 
  Search
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
  },
  {
    id: "arch-6",
    name: "Presupuesto Laboratorio Avanzado 2023",
    faculty: "Ingeniería",
    area: "Laboratorio",
    year: 2023,
    quarter: "Q1",
    finalStatus: "approved",
    createdBy: "Dr. Juan Pérez",
    createdAt: "2023-01-10",
    finalizedAt: "2023-03-30",
    finalAmount: 950000,
    variations: 2,
    documents: ["lab_avanzado_2023.xlsx", "lab_avanzado_report.pdf"]
  },
  {
    id: "arch-7",
    name: "Presupuesto Investigación Médica 2023",
    faculty: "Medicina",
    area: "Investigación",
    year: 2023,
    finalStatus: "approved",
    createdBy: "Dra. Elena Ruiz",
    createdAt: "2023-01-25",
    finalizedAt: "2023-12-05",
    finalAmount: 2000000,
    variations: 5,
    documents: ["med_invest_2023_original.xlsx", "med_invest_2023_final.xlsx", "med_invest_2023_summary.pdf"]
  },
  {
    id: "arch-8",
    name: "Presupuesto Biomédica Experimental 2024",
    faculty: "Ingeniería",
    area: "Biomédica",
    year: 2024,
    quarter: "Q1",
    finalStatus: "approved",
    createdBy: "Dr. Luis Fernández",
    createdAt: "2024-01-05",
    finalizedAt: "2024-03-20",
    finalAmount: 1650000,
    variations: 3,
    documents: ["bio_exp_2024.xlsx", "bio_exp_report.pdf"]
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
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBudgets = mockArchivedBudgets.filter(budget => {
    const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => {
    return new Date(b.finalizedAt).getTime() - new Date(a.finalizedAt).getTime();
  });

  const handleBudgetClick = (faculty: string, area: string) => {
    // Navigate to faculty/area specific page
    const encodedFaculty = encodeURIComponent(faculty);
    const encodedArea = encodeURIComponent(area);
    router.push(`/backoffice/faculty/${encodedFaculty}/${encodedArea}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Simplified Header with inline search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Archive className="w-8 h-8 mr-3 text-gray-600" />
            Presupuestos Archivados
          </h1>
          <div className="relative w-80">
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
      </div>

      {/* Archived Budgets Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Presupuesto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Finalizado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado Final
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBudgets.map((budget) => (
                <tr 
                  key={budget.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleBudgetClick(budget.faculty, budget.area)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                        {budget.name}
                      </div>
                      <div className="text-sm text-gray-500">{budget.faculty} - {budget.area}</div>
                      {budget.quarter && (
                        <div className="text-xs text-gray-400">{budget.quarter} {budget.year}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(budget.finalizedAt).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(budget.finalStatus)}`}>
                      {getStatusText(budget.finalStatus)}
                    </span>
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
