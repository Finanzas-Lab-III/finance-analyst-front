"use client"
import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, DollarSign, Euro, Banknote, Settings } from 'lucide-react';
import { processBudgetFile, BudgetProcessorResponse } from "@/lib/budget-api";

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

// Response type is imported from budget-api

interface MonthlyBudgetByCurrencyChartProps {
  areaYearId: number;
}

const MONTH_COLUMNS = [
  'Jan-24', 'Feb-24', 'Mar-24', 'Apr-24', 'May-24', 'Jun-24',
  'Jul-24', 'Aug-24', 'Sep-24', 'Oct-24', 'Nov-24', 'Dec-24'
];

const MONTH_LABELS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

const CURRENCY_COLORS: { [key: string]: string } = {
  'USD': '#2563eb',  // Blue
  'Pesos': '#16a34a', // Green
  'EUR': '#f59e0b',  // Amber
  'ARS': '#10b981',  // Emerald
  'default': '#6b7280' // Gray
};

// Default conversion rates to ARS
const DEFAULT_CONVERSION_RATES = {
  'USD': 1050,
  'EUR': 1150,
  'Pesos': 1,
  'ARS': 1,
};

export default function MonthlyBudgetByCurrencyChart({ 
  areaYearId
}: MonthlyBudgetByCurrencyChartProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [currencyData, setCurrencyData] = useState<{ [key: string]: any[] }>({});
  const [conversionRates, setConversionRates] = useState(DEFAULT_CONVERSION_RATES);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchBudgetData() {
      try {
        const result: BudgetProcessorResponse = await processBudgetFile(areaYearId);

        if (!mounted) return;

        if (!result.success || !result.data) {
          throw new Error('Invalid response from budget processor');
        }

        // Process data to group by month and currency
        const processedData = prepareChartData(result.data);
        setCurrencies(processedData.currencies);
        setCurrencyData(processedData.currencyData);
        
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
  }, [areaYearId]);

  const prepareChartData = (data: BudgetDataItem[]) => {
    // Get unique currencies
    const uniqueCurrencies = [...new Set(data.map(item => item['Moneda']))].filter(Boolean);

    // Prepare separate data for each currency
    const currencySpecificData: { [key: string]: any[] } = {};
    
    uniqueCurrencies.forEach(currency => {
      const monthlyData = MONTH_COLUMNS.map((monthCol, index) => {
        const total = data
          .filter(item => item['Moneda'] === currency)
          .reduce((sum, item) => {
            const value = item[monthCol as keyof BudgetDataItem];
            const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
            return sum + numValue;
          }, 0);
        
        return {
          month: MONTH_LABELS[index],
          amount: total
        };
      });
      
      currencySpecificData[currency] = monthlyData;
    });

    return {
      currencyData: currencySpecificData,
      currencies: uniqueCurrencies
    };
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

  // Calculate combined data in ARS
  const getCombinedARSData = () => {
    const combinedData = MONTH_LABELS.map((month, index) => {
      let totalARS = 0;
      
      currencies.forEach(currency => {
        const monthData = currencyData[currency]?.[index];
        if (monthData) {
          const rate = conversionRates[currency as keyof typeof conversionRates] || 1;
          totalARS += monthData.amount * rate;
        }
      });
      
      return {
        month,
        totalARS
      };
    });
    
    return combinedData;
  };

  const handleConversionRateChange = (currency: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setConversionRates(prev => ({
      ...prev,
      [currency]: numValue
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h4 className="font-semibold text-gray-900">Presupuesto Mensual por Moneda</h4>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Cargando gráfico...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h4 className="font-semibold text-gray-900">Presupuesto Mensual por Moneda</h4>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">Error al cargar el gráfico: {error}</p>
        </div>
      </div>
    );
  }

  if (currencies.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h4 className="font-semibold text-gray-900">Presupuesto Mensual por Moneda</h4>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">No hay datos disponibles para mostrar.</p>
        </div>
      </div>
    );
  }

  const combinedARSData = getCombinedARSData();
  const getCurrencyIcon = (currency: string) => {
    switch (currency.toUpperCase()) {
      case 'USD':
        return <DollarSign className="w-4 h-4" />;
      case 'EUR':
        return <Euro className="w-4 h-4" />;
      default:
        return <Banknote className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Conversion Rate Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
        >
          <Settings className="w-5 h-5" />
          <span className="font-semibold">Configuración de Tasas de Cambio</span>
        </button>
        
        {showSettings && (
           <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
             {currencies.filter(c => c !== 'Pesos' && c !== 'ARS').map((currency) => (
               <div key={currency} className="flex flex-col">
                 <label className="text-sm font-medium text-gray-700 mb-1">
                   {currency} a ARS
                 </label>
                 <input
                   type="number"
                   value={conversionRates[currency as keyof typeof conversionRates] || 0}
                   onChange={(e) => handleConversionRateChange(currency, e.target.value)}
                   className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                   step="0.01"
                   min="0"
                 />
               </div>
             ))}
           </div>
        )}
      </div>

      {/* Main Chart - Combined in ARS */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Presupuesto Total Mensual (Convertido a Pesos Argentinos)</h3>
        </div>
        
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={combinedARSData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip 
                formatter={(value: number) => `${formatCurrency(value)} ARS`}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar
                dataKey="totalARS"
                name="Total en ARS"
                fill="#3b82f6"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
          <div className="text-sm text-gray-600 mb-2">Total Anual (ARS)</div>
          <div className="text-3xl font-bold text-blue-600">
            {formatCurrency(combinedARSData.reduce((sum, m) => sum + m.totalARS, 0))}
          </div>
        </div>
      </div>

      {/* Individual Currency Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currencies.map((currency) => {
          const data = currencyData[currency] || [];
          const total = data.reduce((sum, m) => sum + m.amount, 0);
          
          return (
            <div key={currency} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                {getCurrencyIcon(currency)}
                <h4 className="font-semibold text-gray-900">Presupuesto en {currency}</h4>
              </div>
              
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 11 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      tickFormatter={formatCurrency}
                      tick={{ fontSize: 11 }}
                      stroke="#6b7280"
                    />
                    <Tooltip 
                      formatter={(value: number) => `${formatCurrency(value)} ${currency}`}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '11px'
                      }}
                    />
                    <Bar
                      dataKey="amount"
                      name={currency}
                      fill={CURRENCY_COLORS[currency] || CURRENCY_COLORS.default}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Anual</span>
                <span 
                  className="text-xl font-bold"
                  style={{ color: CURRENCY_COLORS[currency] || CURRENCY_COLORS.default }}
                >
                  {formatCurrency(total)} {currency}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

