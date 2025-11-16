"use client"
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createCost, Currency, CreateCostRequest } from "@/api/trackingService";
import { processBudgetFile, BudgetProcessorResponse, BudgetDataItem } from "@/lib/budget-api";

interface AddCostModalProps {
  open: boolean;
  onClose: () => void;
  areaYearId: number;
  month: number; // 1-12
  monthName: string;
  onCostAdded?: () => void;
  userId: number; // current user ID
  preselectedCuenta?: string; // Optional pre-selected cuenta
}

export default function AddCostModal({
  open,
  onClose,
  areaYearId,
  month,
  monthName,
  onCostAdded,
  userId,
  preselectedCuenta,
}: AddCostModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cuentas, setCuentas] = useState<Array<{ cuenta: string; denominacion: string }>>([]);
  const [loadingCuentas, setLoadingCuentas] = useState(false);

  // Form fields
  const [selectedCuenta, setSelectedCuenta] = useState<string>("");
  const [selectedCuentaId, setSelectedCuentaId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>(Currency.ARS);

  // Fetch available cuentas from budget data
  useEffect(() => {
    if (!open) return;

    async function fetchCuentas() {
      setLoadingCuentas(true);
      try {
        const result: BudgetProcessorResponse = await processBudgetFile(areaYearId);
        
        if (result.success && result.data) {
          // Extract unique cuentas from budget data
          const uniqueCuentas = result.data
            .filter((item: BudgetDataItem) => item.Cuenta && item.Denominacion)
            .map((item: BudgetDataItem) => ({
              cuenta: String(item.Cuenta),
              denominacion: item.Denominacion,
            }))
            .filter((item, index, self) => 
              index === self.findIndex((t) => t.cuenta === item.cuenta)
            )
            .sort((a, b) => a.denominacion.localeCompare(b.denominacion));
          
          setCuentas(uniqueCuentas);
          
          // If preselectedCuenta is provided, set it as the default
          if (preselectedCuenta) {
            setSelectedCuenta(preselectedCuenta);
            // Find the cuenta ID for the preselected cuenta
            const matchingCuenta = uniqueCuentas.find(c => c.denominacion === preselectedCuenta);
            if (matchingCuenta) {
              setSelectedCuentaId(matchingCuenta.cuenta);
            }
          }
        }
      } catch (err: any) {
        console.error('Error fetching cuentas:', err);
        // Don't show error for missing budget data, just leave cuentas empty
        setCuentas([]);
        // Still set preselected cuenta if provided, even if fetching failed
        if (preselectedCuenta) {
          setSelectedCuenta(preselectedCuenta);
          setSelectedCuentaId(""); // No ID available if fetch failed
        }
      } finally {
        setLoadingCuentas(false);
      }
    }

    fetchCuentas();
  }, [open, areaYearId, preselectedCuenta]);

  const resetForm = () => {
    setSelectedCuenta("");
    setSelectedCuentaId("");
    setTitle("");
    setDescription("");
    setAmount("");
    setCurrency(Currency.ARS);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!selectedCuenta) {
      setError("Por favor selecciona una cuenta");
      return;
    }
    if (!title.trim()) {
      setError("El título es requerido");
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }

    setLoading(true);

    try {
      const costData: CreateCostRequest = {
        area_year_id: areaYearId,
        cuenta: selectedCuenta,
        cuenta_id: selectedCuentaId || undefined,
        month: month,
        title: title.trim(),
        description: description.trim() || undefined,
        amount: numAmount,
        currency: currency,
        created_by_id: userId,
      };

      await createCost(costData);
      
      // Success - notify parent and close
      onCostAdded?.();
      handleClose();
    } catch (err: any) {
      setError(err?.message || "Error al crear el gasto");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Agregar Gasto</h3>
            <p className="text-sm text-gray-600 mt-1">Mes: {monthName}</p>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cuenta Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuenta / Denominación *
            </label>
            {loadingCuentas ? (
              <div className="text-sm text-gray-500 py-2">Cargando cuentas...</div>
            ) : cuentas.length === 0 ? (
              <div>
                <input
                  type="text"
                  value={selectedCuenta}
                  onChange={(e) => {
                    setSelectedCuenta(e.target.value);
                    setSelectedCuentaId(""); // No ID for manual entry
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Ingresa el nombre de la cuenta"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  No hay presupuesto cargado. Ingresa el nombre de la cuenta manualmente.
                </p>
              </div>
            ) : (
              <select
                value={selectedCuenta}
                onChange={(e) => {
                  const denominacion = e.target.value;
                  setSelectedCuenta(denominacion);
                  // Find and set the cuenta ID
                  const matchingCuenta = cuentas.find(c => c.denominacion === denominacion);
                  setSelectedCuentaId(matchingCuenta?.cuenta || "");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                required
              >
                <option value="">Selecciona una cuenta</option>
                {cuentas.map((cuenta) => (
                  <option key={cuenta.cuenta} value={cuenta.denominacion}>
                    {cuenta.denominacion} (Cuenta: {cuenta.cuenta})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Ej: Compra de materiales"
              maxLength={200}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Detalles adicionales del gasto..."
            />
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moneda *
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                required
              >
                <option value={Currency.ARS}>ARS (Pesos)</option>
                <option value={Currency.USD}>USD (Dólares)</option>
                <option value={Currency.EUR}>EUR (Euros)</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <button 
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando..." : "Guardar Gasto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

