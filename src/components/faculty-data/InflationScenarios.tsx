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
import { TrendingUp, Calculator, Lock, Unlock } from 'lucide-react';

interface InflationScenariosProps {
  budgetData?: any[];
}

const MONTH_LABELS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

const DEFAULT_MONTHLY_INFLATION = 4.5; // Default 4.5% monthly

export default function InflationScenarios({ budgetData }: InflationScenariosProps) {
  const [useUniformRate, setUseUniformRate] = useState(true);
  const [uniformRate, setUniformRate] = useState(DEFAULT_MONTHLY_INFLATION);
  const [monthlyRates, setMonthlyRates] = useState<number[]>(
    Array(12).fill(DEFAULT_MONTHLY_INFLATION)
  );
  const [projectionData, setProjectionData] = useState<any[]>([]);

  // Mock base budget per month (you can replace this with real data)
  const baseBudget = [
    5000000, 4800000, 5200000, 4900000, 5100000, 5300000,
    5400000, 5200000, 5600000, 5500000, 5700000, 5800000
  ];

  useEffect(() => {
    calculateProjections();
  }, [uniformRate, monthlyRates, useUniformRate]);

  const calculateProjections = () => {
    const rates = useUniformRate 
      ? Array(12).fill(uniformRate)
      : monthlyRates;

    let cumulativeInflation = 1;
    const projections = baseBudget.map((budget, index) => {
      const monthRate = rates[index] / 100;
      cumulativeInflation *= (1 + monthRate);
      
      const adjustedBudget = budget * cumulativeInflation;
      const inflationImpact = adjustedBudget - budget;

      return {
        month: MONTH_LABELS[index],
        baseBudget: budget,
        adjustedBudget: adjustedBudget,
        inflationImpact: inflationImpact,
        inflationRate: rates[index],
        cumulativeInflationPercent: (cumulativeInflation - 1) * 100
      };
    });

    setProjectionData(projections);
  };

  const handleUniformRateChange = (value: string) => {
    const rate = parseFloat(value) || 0;
    setUniformRate(rate);
  };

  const handleMonthlyRateChange = (index: number, value: string) => {
    const rate = parseFloat(value) || 0;
    const newRates = [...monthlyRates];
    newRates[index] = rate;
    setMonthlyRates(newRates);
  };

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    }
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const totalBaseBudget = projectionData.reduce((sum, m) => sum + m.baseBudget, 0);
  const totalAdjustedBudget = projectionData.reduce((sum, m) => sum + m.adjustedBudget, 0);
  const totalInflationImpact = totalAdjustedBudget - totalBaseBudget;
  const averageInflationRate = useUniformRate 
    ? uniformRate 
    : monthlyRates.reduce((sum, r) => sum + r, 0) / 12;

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calculator className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Escenarios de Inflación</h3>
        </div>

        {/* Toggle between uniform and custom rates */}
        <div className="mb-6 flex items-center space-x-4">
          <button
            onClick={() => setUseUniformRate(true)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              useUniformRate
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Tasa Uniforme</span>
          </button>
          <button
            onClick={() => setUseUniformRate(false)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              !useUniformRate
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Unlock className="w-4 h-4" />
            <span>Tasas Mensuales Personalizadas</span>
          </button>
        </div>

        {/* Uniform Rate Input */}
        {useUniformRate && (
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inflación Mensual Uniforme (%)
            </label>
            <input
              type="number"
              value={uniformRate}
              onChange={(e) => handleUniformRateChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold text-lg"
              step="0.1"
              min="0"
              max="100"
            />
            <p className="text-sm text-gray-600 mt-2">
              Esta tasa se aplicará a todos los meses del año
            </p>
          </div>
        )}

        {/* Monthly Rates Grid */}
        {!useUniformRate && (
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tasas de Inflación Mensuales (%)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {MONTH_LABELS.map((month, index) => (
                <div key={month} className="flex flex-col">
                  <label className="text-xs font-medium text-gray-600 mb-1">
                    {month}
                  </label>
                  <input
                    type="number"
                    value={monthlyRates[index]}
                    onChange={(e) => handleMonthlyRateChange(index, e.target.value)}
                    className="px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-medium text-sm"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border-2 border-blue-200 p-4">
          <div className="text-xs text-gray-500 uppercase mb-1">Presupuesto Base</div>
          <div className="text-xl font-bold text-blue-600">
            {formatCurrency(totalBaseBudget)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border-2 border-green-200 p-4">
          <div className="text-xs text-gray-500 uppercase mb-1">Presupuesto Ajustado</div>
          <div className="text-xl font-bold text-green-600">
            {formatCurrency(totalAdjustedBudget)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border-2 border-red-200 p-4">
          <div className="text-xs text-gray-500 uppercase mb-1">Impacto de Inflación</div>
          <div className="text-xl font-bold text-red-600">
            +{formatCurrency(totalInflationImpact)}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border-2 border-purple-200 p-4">
          <div className="text-xs text-gray-500 uppercase mb-1">Inflación Promedio</div>
          <div className="text-xl font-bold text-purple-600">
            {averageInflationRate.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Line Chart - Budget Projections */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h4 className="font-semibold text-gray-900">Proyección de Presupuesto con Inflación</h4>
        </div>
        
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData}>
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
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="baseBudget"
                name="Presupuesto Base"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="adjustedBudget"
                name="Presupuesto Ajustado"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Detalle Mensual</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Mes</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Tasa (%)</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Base</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Ajustado</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Impacto</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Inflación Acum.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projectionData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.month}</td>
                  <td className="px-4 py-3 text-right text-purple-600 font-semibold">
                    {row.inflationRate.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right text-blue-600">
                    {formatCurrency(row.baseBudget)}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600 font-semibold">
                    {formatCurrency(row.adjustedBudget)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600">
                    +{formatCurrency(row.inflationImpact)}
                  </td>
                  <td className="px-4 py-3 text-right text-purple-600 font-semibold">
                    {row.cumulativeInflationPercent.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

