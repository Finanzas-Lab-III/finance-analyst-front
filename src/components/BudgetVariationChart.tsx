"use client"
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

interface MonthlyBudgetVariation {
  month: string;
  directory_exists: boolean;
  files_found: number;
  total_budgeted: number;
  total_spent: number;
  difference: number;
  errors: string[];
}

interface BudgetVariationChartProps {
  data: { [key: string]: MonthlyBudgetVariation };
  formatCurrency: (amount: number) => string;
}

const monthOrder = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const BudgetVariationChart: React.FC<BudgetVariationChartProps> = ({ data, formatCurrency }) => {
  // Transform data into the format expected by Recharts
  const chartData = monthOrder.map(month => {
    const monthData = data[month] || {};
    return {
      month,
      total_budgeted: monthData.total_budgeted ?? 0,
      total_spent: monthData.total_spent ?? 0,
      difference: monthData.difference ?? 0,
      files_found: monthData.files_found ?? 0,
      directory_exists: monthData.directory_exists ?? false,
      errors: monthData.errors ?? []
    };
  });

  return (
    <div className="w-full bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Variación Presupuestaria Mensual</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              tickFormatter={(value: string) => {
                if (typeof value === 'string') {
                  return value.substring(0, 3);
                }
                return value;
              }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => label.charAt(0).toUpperCase() + label.slice(1)}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="total_budgeted"
              name="Presupuestado"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="total_spent"
              name="Gastado"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <h6 className="text-xs font-medium text-blue-800 mb-1">Total Presupuestado</h6>
          <p className="text-sm font-semibold text-blue-900">
            {formatCurrency(chartData.reduce((sum, item) => sum + item.total_budgeted, 0))}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <h6 className="text-xs font-medium text-red-800 mb-1">Total Gastado</h6>
          <p className="text-sm font-semibold text-red-900">
            {formatCurrency(chartData.reduce((sum, item) => sum + item.total_spent, 0))}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <h6 className="text-xs font-medium text-gray-800 mb-1">Diferencia Total</h6>
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(chartData.reduce((sum, item) => sum + item.difference, 0))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetVariationChart;
