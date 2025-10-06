"use client";
import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
// No chart libraries needed: show numeric squares only

export default function DashboardSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    total_budget: string | number;
    total_spent: string | number;
    progress_percentage: string | number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchLatestTotals() {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_SERVICE_URL ?? '';
        const res = await fetch(`${API_BASE_URL}/api/analyze/latest_totals/`);
        if (!res.ok) throw new Error('Failed to load totals');
        const json = await res.json();
        console.log('API Response:', json);

        if (!mounted) return;
        const responseData = {
          total_budget: json.total_budget,
          total_spent: json.total_spent,
          progress_percentage: json.progress_percentage
        };
        console.log('Processed Data:', responseData);
        setData(responseData);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || String(err));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    fetchLatestTotals();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Loading dashboard…</div>;
  if (error) return <div className="text-red-600">Error loading dashboard: {error}</div>;
  if (!data) return <div>No data</div>;

  console.log('Rendering data:', data);
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <User className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Dashboard</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded border flex flex-col items-start">
          <div className="text-xs text-gray-500 uppercase">Total Budget</div>
          <div className="mt-2 text-2xl font-semibold">{String(data.total_budget)}</div>
        </div>
        <div className="p-6 bg-white rounded border flex flex-col items-start">
          <div className="text-xs text-gray-500 uppercase">Total Spent</div>
          <div className="mt-2 text-2xl font-semibold">{String(data.total_spent)}</div>
        </div>
        <div className="p-6 bg-white rounded border flex flex-col items-start">
          <div className="text-xs text-gray-500 uppercase">Progress Percentage</div>
          <div className="mt-2 text-2xl font-semibold">{String(data.progress_percentage)}</div>
        </div>
      </div>
    </div>
  );
}
