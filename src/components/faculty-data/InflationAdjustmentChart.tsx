"use client"
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Percent, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface BudgetDataItem {
  'Grupo Cuenta': string;
  'Denominacion': string;
  'Cuenta': number;
  'Moneda': string;
  'Descripción/detalle': string;
  'Nuevo/Corriente': string;
  'Jan-24': number | string;
  'Feb-24': number | string;
  'Mar-24': number | string;
  'Apr-24': number | string;
  'May-24': number | string;
  'Jun-24': number | string;
  'Jul-24': number | string;
  'Aug-24': number | string;
  'Sep-24': number | string;
  'Oct-24': number | string;
  'Nov-24': number | string;
  'Dec-24': number | string;
  'Tot': number;
}

interface BudgetProcessorResponse {
  success: boolean;
  data: BudgetDataItem[];
  columns: string[];
  row_count: number;
}

interface InflationAdjustmentChartProps {
  filePath?: string;
  conversionRates?: { [key: string]: number };
}

const MONTH_COLUMNS = [
  'Jan-24', 'Feb-24', 'Mar-24', 'Apr-24', 'May-24', 'Jun-24',
  'Jul-24', 'Aug-24', 'Sep-24', 'Oct-24', 'Nov-24', 'Dec-24'
];

const MONTH_LABELS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

const DEFAULT_CONVERSION_RATES = {
  'USD': 1050,
  'EUR': 1150,
  'Pesos': 1,
  'ARS': 1,
};

