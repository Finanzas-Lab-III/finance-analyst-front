import { NavBarData } from "@/types/profile";
import axios from "axios";
import {YearsOfAreaItemDto, YearsOfAreaResponse} from "@/types/types";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVICE_URL, // <- ya no /api/proxy
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
    }>(`/api/years_of_area/${encodeURIComponent(areaId)}`);
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

// Create new faculty or area
export interface CreateFacultyAreaPayload {
  name: string;
  code?: string; // Optional as per backend documentation
  type: "FACULTAD" | "SUBAREA"; // Updated to match backend expectations
  parent_area_id?: number; // Required for SUBAREA only
}

export const createFacultyOrArea = async (payload: CreateFacultyAreaPayload) => {
  try {
    // Prepare payload according to backend specification
    const requestPayload: any = {
      name: payload.name.trim(),
      type: payload.type
    };

    // Add code only if provided and not empty
    if (payload.code && payload.code.trim()) {
      requestPayload.code = payload.code.trim();
    }

    // For SUBAREA, parent_area_id is required
    if (payload.type === "SUBAREA") {
      if (!payload.parent_area_id) {
        throw new Error("parent_area_id es obligatorio para crear un área/subarea");
      }
      requestPayload.parent_area_id = payload.parent_area_id;
    }

    console.log("Creating", payload.type, "with payload:", requestPayload);
    
    // Use the correct endpoint from backend documentation
    const res = await instance.post("/api/admin/org-units", requestPayload);
    
    console.log("Successfully created:", res.data);
    return res.data;
    
  } catch (error: any) {
    console.error("Error creating faculty/area:", error);
    
    // Handle different types of errors according to backend documentation
    if (error?.response?.status === 400) {
      // Validation errors
      const details = error?.response?.data?.details;
      if (details) {
        const errorMessages = Object.entries(details)
          .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        throw new Error(`Error de validación: ${errorMessages}`);
      }
      throw new Error(error?.response?.data?.message || "Error de validación en los datos enviados");
    }
    
    if (error?.response?.status === 401) {
      throw new Error("No tienes autorización. Por favor inicia sesión nuevamente.");
    }
    
    if (error?.response?.status === 403) {
      throw new Error("Solo los administradores pueden crear facultades y áreas.");
    }
    
    if (error?.response?.status === 409) {
      // Duplicate error
      const details = error?.response?.data?.details;
      if (details && details.name) {
        throw new Error(`Ya existe: ${Array.isArray(details.name) ? details.name.join(', ') : details.name}`);
      }
      throw new Error(error?.response?.data?.message || "Ya existe una unidad organizativa con estos datos");
    }
    
    // Generic error handling
    const errorMessage = error?.response?.data?.message || 
                        error?.message ||
                        "Error al crear el elemento";
    
    throw new Error(errorMessage);
  }
};

// Get all organizational units from admin endpoint (more up-to-date)
export const getAllOrgUnits = async () => {
  try {
    const res = await instance.get("/api/admin/org-units");
    console.log("Admin org-units raw response:", res.data);
    
    let data = res.data;
    
    // Handle different response formats
    if (data && typeof data === 'object') {
      // If it's wrapped in a 'data' property
      if (data.data && Array.isArray(data.data)) {
        data = data.data;
      }
      // If it has a 'results' property
      else if (data.results && Array.isArray(data.results)) {
        data = data.results;
      }
      // If it's already an array
      else if (Array.isArray(data)) {
        // data is already correct
      }
      // If it's an object but not an array, return empty
      else {
        console.warn("Unexpected response format from admin org-units:", data);
        data = [];
      }
    } else {
      data = [];
    }
    
    console.log("Processed org-units data:", data);
    
    // Transform to match the expected format
    const faculties = data
      .filter((unit: any) => unit.type === "FACULTAD")
      .map((unit: any) => ({
        id: unit.id,
        name: unit.name,
        code: unit.code || "",
        type: unit.type,
        parent_area_id: null
      }));
    
    const areas = data
      .filter((unit: any) => unit.type === "SUBAREA")
      .map((unit: any) => {
        // Find parent faculty
        const parentFaculty = data.find((f: any) => f.id === unit.parent_area_id && f.type === "FACULTAD");
        return {
          id: unit.id,
          name: unit.name,
          code: unit.code || "",
          type: unit.type,
          parent_area_id: unit.parent_area_id,
          parent: parentFaculty ? { id: parentFaculty.id, name: parentFaculty.name } : null
        };
      });
    
    console.log("Transformed faculties:", faculties);
    console.log("Transformed areas:", areas);
    
    return {
      areas_in_charge: areas,
      faculties_in_charge: faculties,
    };
  } catch (error: any) {
    console.error("Error fetching org units from admin endpoint:", error);
    console.log("Falling back to original endpoint...");
    // Fallback to the original endpoint
    return getFacultiesAndAreas();
  }
};