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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h4 className="font-semibold text-gray-900">Ajuste por Inflación</h4>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Cargando datos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h4 className="font-semibold text-gray-900">Ajuste por Inflación</h4>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">Error al cargar datos: {error}</p>
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
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Percent className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Proyección con Ajuste por Inflación (Solo ARS)</h3>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm font-medium">Resetear</span>
          </button>
        </div>

        {/* Inflation Controls */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={useGlobalInflation}
                onChange={() => setUseGlobalInflation(true)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="font-medium">Inflación Global</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={!useGlobalInflation}
                onChange={() => setUseGlobalInflation(false)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="font-medium">Inflación por Mes</span>
            </label>
          </div>

          {useGlobalInflation ? (
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Tasa de Inflación Mensual (%)
                </label>
                <input
                  type="number"
                  value={globalInflation}
                  onChange={(e) => handleGlobalInflationChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-medium"
                  step="0.1"
                  placeholder="Ej: 5.5"
                />
              </div>
              <button
                onClick={handleApplyGlobalToAll}
                className="mt-6 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Aplicar a Todos los Meses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {MONTH_LABELS.map((month, index) => (
                <div key={month}>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">{month}</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={monthlyInflation[index]}
                      onChange={(e) => handleMonthlyInflationChange(index, e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 text-gray-900"
                      step="0.1"
                    />
                    <span className="absolute right-2 top-1 text-xs text-gray-500">%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Comparación: Original vs Ajustado por Inflación</h4>
        
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
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="original"
                name="Presupuesto Original (ARS)"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="adjusted"
                name="Ajustado por Inflación (ARS)"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-1">Total Original</div>
            <div className="text-2xl font-bold text-blue-700">$ {formatNumber(totalOriginal)}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="text-sm text-red-600 font-medium mb-1">Total Ajustado</div>
            <div className="text-2xl font-bold text-red-700">$ {formatNumber(totalAdjusted)}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-sm text-purple-600 font-medium mb-1">Diferencia Total</div>
            <div className="text-2xl font-bold text-purple-700">
              {totalDifference >= 0 ? '+' : ''} $ {formatNumber(totalDifference)}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <button
          onClick={() => setShowTable(!showTable)}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 mb-4"
        >
          {showTable ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          <h4 className="font-semibold text-gray-900">Tabla Detallada de Ajustes</h4>
        </button>

        {showTable && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mes</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Inflación Mensual</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Inflación Acum.</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Original (ARS)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ajustado (ARS)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Diferencia</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">% Cambio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {adjustedData.map((item, index) => (
                  <tr key={item.month} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.month}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">
                      {item.inflationRate.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-purple-600">
                      {item.cumulativeInflation.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-blue-600">
                      $ {formatNumber(item.original)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                      $ {formatNumber(item.adjusted)}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${item.difference >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {item.difference >= 0 ? '+' : ''} $ {formatNumber(item.difference)}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-semibold ${item.percentChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
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

