import React from 'react';
import { X } from 'lucide-react';
import { BudgetData } from '@/data/mockBudgetData';

interface BudgetPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetData: BudgetData | null;
}

const BudgetPreviewModal: React.FC<BudgetPreviewModalProps> = ({ isOpen, onClose, budgetData }) => {
  if (!isOpen || !budgetData) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalCost = budgetData.items.reduce((sum, item) => sum + item.costo_total, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Vista Rápida del Presupuesto {budgetData.year}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>Archivo: {budgetData.archivo}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                budgetData.estatus === 'Aprobado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {budgetData.estatus}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Summary */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{budgetData.items.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Costo Total</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalCost)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Última Actualización</p>
              <p className="text-lg font-semibold text-gray-900">{budgetData.ultima_actualizacion}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Actualizado por</p>
              <p className="text-lg font-semibold text-gray-900">{budgetData.actualizado_por}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-6 overflow-auto max-h-[50vh]">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle de Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recurso
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo Contratación
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meses
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remuneración Mensual
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {budgetData.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.nombre_recurso}</div>
                        <div className="text-sm text-gray-500">{item.comentarios}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.tipo_contratacion.includes('Docente') 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.tipo_contratacion}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{item.meses} meses</div>
                        <div className="text-xs text-gray-500">Inicio: {item.mes_inicio}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.remuneracion_bruta_mensual)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(item.costo_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetPreviewModal;
