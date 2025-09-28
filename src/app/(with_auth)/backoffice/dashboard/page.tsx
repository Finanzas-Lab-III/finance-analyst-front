"use client"
import React from "react";
import { 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Users,
  Clock
} from "lucide-react";

const dashboardStats = [
  {
    name: "Total Presupuestos",
    value: "48",
    change: "+12%",
    changeType: "increase" as const,
    icon: FileText,
    color: "blue"
  },
  {
    name: "Monto Total",
    value: "$125.5M",
    change: "+8.2%", 
    changeType: "increase" as const,
    icon: DollarSign,
    color: "green"
  },
  {
    name: "Pendientes",
    value: "12",
    change: "-3",
    changeType: "decrease" as const,
    icon: Clock,
    color: "yellow"
  },
  {
    name: "Directores Activos",
    value: "24",
    change: "+2",
    changeType: "increase" as const,
    icon: Users,
    color: "purple"
  }
];

export default function BackofficeDashboard() {
  const getStatColor = (color: string) => {
    const colors = {
      blue: "bg-blue-50 text-blue-600",
      green: "bg-green-50 text-green-600",
      yellow: "bg-yellow-50 text-yellow-600",
      purple: "bg-purple-50 text-purple-600",
      red: "bg-red-50 text-red-600"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Resumen ejecutivo del estado de los presupuestos</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm flex items-center mt-1 ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className={`w-4 h-4 mr-1 ${
                      stat.changeType === 'decrease' ? 'rotate-180' : ''
                    }`} />
                    {stat.change} vs mes anterior
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${getStatColor(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
