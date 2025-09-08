import { MOCK_FACULTIES_AREAS, MOCK_YEARS_DATA, MOCK_AREA_YEAR_STATUS, MOCK_ARMADO_DOCUMENTS, MOCK_SEGUIMIENTO_DOCUMENTS } from "../data/mockFacultiesData";

export interface UserDto {
  id: string | number;
  nombre: string;
  apellido: string;
  facultad: string;
  mail: string;
  areas: string; // Nueva columna derivada de subareas
}

export interface UserFilters {
  nombre_apellido?: string;
  facultad?: string;
  mail?: string;
}

const USERS_API_BASE = process.env.NEXT_PUBLIC_USERS_API_URL || "http://localhost:8000";

export async function fetchUsers(filters: UserFilters = {}): Promise<UserDto[]> {
  const base = `${USERS_API_BASE}/api/admin/users/`;
  const params = new URLSearchParams();
  if (filters.nombre_apellido) params.set("nombre_apellido", filters.nombre_apellido);
  if (filters.facultad) params.set("facultad", filters.facultad);
  if (filters.mail) params.set("mail", filters.mail);
  const query = params.toString();
  const url = query ? `${base}?${query}` : base;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Error fetching users: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const list: Array<any> = Array.isArray(data) ? data : (data.results ?? []);

  return list.map((u: any): UserDto => {
    const full: string = (u?.nombre_apellido ?? "").toString().trim();
    let nombre = full;
    let apellido = "";
    if (full.includes(" ")) {
      const parts = full.split(/\s+/);
      apellido = parts.pop() as string;
      nombre = parts.join(" ");
    }

    const facultad = Array.isArray(u?.facultades)
      ? (u.facultades.length > 0
          ? u.facultades
              .map((f: any) => (typeof f === "string" ? f : (f?.nombre ?? "")))
              .filter((s: string) => s && s.trim().length > 0)
              .join(", ")
          : "—")
      : "—";

    // Derivar áreas desde subareas de cada facultad
    let areas = "—";
    try {
      const allSubareas: string[] = Array.isArray(u?.facultades)
        ? u.facultades
            .flatMap((f: any) => Array.isArray(f?.subareas) ? f.subareas : [])
            .map((s: any) => (typeof s === "string" ? s : (s?.nombre ?? "")))
            .filter((s: string) => s && s.trim().length > 0)
        : [];
      if (allSubareas.length > 0) {
        areas = allSubareas.join(", ");
      }
    } catch {}

    return {
      id: u?.id,
      nombre,
      apellido,
      facultad,
      mail: u?.mail ?? "",
      areas,
    };
  });
}

export async function deleteUser(id: string | number): Promise<void> {
  const url = `${USERS_API_BASE}/api/admin/users/`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: String(id) }),
  });
  if (!res.ok) {
    let message = `Error eliminando usuario: ${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data?.detail) message = String(data.detail);
    } catch {}
    throw new Error(message);
  }
}

export type CreateUserPayload = {
  rol: "ADMINISTRADOR" | "DIRECTOR";
  nombre: string;
  apellido: string;
  email: string;
};

export async function createUser(payload: CreateUserPayload): Promise<any> {
  const url = `${USERS_API_BASE}/api/admin/users/`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let message = `Error creando usuario: ${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data?.detail) message = String(data.detail);
    } catch {}
    throw new Error(message);
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// Facultades y creación de Director
export interface SubareaDto {
  id: number;
  nombre: string;
}

export interface FacultadDto {
  id: number;
  nombre: string;
  subareas: SubareaDto[];
}

export type DirectorScope = "SELF_AND_DESCENDANTS" | "SELF_ONLY";

export async function fetchFacultades(): Promise<FacultadDto[]> {
  const url = `${USERS_API_BASE}/api/areas/facultades/`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Error obteniendo facultades: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data as FacultadDto[];
}

export interface CreateDirectorPayload {
  nombre: string;
  apellido: string;
  email: string;
  facultad_ids: number[];
  scope: DirectorScope;
  subarea_ids?: number[];
}

