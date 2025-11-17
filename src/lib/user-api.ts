import { NavBarData } from "@/types/profile";
import axios from "axios";
import {YearsOfAreaItemDto, YearsOfAreaResponse} from "@/types/types";

const BASE_URL = (process.env.NEXT_PUBLIC_SERVICE_URL || "").replace(/\/+$/, "");
const instance = axios.create({
  baseURL: BASE_URL, // <- ya no /api/proxy
  withCredentials: true, // <- manda cookies al backend
});

export const getProfile = async (): Promise<NavBarData | null> => {
  try {
    const res = await instance.get<NavBarData>("/api/user/me"); // mismo path que usabas
    return res.data;
  } catch (error: any) {
    // If 404, 403, or 500, user doesn't exist or backend has issues
    if (error?.response?.status === 404 || error?.response?.status === 403 || error?.response?.status === 500) {
      throw new Error("USER_NOT_FOUND");
    }
    // Other errors
    throw error;
  }
};

export const getFacultiesAndAreas = async () => {
  try {
    const res = await instance.get<{ faculties_in_charge: any[]; areas_in_charge: any[] }>("/api/faculties/");
    const data = res.data ?? {};
    return {
      areas_in_charge: Array.isArray(data.areas_in_charge) ? data.areas_in_charge : [],
      faculties_in_charge: Array.isArray(data.faculties_in_charge) ? data.faculties_in_charge : [],
    };
  } catch {
    throw new Error("Error fetching faculties and areas");
  }
};

export async function getYearsOfArea(areaId: string): Promise<YearsOfAreaResponse> {
  try {
    const res = await instance.get<{
      area: { id: number; name: string };
      area_years: Array<{
        id: number;
        yearId: number;
        status: string;
        year: { year: number; isCurrent: boolean; isFuture: boolean };
      }>;
    }>(`/api/years_of_area/${encodeURIComponent(areaId)}/`);
    const payload = res.data;

    const items: YearsOfAreaItemDto[] = (payload.area_years ?? []).map((it) => ({
      area_year_id: it.id,
      year: it.year.year,
      isCurrent: it.year.isCurrent,
      isFuture: it.year.isFuture,
      status: it.status,
    }));

    return {
      areaName: payload.area?.name ?? `Área ${areaId}`,
      items,
    };
  }
  catch (e) {
    throw new Error("Error fetching years of area");
  }
}

export async function analyzeArmado(
  areaYearId: string,
  opts?: { signal?: AbortSignal }
): Promise<any> {
  const res = await instance.post(
    `/api/armado/${encodeURIComponent(areaYearId)}`,
    undefined,
    { signal: opts?.signal }
  );
  return res.data;
}

export async function completeArmadoRules(
  ids: number[],
  opts?: { signal?: AbortSignal; token?: string }
): Promise<{ success?: boolean } | any> {
  const headers = opts?.token ? { Authorization: `Bearer ${opts.token}` } : undefined;
  const res = await instance.post(
    "/api/armado/rules/complete",
    { ids },
    { signal: opts?.signal, headers }
  );
  return res.data;
}