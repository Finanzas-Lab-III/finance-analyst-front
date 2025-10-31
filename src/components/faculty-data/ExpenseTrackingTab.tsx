"use client"
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  getBudgetItems,
  getCosts,
  deleteCost,
  formatCurrency,
  getMonthName,
  calculateBudgetUsagePercentage,
  getBudgetStatusColor,
  type BudgetItem,
  type Cost,
} from "@/lib/tracking-api";
import { useAuth } from "@/components/AuthContext";
import CreateCostModal from "@/components/faculty-data/CreateCostModal";

interface ExpenseTrackingTabProps {
  areaYearId: string | number;
}

export default function ExpenseTrackingTab({ areaYearId }: ExpenseTrackingTabProps) {
  const { user, userRole } = useAuth();
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCost, setEditingCost] = useState<Cost | null>(null);
  const [selectedBudgetItem, setSelectedBudgetItem] = useState<BudgetItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [hasImported, setHasImported] = useState(false);

  // Reload data function - reusable
  const reloadData = useCallback(async () => {
    try {
      const [budgetResponse, costsResponse] = await Promise.all([
        getBudgetItems(Number(areaYearId), {
          month: selectedMonth || undefined,
          currency: selectedCurrency || undefined,
          page_size: 1000,
        }),
        getCosts({
          area_year_id: Number(areaYearId),
          month: selectedMonth || undefined,
          currency: selectedCurrency || undefined,
          page_size: 1000,
        }),
      ]);

      setBudgetItems(budgetResponse.results);
      setCosts(costsResponse.results);
    } catch (err: any) {
      console.error("Error loading tracking data:", err);
      setError(err.response?.data?.message || "Error al cargar los datos");
    }
  }, [areaYearId, selectedMonth, selectedCurrency]);

  // Load budget items and costs
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      await reloadData();
      setLoading(false);
    };

    loadData();
  }, [reloadData]);

  // Calculate totals and statistics
  const statistics = useMemo(() => {
    // Safety check: ensure arrays are defined
    const items = budgetItems || [];
    const expenses = costs || [];
    
    // Group budgeted amounts by currency
    const budgetedByCurrency: Record<string, number> = {};
    items.forEach((item) => {
      const currency = item.currency || 'ARS';
      budgetedByCurrency[currency] = (budgetedByCurrency[currency] || 0) + item.budgetedAmount;
    });
    
    // Group spent amounts by currency
    const spentByCurrency: Record<string, number> = {};
    expenses.forEach((cost) => {
      const currency = cost.currency || 'ARS';
      spentByCurrency[currency] = (spentByCurrency[currency] || 0) + cost.amount;
    });
    
    // Calculate remaining by currency
    const remainingByCurrency: Record<string, number> = {};
    Object.keys(budgetedByCurrency).forEach((currency) => {
      const budgeted = budgetedByCurrency[currency] || 0;
      const spent = spentByCurrency[currency] || 0;
      remainingByCurrency[currency] = budgeted - spent;
    });
    
    // Calculate totals (for legacy compatibility)
    const totalBudgeted = Object.values(budgetedByCurrency).reduce((sum, val) => sum + val, 0);
    const totalSpent = Object.values(spentByCurrency).reduce((sum, val) => sum + val, 0);
    const remaining = totalBudgeted - totalSpent;
    const percentageUsed = calculateBudgetUsagePercentage(totalSpent, totalBudgeted);

    // Group costs by budget item
    const costsByBudgetItem = new Map<number, Cost[]>();
    expenses.forEach((cost) => {
      if (cost.budgetItemId) {
        const itemCosts = costsByBudgetItem.get(cost.budgetItemId) || [];
        itemCosts.push(cost);
        costsByBudgetItem.set(cost.budgetItemId, itemCosts);
      }
    });

    // Calculate items with overspending
    let itemsOverBudget = 0;
    items.forEach((item) => {
      const itemCosts = costsByBudgetItem.get(item.id) || [];
      const itemSpent = itemCosts.reduce((sum, c) => sum + c.amount, 0);
      if (itemSpent > item.budgetedAmount) {
        itemsOverBudget++;
      }
    });

    return {
      totalBudgeted,
      totalSpent,
      remaining,
      percentageUsed,
      itemsOverBudget,
      costsByBudgetItem,
      budgetedByCurrency,
      spentByCurrency,
      remainingByCurrency,
    };
  }, [budgetItems, costs]);

  const handleDeleteCost = async (costId: number) => {
    if (!window.confirm("¿Está seguro de eliminar este gasto?")) return;

    try {
      await deleteCost(costId);
      // Reload data to show updated list
      await reloadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al eliminar el gasto");
    }
  };

  const toggleExpanded = (itemId: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleCostCreatedOrUpdated = async () => {
    // Close modal first
    setShowCreateModal(false);
    setEditingCost(null);
    setSelectedBudgetItem(null);
    
    // Reload data to show new/updated cost
    await reloadData();
  };

  const handleAddCostToBudgetItem = (item: BudgetItem) => {
    setSelectedBudgetItem(item);
    setEditingCost(null);
    setShowCreateModal(true);
  };

  const handleImportBudgetItems = async () => {
    if (hasImported || isImporting) return;
    const confirmed = window.confirm(
      "¿Importar líneas presupuestarias desde el presupuesto? Esta acción puede sobrescribir existentes."
    );
    if (!confirmed) return;

    try {
      setIsImporting(true);
      const baseUrl = process.env.NEXT_PUBLIC_SERVICE_URL || "http://localhost:8000";
      const response = await fetch(
        `${baseUrl}/api/budget-processor/import-budget-items/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ area_year_id: Number(areaYearId), overwrite: true }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || "Error al importar líneas de presupuesto");
      }

      setHasImported(true);
      await reloadData();
      alert("Importación completada correctamente");
    } catch (e: any) {
      alert(e?.message || "Error al importar líneas de presupuesto");
    } finally {
      setIsImporting(false);
    }
  };

  const exportToCSV = () => {
    const items = budgetItems || [];
    const headers = ["Cuenta", "Nombre", "Mes", "Presupuestado", "Gastado", "Restante", "% Uso", "Moneda"];
    const rows = items.map((item) => {
      const itemCosts = statistics.costsByBudgetItem.get(item.id) || [];
      const spent = itemCosts.reduce((sum, c) => sum + c.amount, 0);
      const remaining = item.budgetedAmount - spent;
      const percentage = calculateBudgetUsagePercentage(spent, item.budgetedAmount);

      return [
        item.cuenta,
        item.name || "-",
        getMonthName(item.month),
        item.budgetedAmount,
        spent,
        remaining,
        `${percentage.toFixed(1)}%`,
        item.currency,
      ];
    });

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tracking-gastos-${areaYearId}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Cargando tracking de gastos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center text-red-800">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Tracking de Gastos</h3>
          <p className="text-gray-600 mt-1">Control de presupuesto vs gastos ejecutados</p>
        </div>
        <div className="flex space-x-2">
          {userRole === 'finance' && (
            <button
              onClick={handleImportBudgetItems}
              disabled={isImporting || hasImported}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-white ${
                hasImported
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isImporting
                  ? 'bg-gray-500'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
              title={hasImported ? 'Ya importado' : 'Importar líneas desde presupuesto'}
              type="button"
            >
              <Download className="w-4 h-4" />
              <span>
                {hasImported
                  ? 'Imported'
                  : isImporting
                  ? 'Importing…'
                  : 'import budget items from budget'}
              </span>
            </button>
          )}
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
          <button
            onClick={() => {
              setEditingCost(null);
              setSelectedBudgetItem(null);
              setShowCreateModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Gasto</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
            <select
              value={selectedMonth || ""}
              onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="">Todos los meses</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {getMonthName(m)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
            <select
              value={selectedCurrency || ""}
              onChange={(e) => setSelectedCurrency(e.target.value || null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="">Todas las monedas</option>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          {(selectedMonth || selectedCurrency) && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedMonth(null);
                  setSelectedCurrency(null);
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Presupuestado</p>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
          <div className="space-y-1">
            {Object.entries(statistics.budgetedByCurrency).map(([currency, amount]) => (
              <div key={currency} className="flex items-baseline justify-between">
                <span className="text-xs text-gray-500">{currency}:</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(amount, currency as any)}
                </span>
              </div>
            ))}
            {Object.keys(statistics.budgetedByCurrency).length === 0 && (
              <p className="text-lg font-bold text-gray-400">--</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Gastado</p>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
          <div className="space-y-1">
            {Object.entries(statistics.spentByCurrency).map(([currency, amount]) => (
              <div key={currency} className="flex items-baseline justify-between">
                <span className="text-xs text-gray-500">{currency}:</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(amount, currency as any)}
                </span>
              </div>
            ))}
            {Object.keys(statistics.spentByCurrency).length === 0 && (
              <p className="text-lg font-bold text-gray-400">--</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Restante</p>
            <TrendingDown className="w-8 h-8 text-green-500" />
          </div>
          <div className="space-y-1">
            {Object.entries(statistics.remainingByCurrency).map(([currency, amount]) => (
              <div key={currency} className="flex items-baseline justify-between">
                <span className="text-xs text-gray-500">{currency}:</span>
                <span className={`text-lg font-bold ${amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(amount, currency as any)}
                </span>
              </div>
            ))}
            {Object.keys(statistics.remainingByCurrency).length === 0 && (
              <p className="text-lg font-bold text-gray-400">--</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">% Utilizado</p>
              <p className={`text-2xl font-bold mt-1 ${getBudgetStatusColor(statistics.percentageUsed).split(' ')[0]}`}>
                {statistics.percentageUsed.toFixed(1)}%
              </p>
            </div>
            <AlertCircle className={`w-10 h-10 ${statistics.percentageUsed >= 80 ? 'text-red-500' : 'text-green-500'}`} />
          </div>
          {statistics.itemsOverBudget > 0 && (
            <p className="text-xs text-red-600 mt-2">
              {statistics.itemsOverBudget} línea{statistics.itemsOverBudget > 1 ? 's' : ''} excedida{statistics.itemsOverBudget > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Budget Items List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">Detalle por Línea Presupuestaria</h4>
        </div>

        <div className="divide-y divide-gray-100">
          {!budgetItems || budgetItems.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No hay líneas presupuestarias disponibles
            </div>
          ) : (
            budgetItems.map((item) => {
              const itemCosts = statistics.costsByBudgetItem.get(item.id) || [];
              const spent = itemCosts.reduce((sum, c) => sum + c.amount, 0);
              const remaining = item.budgetedAmount - spent;
              const percentage = calculateBudgetUsagePercentage(spent, item.budgetedAmount);
              const isExpanded = expandedItems.has(item.id);

              return (
                <div key={item.id} className="px-6 py-4">
                  <div className="flex items-center justify-between -mx-6 px-6 py-2 rounded">
                    <div 
                      className="flex items-center space-x-3 flex-1 cursor-pointer hover:bg-gray-50 py-2 -my-2 rounded"
                      onClick={() => toggleExpanded(item.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{item.cuenta}</span>
                          {item.name && (
                            <span className="text-gray-600">- {item.name}</span>
                          )}
                          <span className="text-xs text-gray-500">
                            ({getMonthName(item.month)})
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Presupuestado</p>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(item.budgetedAmount, item.currency)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Gastado</p>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(spent, item.currency)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Restante</p>
                        <p className={`font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(remaining, item.currency)}
                        </p>
                      </div>
                      <div className="w-24">
                        <div className="flex items-center justify-end space-x-2">
                          <span className={`text-sm font-semibold ${percentage >= 100 ? 'text-red-600' : percentage >= 80 ? 'text-orange-600' : 'text-green-600'}`}>
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${percentage >= 100 ? 'bg-red-500' : percentage >= 80 ? 'bg-orange-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="relative z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleAddCostToBudgetItem(item);
                          }}
                          className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm whitespace-nowrap"
                          title={`Agregar gasto a ${item.cuenta}`}
                          type="button"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Agregar Gasto</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded costs list */}
                  {isExpanded && (
                    <div className="mt-4 ml-8 space-y-2">
                      {itemCosts.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No hay gastos registrados</p>
                      ) : (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-700">Gastos registrados:</h5>
                          {itemCosts.map((cost) => (
                            <div
                              key={cost.id}
                              className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{cost.title}</p>
                                {cost.description && (
                                  <p className="text-sm text-gray-600 mt-1">{cost.description}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(cost.createdAt).toLocaleDateString('es-AR')}
                                  {cost.createdBy && ` - ${cost.createdBy.first_name} ${cost.createdBy.last_name}`}
                                </p>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="font-semibold text-gray-900">
                                  {formatCurrency(cost.amount, cost.currency)}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingCost(cost);
                                    setShowCreateModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                  title="Editar gasto"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCost(cost.id);
                                  }}
                                  className="text-red-600 hover:text-red-800 p-1"
                                  title="Eliminar gasto"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create/Edit Cost Modal */}
      {showCreateModal && (
        <CreateCostModal
          open={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingCost(null);
            setSelectedBudgetItem(null);
          }}
          areaYearId={Number(areaYearId)}
          budgetItems={budgetItems || []}
          userId={user ? Number(user.id) : 1}
          editingCost={editingCost}
          preSelectedBudgetItem={selectedBudgetItem}
          onSuccess={handleCostCreatedOrUpdated}
        />
      )}
    </div>
  );
}

