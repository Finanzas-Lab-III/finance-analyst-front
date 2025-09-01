"use client"
import { useEffect, useState } from "react";
import { AreaYearStatus, fetchAreaYearStatus } from "@/api/userService";

export interface UseAreaYearStatusResult {
  loading: boolean;
  error: string | null;
  status: AreaYearStatus | null;
  area: string;
  year: string | number;
}

export function useAreaYearStatus(areaYearId?: string | number | null): UseAreaYearStatusResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<AreaYearStatus | null>(null);
  const [area, setArea] = useState<string>("");
  const [year, setYear] = useState<string | number>("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!areaYearId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAreaYearStatus(areaYearId);
        if (cancelled) return;
        setStatus(data.status);
        setArea(data.area);
        setYear(data.year);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ? String(e.message) : "Error obteniendo estado del área-año");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [areaYearId]);

  return { loading, error, status, area, year };
}


