import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface MonthlyData {
  categories: string[];
  original_values: number[];
  modified_values: number[];
  chart_type: string;
}

interface InflationScenarioData {
  is_inflation_scenario: boolean;
  monthly: MonthlyData;
}

interface MonthlyInflationChartProps {
  scenarioData: InflationScenarioData;
}

const MonthlyInflationChart: React.FC<MonthlyInflationChartProps> = ({ scenarioData }) => {
  console.log('MonthlyInflationChart received scenarioData:', scenarioData);
  
  // Validate data
  if (!scenarioData || !scenarioData.monthly || !scenarioData.monthly.categories) {
    console.log('Invalid or empty scenario data received');
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-3">
        <p className="text-red-700 text-sm">Monthly inflation data is not available or invalid</p>
      </div>
    );
  }

  const { monthly } = scenarioData;

  // Transform data for the chart
  const transformedData = monthly.categories.map((month, index) => ({
    month: month,
    original: monthly.original_values[index],
    modified: monthly.modified_values[index],
    difference: monthly.modified_values[index] - monthly.original_values[index],
  }));

  console.log('Transformed monthly data for chart:', transformedData);

  // Format large numbers
  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  // Calculate percentage change
  const formatPercentage = (original: number, modified: number) => {
    const change = ((modified - original) / original) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-3 border">
      <h4 className="text-sm font-semibold text-gray-800 mb-4">
        📊 Escenario de Inflación - Comparación Mensual
      </h4>
      
      {/* Line Chart for Original vs Modified Values */}
      <div className="mb-6">
        <h5 className="text-xs font-medium text-gray-600 mb-2">
          Valores Originales vs Modificados por Inflación
        </h5>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={transformedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 9 }}
              stroke="#6b7280"
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tickFormatter={formatValue}
              tick={{ fontSize: 10 }}
              stroke="#6b7280"
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                formatValue(value), 
                name === 'original' ? 'Original' : 'Con Inflación'
              ]}
              labelFormatter={(label) => `Mes: ${label}`}
              contentStyle={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Line 
              type="monotone" 
              dataKey="original" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Original"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="modified" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Con Inflación"
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <h6 className="text-xs font-medium text-blue-800 mb-1">Total Original</h6>
          <p className="text-sm font-semibold text-blue-900">
            {formatValue(monthly.original_values.reduce((a, b) => a + b, 0))}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <h6 className="text-xs font-medium text-red-800 mb-1">Total con Inflación</h6>
          <p className="text-sm font-semibold text-red-900">
            {formatValue(monthly.modified_values.reduce((a, b) => a + b, 0))}
          </p>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1 text-left font-medium text-gray-700">Mes</th>
              <th className="px-2 py-1 text-right font-medium text-gray-700">Original</th>
              <th className="px-2 py-1 text-right font-medium text-gray-700">Con Inflación</th>
              <th className="px-2 py-1 text-right font-medium text-gray-700">Diferencia</th>
              <th className="px-2 py-1 text-right font-medium text-gray-700">% Cambio</th>
            </tr>
          </thead>
          <tbody>
            {transformedData.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="px-2 py-1 font-medium text-gray-800">{item.month}</td>
                <td className="px-2 py-1 text-right text-blue-600">{formatValue(item.original)}</td>
                <td className="px-2 py-1 text-right text-red-600">{formatValue(item.modified)}</td>
                <td className={`px-2 py-1 text-right font-medium ${
                  item.difference > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {item.difference > 0 ? '+' : ''}{formatValue(item.difference)}
                </td>
                <td className={`px-2 py-1 text-right font-medium text-xs ${
                  item.difference > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatPercentage(item.original, item.modified)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyInflationChart; 