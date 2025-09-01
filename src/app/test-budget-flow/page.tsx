"use client"
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

// Mock data representing a simplified version of what would come from the API
const mockBudgetItems = [
  {
    area_year_id: 2,
    year: 2025,
    area: "Laboratorio",
    faculty: "Ingeniería",
    status: "BUDGET_APPROVED",
    displayName: "Presupuesto FI 2025"
  },
  {
    area_year_id: 3,
    year: 2024,
    area: "Laboratorio", 
    faculty: "Ingeniería",
    status: "BUDGET_APPROVED",
    displayName: "Presupuesto FI 2024"
  },
  {
    area_year_id: 4,
    year: 2025,
    area: "Biomédica",
    faculty: "Medicina",
    status: "PENDING_APPROVAL",
    displayName: "Presupuesto BIO 2025"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "BUDGET_APPROVED":
      return "bg-green-100 text-green-800";
    case "PENDING_APPROVAL":
      return "bg-yellow-100 text-yellow-800";
    case "BUDGET_STARTED":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "BUDGET_APPROVED":
      return "Presupuesto aprobado";
    case "PENDING_APPROVAL":
      return "Pendiente de aprobación";
    case "BUDGET_STARTED":
      return "Presupuesto iniciado";
    default:
      return "Desconocido";
  }
};

export default function TestBudgetFlow() {
  const router = useRouter();

  const handleBudgetClick = (areaYearId: number) => {
    router.push(`/backoffice/faculty-data/${areaYearId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                href="/backoffice"
                className="p-2 rounded-full hover:bg-gray-100 mr-4 transition-colors duration-200"
              >
                <ArrowLeft size={24} className="text-gray-900" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Test Budget Navigation Flow</h1>
                <p className="text-gray-600 mt-1">Demonstration of clickable budget list navigation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">🎯 Navigation Test</h2>
          <div className="text-blue-800 space-y-2">
            <p>1. <strong>Click on "Presupuesto FI 2025"</strong> in the table below</p>
            <p>2. <strong>You should navigate</strong> to the detailed budget view at <code>/backoffice/faculty-data/2</code></p>
            <p>3. <strong>Verify the page shows</strong> "Presupuesto FI 2025" as the title</p>
            <p>4. <strong>Confirm the spreadsheet interface</strong> is displayed with Budget, Tracking, and Comments tabs</p>
          </div>
        </div>

        {/* Budget List Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Available Budgets</h2>
            <p className="text-sm text-gray-600 mt-1">Click on any budget to view details</p>
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
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockBudgetItems.map((item) => (
                  <tr 
                    key={item.area_year_id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleBudgetClick(item.area_year_id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
                            {item.displayName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.faculty} - {item.area}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="text-blue-600 hover:text-blue-800">Ver detalles →</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🔧 Technical Implementation</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Current Navigation:</strong> This page → <code>/backoffice/faculty-data/[area_year_id]</code></p>
            <p><strong>Real Flow:</strong> <code>/backoffice/archive</code> → <code>/backoffice/faculty/[id]</code> → <code>/backoffice/faculty-data/[area_year_id]</code></p>
            <p><strong>Modified File:</strong> <code>/src/app/backoffice/faculty/[id]/page.tsx</code> (updated table to show "Presupuesto FI 2025" instead of just "2025")</p>
            <p><strong>Target Page:</strong> <code>/src/app/backoffice/faculty-data/[area_year_id]/page.tsx</code> (displays "Presupuesto FI 2025" as title)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
