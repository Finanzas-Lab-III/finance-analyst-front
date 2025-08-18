"use client"
import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color = 'blue',
  description
}) => {
  const getColorClasses = () => {
    const colors = {
      blue: {
        icon: 'bg-blue-50 text-blue-600',
        change: changeType === 'increase' ? 'text-green-600' : changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
      },
      green: {
        icon: 'bg-green-50 text-green-600',
        change: changeType === 'increase' ? 'text-green-600' : changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
      },
      yellow: {
        icon: 'bg-yellow-50 text-yellow-600',
        change: changeType === 'increase' ? 'text-green-600' : changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
      },
      red: {
        icon: 'bg-red-50 text-red-600',
        change: changeType === 'increase' ? 'text-green-600' : changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
      },
      purple: {
        icon: 'bg-purple-50 text-purple-600',
        change: changeType === 'increase' ? 'text-green-600' : changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
      },
      gray: {
        icon: 'bg-gray-50 text-gray-600',
        change: changeType === 'increase' ? 'text-green-600' : changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
      }
    };
    return colors[color];
  };

  const colorClasses = getColorClasses();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {change && (
            <p className={`text-sm flex items-center ${colorClasses.change}`}>
              <span className="mr-1">
                {changeType === 'increase' ? '↗' : changeType === 'decrease' ? '↘' : '→'}
              </span>
              {change}
            </p>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses.icon} ml-4`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
