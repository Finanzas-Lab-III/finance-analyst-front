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

interface BudgetVariationChartProps {
  formatCurrency: (amount: number) => string;
}

const monthOrder = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

// Mocked data with reduced budgets (enero through septiembre):
// Total budgeted: $43,200,000,000 (reduced to bring closer to spent)
// Total spent: $36,534,054,212
const mockMonthlyData = [
  { month: 'enero', total_budgeted: 4752134591, total_spent: 3892672690 },
  { month: 'febrero', total_budgeted: 4798453312, total_spent: 4058394521 },
  { month: 'marzo', total_budgeted: 4865123409, total_spent: 4211567832 },
  { month: 'abril', total_budgeted: 4776892145, total_spent: 4015238447 },
  { month: 'mayo', total_budgeted: 4817245673, total_spent: 4098542219 },
  { month: 'junio', total_budgeted: 4785334398, total_spent: 3985126754 },
  { month: 'julio', total_budgeted: 4794321087, total_spent: 4042371865 },
  { month: 'agosto', total_budgeted: 4843567821, total_spent: 4110294332 },
  { month: 'septiembre', total_budgeted: 4796624734, total_spent: 4119845552 },
  { month: 'octubre', total_budgeted: 0, total_spent: 0 },
  { month: 'noviembre', total_budgeted: 0, total_spent: 0 },
  { month: 'diciembre', total_budgeted: 0, total_spent: 0 }
];

const BudgetVariationChart: React.FC<BudgetVariationChartProps> = ({ formatCurrency }) => {
  // Use mocked data and calculate differences
  const chartData = mockMonthlyData.map(item => ({
    ...item,
    difference: item.total_budgeted - item.total_spent
  }));

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
