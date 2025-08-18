"use client"
import React, { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar,
  Download,
  Filter
} from "lucide-react";

const monthlyData = [
  { month: 'Ene', budgets: 12, amount: 2400000 },
  { month: 'Feb', budgets: 15, amount: 3100000 },
  { month: 'Mar', budgets: 8, amount: 1800000 },
  { month: 'Abr', budgets: 18, amount: 4200000 },
  { month: 'May', budgets: 22, amount: 5100000 },
  { month: 'Jun', budgets: 19, amount: 4800000 },
];

const facultyData = [
  { name: 'Ingeniería', budgets: 32, amount: 15200000, color: 'bg-blue-500' },
  { name: 'Medicina', budgets: 12, amount: 8500000, color: 'bg-green-500' },
  { name: 'Ciencias', budgets: 8, amount: 4200000, color: 'bg-purple-500' },
  { name: 'Humanidades', budgets: 6, amount: 2800000, color: 'bg-yellow-500' },
];

const statusData = [
  { status: 'Aprobados', count: 24, percentage: 50, color: 'bg-green-500' },
  { status: 'En Revisión', count: 12, percentage: 25, color: 'bg-blue-500' },
  { status: 'Pendientes', count: 8, percentage: 17, color: 'bg-yellow-500' },
  { status: 'Rechazados', count: 4, percentage: 8, color: 'bg-red-500' },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedFaculty, setSelectedFaculty] = useState('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalAmount = facultyData.reduce((sum, faculty) => sum + faculty.amount, 0);
  const totalBudgets = facultyData.reduce((sum, faculty) => sum + faculty.budgets, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Análisis y Estadísticas</h1>
            <p className="text-gray-600">Análisis detallado del estado de los presupuestos</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="3months">Últimos 3 meses</option>
              <option value="6months">Últimos 6 meses</option>
              <option value="1year">Último año</option>
              <option value="2years">Últimos 2 años</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-5 h-5" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Presupuestos</p>
              <p className="text-3xl font-bold text-gray-900">{totalBudgets}</p>
              <p className="text-sm text-green-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12% vs período anterior
              </p>
            </div>
            <BarChart3 className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monto Total</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
              <p className="text-sm text-green-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8.5% vs período anterior
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Promedio por Presupuesto</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalAmount / totalBudgets)}</p>
              <p className="text-sm text-red-600 flex items-center">
                <TrendingDown className="w-4 h-4 mr-1" />
                -2.1% vs período anterior
              </p>
            </div>
            <PieChart className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tiempo Promedio Aprobación</p>
              <p className="text-3xl font-bold text-gray-900">14 días</p>
              <p className="text-sm text-green-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                -3 días vs período anterior
              </p>
            </div>
            <Calendar className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tendencia Mensual</h2>
          <div className="space-y-4">
            {monthlyData.map((data, index) => {
              const maxAmount = Math.max(...monthlyData.map(d => d.amount));
              const widthPercentage = (data.amount / maxAmount) * 100;
              
              return (
                <div key={data.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">{data.month}</span>
                    <div className="text-right">
                      <div className="font-semibold">{data.budgets} presupuestos</div>
                      <div className="text-gray-500">{formatCurrency(data.amount)}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${widthPercentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Distribución por Estado</h2>
          <div className="space-y-4">
            {statusData.map((status, index) => (
              <div key={status.status} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{status.status}</span>
                  <div className="text-right">
                    <div className="font-semibold">{status.count}</div>
                    <div className="text-gray-500">{status.percentage}%</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`${status.color} h-3 rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${status.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Faculty Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Análisis por Facultad</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Facultad</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Presupuestos</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Monto Total</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Promedio</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Participación</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Distribución</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {facultyData.map((faculty, index) => {
                const percentage = (faculty.amount / totalAmount) * 100;
                const average = faculty.amount / faculty.budgets;
                
                return (
                  <tr key={faculty.name} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded ${faculty.color}`}></div>
                        <span className="font-medium text-gray-900">{faculty.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-900">{faculty.budgets}</td>
                    <td className="py-4 px-4 font-medium text-gray-900">{formatCurrency(faculty.amount)}</td>
                    <td className="py-4 px-4 text-gray-900">{formatCurrency(average)}</td>
                    <td className="py-4 px-4 text-gray-900">{percentage.toFixed(1)}%</td>
                    <td className="py-4 px-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${faculty.color} h-2 rounded-full`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Eficiencia de Aprobación</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">87%</div>
            <p className="text-sm text-gray-600 mt-1">Presupuestos aprobados en tiempo</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Tasa de Rechazo</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-red-600">8%</div>
            <p className="text-sm text-gray-600 mt-1">Presupuestos rechazados</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Variaciones Promedio</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">3.2</div>
            <p className="text-sm text-gray-600 mt-1">Revisiones por presupuesto</p>
          </div>
        </div>
      </div>
    </div>
  );
}