export default function InflationAdjustmentChart({ 
  filePath = '/app/storage/files/4/armado/Modelo presupuestario 2024 Bioterio - Gallo (Versión Final).xlsx',
  conversionRates = DEFAULT_CONVERSION_RATES
}: InflationAdjustmentChartProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [globalInflation, setGlobalInflation] = useState<number>(0);
  const [monthlyInflation, setMonthlyInflation] = useState<number[]>(new Array(12).fill(0));
  const [useGlobalInflation, setUseGlobalInflation] = useState(true);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchBudgetData() {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_SERVICE_URL ?? '';
        
        const response = await fetch(`${API_BASE_URL}/api/budget-processor/process/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file_path: filePath })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const result: BudgetProcessorResponse = await response.json();

        if (!mounted) return;

        if (!result.success || !result.data) {
          throw new Error('Invalid response from budget processor');
        }

        // Process data - convert all to ARS
        const processedData = prepareARSData(result.data);
        setOriginalData(processedData);
        
      } catch (err: any) {
        if (!mounted) return;
        console.error('Error fetching budget data:', err);
        setError(err.message || 'Failed to load budget data');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    fetchBudgetData();
    return () => { mounted = false; };
  }, [filePath]);

  const prepareARSData = (data: BudgetDataItem[]) => {
    return MONTH_COLUMNS.map((monthCol, index) => {
      let totalARS = 0;
      
      data.forEach(item => {
        const currency = item['Moneda'];
        const value = item[monthCol as keyof BudgetDataItem];
        const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
        const rate = conversionRates[currency as keyof typeof conversionRates] || 1;
        totalARS += numValue * rate;
      });
      
      return {
        month: MONTH_LABELS[index],
        monthIndex: index,
        original: totalARS
      };
    });
  };

  const getAdjustedData = () => {
    let cumulativeMultiplier = 1;
    
    return originalData.map((item, index) => {
      const inflationRate = useGlobalInflation ? globalInflation : (monthlyInflation[index] || 0);
      
      // Apply cumulative inflation: each month builds on the previous month's inflated value
      cumulativeMultiplier *= (1 + inflationRate / 100);
      const adjusted = item.original * cumulativeMultiplier;
      const difference = adjusted - item.original;
      const percentChange = item.original > 0 ? ((difference / item.original) * 100) : 0;
      
      return {
        ...item,
        inflationRate,
        adjusted,
        difference,
        percentChange,
        cumulativeInflation: (cumulativeMultiplier - 1) * 100 // Total accumulated inflation %
      };
    });
  };

  const handleGlobalInflationChange = (value: string) => {
    const num = parseFloat(value) || 0;
    setGlobalInflation(num);
  };

  const handleMonthlyInflationChange = (index: number, value: string) => {
    const num = parseFloat(value) || 0;
    const newInflation = [...monthlyInflation];
    newInflation[index] = num;
    setMonthlyInflation(newInflation);
  };

  const handleApplyGlobalToAll = () => {
    setMonthlyInflation(new Array(12).fill(globalInflation));
    setUseGlobalInflation(false);
  };

  const handleReset = () => {
    setGlobalInflation(0);
    setMonthlyInflation(new Array(12).fill(0));
    setUseGlobalInflation(true);
  };

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatNumber = (value: number): string => {
    return value.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg p-2">
              <Percent className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Proyección con Ajuste por Inflación</h3>
              <p className="text-sm text-blue-100">Cálculo basado en valores en Pesos Argentinos (ARS)</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-64 p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-gray-600 font-medium">Cargando datos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg p-2">
              <Percent className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Proyección con Ajuste por Inflación</h3>
              <p className="text-sm text-blue-100">Cálculo basado en valores en Pesos Argentinos (ARS)</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-5">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-red-800 font-semibold mb-1">Error al cargar datos</h4>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const adjustedData = getAdjustedData();
  const totalOriginal = adjustedData.reduce((sum, item) => sum + item.original, 0);
  const totalAdjusted = adjustedData.reduce((sum, item) => sum + item.adjusted, 0);
  const totalDifference = totalAdjusted - totalOriginal;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-gray-100 rounded-t-lg px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-lg p-2">
                <Percent className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Proyección con Ajuste por Inflación</h3>
                <p className="text-sm text-blue-400">Cálculo basado en valores en Pesos Argentinos (ARS)</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg transition-colors text-white"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm font-medium">Resetear</span>
            </button>
          </div>
        </div>

        {/* Inflation Controls */}
        <div className="p-6 space-y-6">
          {/* Tab-style toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setUseGlobalInflation(true)}
              className={`flex-1 px-4 py-2.5 rounded-md font-medium transition-all duration-200 ${
                useGlobalInflation
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Inflación Global
            </button>
            <button
              onClick={() => setUseGlobalInflation(false)}
              className={`flex-1 px-4 py-2.5 rounded-md font-medium transition-all duration-200 ${
                !useGlobalInflation
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Inflación por Mes
            </button>
          </div>

          {useGlobalInflation ? (
            <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
              <div className="flex items-end space-x-4">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Tasa de Inflación Mensual (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={globalInflation}
                      onChange={(e) => handleGlobalInflationChange(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-semibold text-lg"
                      step="0.1"
                      placeholder="Ej: 5.5"
                    />
                    <span className="absolute right-4 top-3.5 text-blue-600 font-semibold">%</span>
                  </div>
                </div>
                <button
                  onClick={handleApplyGlobalToAll}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  Aplicar a Todos los Meses
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {MONTH_LABELS.map((month, index) => (
                  <div key={month} className="bg-white rounded-lg p-3 border border-gray-200">
                    <label className="text-xs font-semibold text-gray-600 mb-2 block uppercase tracking-wide">{month}</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={monthlyInflation[index]}
                        onChange={(e) => handleMonthlyInflationChange(index, e.target.value)}
                        className="w-full pl-3 pr-8 py-2 text-sm border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
                        step="0.1"
                      />
                      <span className="absolute right-2 top-2 text-xs text-gray-500 font-medium">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">Comparación: Original vs Ajustado por Inflación</h4>
        </div>
        
        <div className="p-6">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={adjustedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
                <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip 
                  formatter={(value: number) => `$ ${formatNumber(value)}`}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="original"
                  name="Presupuesto Original (ARS)"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="adjusted"
                  name="Ajustado por Inflación (ARS)"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <div className="relative z-10">
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Total Original</div>
                <div className="text-2xl font-bold text-blue-700">$ {formatNumber(totalOriginal)}</div>
              </div>
              <div className="absolute -right-4 -bottom-4 text-blue-200 opacity-20">
                <TrendingUp className="w-24 h-24" />
              </div>
            </div>
            <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border border-red-200">
              <div className="relative z-10">
                <div className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Total Ajustado</div>
                <div className="text-2xl font-bold text-red-700">$ {formatNumber(totalAdjusted)}</div>
              </div>
              <div className="absolute -right-4 -bottom-4 text-red-200 opacity-20">
                <TrendingUp className="w-24 h-24" />
              </div>
            </div>
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200">
              <div className="relative z-10">
                <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Diferencia Total</div>
                <div className="text-2xl font-bold text-indigo-700">
                  {totalDifference >= 0 ? '+' : ''} $ {formatNumber(totalDifference)}
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 text-indigo-200 opacity-20">
                <Percent className="w-24 h-24" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowTable(!showTable)}
          className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200"
        >
          <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
            <span>Tabla Detallada de Ajustes</span>
          </h4>
          {showTable ? 
            <ChevronUp className="w-5 h-5 text-gray-600" /> : 
            <ChevronDown className="w-5 h-5 text-gray-600" />
          }
        </button>

        {showTable && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mes</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Inflación Mensual</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Inflación Acum.</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Original (ARS)</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Ajustado (ARS)</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Diferencia</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">% Cambio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {adjustedData.map((item, index) => (
                  <tr key={item.month} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.month}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-700 font-medium">
                      {item.inflationRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-indigo-600">
                      {item.cumulativeInflation.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-blue-600">
                      $ {formatNumber(item.original)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-red-600">
                      $ {formatNumber(item.adjusted)}
                    </td>
                    <td className={`px-6 py-4 text-sm text-right font-semibold ${item.difference >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {item.difference >= 0 ? '+' : ''} $ {formatNumber(item.difference)}
                    </td>
                    <td className={`px-6 py-4 text-sm text-right font-bold ${item.percentChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {item.percentChange >= 0 ? '+' : ''}{item.percentChange.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">TOTAL</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">-</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">-</td>
                  <td className="px-4 py-3 text-sm text-right text-blue-700">
                    $ {formatNumber(totalOriginal)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-red-700">
                    $ {formatNumber(totalAdjusted)}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right ${totalDifference >= 0 ? 'text-red-700' : 'text-green-700'}`}>
                    {totalDifference >= 0 ? '+' : ''} $ {formatNumber(totalDifference)}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right ${totalDifference >= 0 ? 'text-red-700' : 'text-green-700'}`}>
                    {totalOriginal > 0 ? `${((totalDifference / totalOriginal) * 100).toFixed(2)}%` : '0%'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

