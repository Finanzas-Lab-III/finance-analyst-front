export interface UserDto {
  id: string | number;
  nombre: string;
  apellido: string;
  facultad: string;
  mail: string;
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

    return {
      id: u?.id,
      nombre,
      apellido,
      facultad,
      mail: u?.mail ?? "",
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