export async function createDirector(payload: CreateDirectorPayload): Promise<any> {
  const url = `${USERS_API_BASE}/api/admin/users/`;
  const body = { rol: "DIRECTOR", ...payload };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let message = `Error creando director: ${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data?.detail) message = String(data.detail);
    } catch {}
    throw new Error(message);
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export interface UserDetailDto {
  id: number | string;
  rol: "ADMINISTRADOR" | "DIRECTOR";
  nombre: string;
  apellido: string;
  email: string;
  facultad_ids?: number[];
  subarea_ids?: number[];
  scope?: DirectorScope;
}

export async function fetchUserDetail(id: number | string): Promise<UserDetailDto> {
  const url = `${USERS_API_BASE}/api/admin/users/${id}/`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Error obteniendo usuario ${id}: ${res.status} ${res.statusText}`);
  }
  const raw = await res.json();

  // Map backend detail → UserDetailDto expected by edit modal
  const full: string = (raw?.nombre_apellido ?? `${raw?.nombre ?? ""} ${raw?.apellido ?? ""}`).toString().trim();
  let nombre = full;
  let apellido = "";
  if (full.includes(" ")) {
    const parts = full.split(/\s+/);
    apellido = parts.pop() as string;
    nombre = parts.join(" ");
  }

  const email: string = raw?.email ?? raw?.mail ?? "";
  const facultad_ids: number[] | undefined = Array.isArray(raw?.facultades)
    ? raw.facultades
        .map((f: any) => (typeof f?.id === "number" ? f.id : Number(f?.id)))
        .filter((n: any) => Number.isFinite(n))
    : (Array.isArray(raw?.facultad_ids) ? raw.facultad_ids : undefined);

  const subarea_ids: number[] | undefined = Array.isArray(raw?.subareas)
    ? raw.subareas
        .map((s: any) => (typeof s?.id === "number" ? s.id : Number(s?.id)))
        .filter((n: any) => Number.isFinite(n))
    : (Array.isArray(raw?.subarea_ids) ? raw.subarea_ids : undefined);

  const detail: UserDetailDto = {
    id: raw?.id,
    rol: raw?.rol ?? "ADMINISTRADOR",
    nombre,
    apellido,
    email,
    facultad_ids,
    subarea_ids,
    scope: raw?.scope as DirectorScope | undefined,
  };

  return detail;
}

export interface UpdateUserPayload {
  id: number | string;
  rol: "ADMINISTRADOR" | "DIRECTOR";
  nombre: string;
  apellido: string;
  email: string;
  facultad_ids?: number[];
  subarea_ids?: number[];
  scope?: DirectorScope;
}

