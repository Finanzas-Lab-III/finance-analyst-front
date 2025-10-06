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

interface ChartData {
  labels: string[];
  series: { name: string; data: number[] }[];
}

interface ProjectionChartProps {
  chartData: ChartData;
}

const ProjectionChart: React.FC<ProjectionChartProps> = ({ chartData }) => {
  // Validate data integrity
  if (!chartData.labels.length || !chartData.series.length || 
      !chartData.series.every(s => s.data.length === chartData.labels.length)) {
    console.error('Invalid chart data format');
    return null;
  }

  // Transform data for recharts format
  const transformedData = chartData.labels.map((label, index) => {
    const dataPoint: any = { month: label };
    chartData.series.forEach(series => {
      dataPoint[series.name] = series.data[index];
    });
    return dataPoint;
  });

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

  // Generate colors for different series - matching the provided color scheme
  const colors = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#7c3aed'];

  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-3 border">
      <h4 className="text-sm font-semibold text-gray-800 mb-4">
        📊 Proyección Presupuestaria
      </h4>
      
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart 
            data={transformedData} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
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
              formatter={(value: number) => [formatValue(value)]}
              contentStyle={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            {chartData.series.map((series, index) => (
              <Line
                key={series.name}
                type="monotone"
                dataKey={series.name}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1 text-left font-medium text-gray-700">Mes</th>
              {chartData.series.map(series => (
                <th key={series.name} className="px-2 py-1 text-right font-medium text-gray-700">
                  {series.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chartData.labels.map((month, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="px-2 py-1 font-medium text-gray-800">{month}</td>
                {chartData.series.map((series, seriesIndex) => (
                  <td key={series.name} className="px-2 py-1 text-right" style={{ color: colors[seriesIndex % colors.length] }}>
                    {formatValue(series.data[index])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectionChart;