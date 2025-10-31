"use client"
import React, { useState, useEffect } from "react";
import { X, DollarSign, AlertCircle } from "lucide-react";
import {
  createCost,
  updateCost,
  getMonthName,
  type BudgetItem,
  type Cost,
  type CreateCostData,
} from "@/lib/tracking-api";

export interface CreateCostModalProps {
  open: boolean;
  onClose: () => void;
  areaYearId: number;
  budgetItems: BudgetItem[];
  userId: number;
  editingCost?: Cost | null;
  preSelectedBudgetItem?: BudgetItem | null;
  onSuccess: () => void;
}

export default function CreateCostModal({
  open,
  onClose,
  areaYearId,
  budgetItems,
  userId,
  editingCost,
  preSelectedBudgetItem,
  onSuccess,
}: CreateCostModalProps) {
  const [formData, setFormData] = useState({
    budgetItemId: editingCost?.budgetItemId || preSelectedBudgetItem?.id || null,
    cuenta: editingCost?.cuenta || preSelectedBudgetItem?.cuenta || "",
    month: editingCost?.month || preSelectedBudgetItem?.month || 1,
    title: editingCost?.title || "",
    description: editingCost?.description || "",
    amount: editingCost?.amount || 0,
    currency: (editingCost?.currency || preSelectedBudgetItem?.currency || "ARS") as "USD" | "ARS" | "EUR",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualEntry, setManualEntry] = useState(false);

  useEffect(() => {
    if (editingCost) {
      setFormData({
        budgetItemId: editingCost.budgetItemId,
        cuenta: editingCost.cuenta || "",
        month: editingCost.month,
        title: editingCost.title,
        description: editingCost.description || "",
        amount: editingCost.amount,
        currency: editingCost.currency,
      });
      setManualEntry(!editingCost.budgetItemId);
    } else if (preSelectedBudgetItem) {
      setFormData({
        budgetItemId: preSelectedBudgetItem.id,
        cuenta: preSelectedBudgetItem.cuenta,
        month: preSelectedBudgetItem.month,
        title: "",
        description: "",
        amount: 0,
        currency: preSelectedBudgetItem.currency,
      });
      setManualEntry(false);
    }
  }, [editingCost, preSelectedBudgetItem]);

  const handleBudgetItemChange = (itemId: string) => {
    if (itemId === "manual") {
      setManualEntry(true);
      setFormData((prev) => ({
        ...prev,
        budgetItemId: null,
        cuenta: "",
        month: 1,
        currency: "ARS",
      }));
    } else {
      const item = budgetItems.find((i) => i.id === Number(itemId));
      if (item) {
        setManualEntry(false);
        setFormData((prev) => ({
          ...prev,
          budgetItemId: item.id,
          cuenta: item.cuenta,
          month: item.month,
          currency: item.currency,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError("El título es requerido");
      return;
    }
    if (formData.amount <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }
    if (manualEntry && !formData.cuenta.trim()) {
      setError("La cuenta es requerida");
      return;
    }

    setLoading(true);
    try {
      if (editingCost) {
        // Update existing cost
        await updateCost(editingCost.id, {
          budget_item_id: formData.budgetItemId,
          cuenta: formData.cuenta || null,
          month: formData.month,
          title: formData.title,
          description: formData.description || null,
          amount: formData.amount,
          currency: formData.currency,
        });
      } else {
        // Create new cost
        const createData: CreateCostData = {
          area_year_id: areaYearId,
          budget_item_id: formData.budgetItemId || null,
          cuenta: formData.cuenta || null,
          month: formData.month,
          title: formData.title,
          description: formData.description || null,
          amount: formData.amount,
          currency: formData.currency,
          created_by_id: userId,
        };
        await createCost(createData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving cost:", err);
      setError(err.response?.data?.message || "Error al guardar el gasto");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {editingCost ? "Editar Gasto" : "Registrar Nuevo Gasto"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Budget Item Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Línea Presupuestaria
            </label>
            {preSelectedBudgetItem && !editingCost ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <p className="text-sm font-medium text-blue-900">
                  {preSelectedBudgetItem.cuenta} - {preSelectedBudgetItem.name || "Sin nombre"} ({getMonthName(preSelectedBudgetItem.month)}) - {preSelectedBudgetItem.currency}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Línea presupuestaria seleccionada automáticamente
                </p>
              </div>
            ) : (
              <>
                <select
                  value={formData.budgetItemId || "manual"}
                  onChange={(e) => handleBudgetItemChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!editingCost}
                >
                  <option value="manual">Ingreso manual (sin línea presupuestaria)</option>
                  {budgetItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.cuenta} - {item.name || "Sin nombre"} ({getMonthName(item.month)}) -{" "}
                      {item.currency}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Seleccione una línea presupuestaria o ingrese manualmente
                </p>
              </>
            )}
          </div>

          {/* Manual Entry Fields */}
          {manualEntry && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuenta <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.cuenta}
                  onChange={(e) => setFormData({ ...formData, cuenta: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 1234567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mes <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {getMonthName(m)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value as "USD" | "ARS" | "EUR" })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="ARS">ARS (Pesos Argentinos)</option>
                  <option value="USD">USD (Dólares)</option>
                  <option value="EUR">EUR (Euros)</option>
                </select>
              </div>
            </>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título del Gasto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-black border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Compra de equipamiento de laboratorio"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="text-black w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detalles adicionales del gasto (opcional)"
              rows={3}
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                {formData.currency === "USD" ? "$" : formData.currency === "EUR" ? "€" : "$"}
              </span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full text-black border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Moneda: {formData.currency}
            </p>
          </div>

          {/* Summary */}
          {!manualEntry && formData.budgetItemId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Resumen</h4>
              {(() => {
                const item = budgetItems.find((i) => i.id === formData.budgetItemId);
                if (!item) return null;
                const currentSpent = (item.costs || []).reduce((sum, c) => sum + c.amount, 0);
                const newTotal = currentSpent + formData.amount;
                const remaining = item.budgetedAmount - newTotal;
                return (
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Presupuesto:</span>
                      <span className="font-medium text-gray-900">
                        {item.budgetedAmount.toLocaleString("es-AR")} {item.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Gastado actual:</span>
                      <span className="font-medium text-gray-900">
                        {currentSpent.toLocaleString("es-AR")} {item.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Nuevo gasto:</span>
                      <span className="font-medium text-blue-900">
                        {formData.amount.toLocaleString("es-AR")} {item.currency}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-300">
                      <span className="text-gray-700">Total gastado:</span>
                      <span className="font-medium text-gray-900">
                        {newTotal.toLocaleString("es-AR")} {item.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Restante:</span>
                      <span
                        className={`font-bold ${
                          remaining >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {remaining.toLocaleString("es-AR")} {item.currency}
                      </span>
                    </div>
                    {remaining < 0 && (
                      <div className="mt-2 flex items-start space-x-2 text-red-700">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p className="text-xs">
                          Este gasto excederá el presupuesto asignado
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={loading}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{editingCost ? "Actualizar" : "Registrar"} Gasto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