export async function updateUser(payload: UpdateUserPayload): Promise<any> {
  const url = `${USERS_API_BASE}/api/admin/users/`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let message = `Error actualizando usuario: ${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data?.detail) message = String(data.detail);
    } catch {}
    throw new Error(message);
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}


// Facultades/Áreas a cargo por usuario
export interface AreaInChargeDto {
  id: number;
  name: string;
  code: string;
  type: string;
  parent_area_id: number | null;
  parent?: {
    id: number;
    name: string;
  } | null;
}

export interface FacultyInChargeDto {
  id: number;
  name: string;
  code: string;
  type: string;
  parent_area_id: null;
}

export interface UserFacultiesAreasResponse {
  areas_in_charge: AreaInChargeDto[];
  faculties_in_charge: FacultyInChargeDto[];
}

export async function fetchUserFacultiesAreas(
  userId: string | number
): Promise<UserFacultiesAreasResponse> {
  try {
    const url = `${USERS_API_BASE}/api/faculties/${userId}/`;
    const res = await fetch(url, { 
      cache: "no-store",
      headers: {
        "X-User-Id": "1"
      }
    });
    
    if (!res.ok) {
      console.warn(`Backend API failed (${res.status}), using mock data`);
      return MOCK_FACULTIES_AREAS;
    }
    
    const data = (await res.json()) as UserFacultiesAreasResponse;
    return {
      areas_in_charge: Array.isArray(data?.areas_in_charge) ? data.areas_in_charge : [],
      faculties_in_charge: Array.isArray(data?.faculties_in_charge) ? data.faculties_in_charge : [],
    };
  } catch (error) {
    console.warn(`Backend connection failed, using mock data:`, error);
    return MOCK_FACULTIES_AREAS;
  }
}

// Años por área
export type AreaYearStatus =
  | "NOT_STARTED"
  | "BUDGET_STARTED"
  | "NEEDS_CHANGES"
  | "PENDING_APPROVAL"
  | "BUDGET_APPROVED"
  | "FOLLOW_UP_AVAILABLE";

export interface YearsOfAreaItemDto {
  area_year_id: number;
  year: number;
  isCurrent: boolean;
  isFuture: boolean;
  status: AreaYearStatus;
}

export interface YearsOfAreaResponse {
  area_id: number;
  yearsOfArea: YearsOfAreaItemDto[];
}

export async function fetchYearsOfArea(areaId: number | string): Promise<YearsOfAreaResponse> {
  try {
    const url = `${USERS_API_BASE}/api/yearsOfArea/${areaId}`;
    const res = await fetch(url, { cache: "no-store" });
    
    if (!res.ok) {
      console.warn(`Backend API failed for years of area ${areaId} (${res.status}), using mock data`);
      const mockData = MOCK_YEARS_DATA[String(areaId)];
      if (mockData) {
        return mockData;
      }
      // Default mock data if area not found
      return {
        area_id: Number(areaId),
        yearsOfArea: [
          { area_year_id: Number(areaId) * 100 + 1, year: 2023, isCurrent: false, isFuture: false, status: "BUDGET_APPROVED" },
          { area_year_id: Number(areaId) * 100 + 2, year: 2024, isCurrent: false, isFuture: false, status: "FOLLOW_UP_AVAILABLE" },
          { area_year_id: Number(areaId) * 100 + 3, year: 2025, isCurrent: true, isFuture: false, status: "BUDGET_APPROVED" },
          { area_year_id: Number(areaId) * 100 + 4, year: 2026, isCurrent: false, isFuture: true, status: "BUDGET_STARTED" },
          { area_year_id: Number(areaId) * 100 + 5, year: 2027, isCurrent: false, isFuture: true, status: "NOT_STARTED" }
        ]
      };
    }
    
    const data = (await res.json()) as YearsOfAreaResponse;
    return {
      area_id: Number(data?.area_id) || Number(areaId),
      yearsOfArea: Array.isArray(data?.yearsOfArea) ? data.yearsOfArea : [],
    };
  } catch (error) {
    console.warn(`Backend connection failed for years of area ${areaId}, using mock data:`, error);
    const mockData = MOCK_YEARS_DATA[String(areaId)];
    if (mockData) {
      return mockData;
    }
    // Default mock data if area not found
    return {
      area_id: Number(areaId),
      yearsOfArea: [
        { area_year_id: Number(areaId) * 100 + 1, year: 2023, isCurrent: false, isFuture: false, status: "BUDGET_APPROVED" },
        { area_year_id: Number(areaId) * 100 + 2, year: 2024, isCurrent: false, isFuture: false, status: "FOLLOW_UP_AVAILABLE" },
        { area_year_id: Number(areaId) * 100 + 3, year: 2025, isCurrent: true, isFuture: false, status: "BUDGET_APPROVED" },
        { area_year_id: Number(areaId) * 100 + 4, year: 2026, isCurrent: false, isFuture: true, status: "BUDGET_STARTED" },
        { area_year_id: Number(areaId) * 100 + 5, year: 2027, isCurrent: false, isFuture: true, status: "NOT_STARTED" }
      ]
    };
  }
}

export interface AreaYearStatusResponse {
  status: AreaYearStatus;
  area: string;
  year: number | string;
}

export async function fetchAreaYearStatus(areaYearId: number | string): Promise<AreaYearStatusResponse> {
  try {
    const url = `${USERS_API_BASE}/api/status/${areaYearId}`;
    const res = await fetch(url, { cache: "no-store" });
    
    if (!res.ok) {
      console.warn(`Backend API failed for area-year status ${areaYearId} (${res.status}), using mock data`);
      const mockData = MOCK_AREA_YEAR_STATUS[String(areaYearId)];
      if (mockData) {
        return mockData;
      }
      // Default mock data if area-year not found
      return {
        status: "BUDGET_APPROVED",
        area: "Universidad Austral",
        year: 2025,
      };
    }
    
    const data = await res.json();
    return {
      status: data?.status as AreaYearStatus,
      area: String(data?.area ?? ""),
      year: data?.year ?? "",
    };
  } catch (error) {
    console.warn(`Backend connection failed for area-year status ${areaYearId}, using mock data:`, error);
    const mockData = MOCK_AREA_YEAR_STATUS[String(areaYearId)];
    if (mockData) {
      return mockData;
    }
    // Default mock data if area-year not found
    return {
      status: "BUDGET_APPROVED",
      area: "Universidad Austral", 
      year: 2025,
    };
  }
}

export async function updateAreaYearStatus(
  areaYearId: number | string,
  status: AreaYearStatus
): Promise<void> {
  const url = `${USERS_API_BASE}/api/status/${areaYearId}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    let message = `Error actualizando estado del área-año ${areaYearId}: ${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data?.detail) message = String(data.detail);
    } catch {}
    throw new Error(message);
  }
}

// Armado documents for an AreaYear
export interface ArmadoDocument {
  id: number;
  type: string; // e.g., "ARMADO"
  title: string;
  area_year_id: number;
  file_key: string;
  notes?: string;
  created_at: string; // ISO
  updated_at?: string; // ISO
}

export interface ArmadoDocumentsResponse {
  area_year_id: number;
  document_type: string; // "ARMADO"
  documents: ArmadoDocument[];
}

export async function fetchArmadoDocuments(areaYearId: number | string): Promise<ArmadoDocument[]> {
  try {
    const url = `${USERS_API_BASE}/api/archivos_armado/area_year/${areaYearId}`;
    const res = await fetch(url, { cache: "no-store" });
    
    if (!res.ok) {
      console.warn(`Backend API failed for armado documents ${areaYearId} (${res.status}), using mock data`);
      const mockDocuments = MOCK_ARMADO_DOCUMENTS[String(areaYearId)];
      if (mockDocuments) {
        return mockDocuments.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      // Default mock document if area-year not found
      return [
        {
          id: Number(areaYearId) * 10 + 1,
          type: "ARMADO",
          title: `Presupuesto 2025 - Área ${areaYearId}`,
          area_year_id: Number(areaYearId),
          file_key: "excel/2025.xlsx",
          notes: "Presupuesto generado automáticamente",
          created_at: "2024-12-01T10:00:00Z",
          updated_at: "2024-12-01T10:00:00Z"
        }
      ];
    }
    
    const data = (await res.json()) as ArmadoDocumentsResponse;
    const docs = Array.isArray(data?.documents) ? data.documents : [];
    return docs.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.warn(`Backend connection failed for armado documents ${areaYearId}, using mock data:`, error);
    const mockDocuments = MOCK_ARMADO_DOCUMENTS[String(areaYearId)];
    if (mockDocuments) {
      return mockDocuments.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
          // Default mock document if area-year not found
      return [
        {
          id: Number(areaYearId) * 10 + 1,
          type: "ARMADO",
          title: `Presupuesto 2025 - Área ${areaYearId}`,
          area_year_id: Number(areaYearId),
          file_key: "excel/2025.xlsx",
          notes: "Presupuesto generado automáticamente",
          created_at: "2024-12-01T10:00:00Z",
          updated_at: "2024-12-01T10:00:00Z"
        }
      ];
  }
}

// Seguimiento documents for an AreaYear
export interface SeguimientoDocument {
  id: number;
  type: string; // "SEGUIMIENTO"
  title: string;
  area_year_id: number;
  file_key: string;
  notes?: string | null;
  created_at: string; // ISO
  updated_at?: string; // ISO
}

export interface SeguimientoDocumentsResponse {
  area_year_id: number;
  document_type: string; // "SEGUIMIENTO"
  documents: SeguimientoDocument[];
}

export async function fetchSeguimientoDocuments(areaYearId: number | string): Promise<SeguimientoDocument[]> {
  try {
    const url = `${USERS_API_BASE}/api/archivos_seguimiento/area_year/${areaYearId}/`;
    const res = await fetch(url, { cache: "no-store" });
    
    if (!res.ok) {
      console.warn(`Backend API failed for seguimiento documents ${areaYearId} (${res.status}), using mock data`);
      const mockDocuments = MOCK_SEGUIMIENTO_DOCUMENTS[String(areaYearId)];
      if (mockDocuments) {
        return mockDocuments.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      // Default mock document if area-year not found
      return [
        {
          id: Number(areaYearId) * 100 + 1,
          type: "SEGUIMIENTO",
          title: `Seguimiento 6+6 Área ${areaYearId} 2025 - Datos Presupuestarios`,
          area_year_id: Number(areaYearId),
          file_key: "excel/2025.xlsx",
          notes: "Seguimiento 6+6 con datos presupuestarios reales para análisis de LLM",
          created_at: "2024-12-01T10:00:00Z",
          updated_at: "2024-12-01T10:00:00Z"
        }
      ];
    }
    
    const data = (await res.json()) as SeguimientoDocumentsResponse;
    const docs = Array.isArray(data?.documents) ? data.documents : [];
    
    // Temporary: Modify documents to point to readable Excel files
    const modifiedDocs = docs.map(doc => ({
      ...doc,
      file_key: "excel/2025.xlsx", // Point to a file with actual data
      title: "Seguimiento 6+6 FI 2025 - Datos Presupuestarios",
      notes: "Seguimiento 6+6 con datos presupuestarios reales para análisis de LLM"
    }));
    
    return modifiedDocs.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    console.warn(`Backend connection failed for seguimiento documents ${areaYearId}, using mock data:`, error);
    const mockDocuments = MOCK_SEGUIMIENTO_DOCUMENTS[String(areaYearId)];
    if (mockDocuments) {
      return mockDocuments.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    // Default mock document if area-year not found
    return [
      {
        id: Number(areaYearId) * 100 + 1,
        type: "SEGUIMIENTO",
        title: `Seguimiento 6+6 Área ${areaYearId} 2025 - Datos Presupuestarios`,
        area_year_id: Number(areaYearId),
        file_key: "excel/2025.xlsx",
        notes: "Seguimiento 6+6 con datos presupuestarios reales para análisis de LLM",
        created_at: "2024-12-01T10:00:00Z",
        updated_at: "2024-12-01T10:00:00Z"
      }
    ];
  }
}

// Build raw download URL for a file by id
export function buildRawFileUrl(fileId: number | string, raw: boolean = true): string {
  const rawParam = raw ? "true" : "false";
  return `${USERS_API_BASE}/api/archivo/${fileId}/?raw=${rawParam}`;
}
