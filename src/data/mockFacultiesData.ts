// Mock data para facultades y áreas de Universidad Austral
export interface MockAreaInCharge {
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

export interface MockFacultyInCharge {
  id: number;
  name: string;
  code: string;
  type: string;
  parent_area_id: null;
}

export interface MockUserFacultiesAreasResponse {
  areas_in_charge: MockAreaInCharge[];
  faculties_in_charge: MockFacultyInCharge[];
}

// Mock data para años de área
export interface MockYearsOfAreaItemDto {
  area_year_id: number;
  year: number;
  isCurrent: boolean;
  isFuture: boolean;
  status: "NOT_STARTED" | "BUDGET_STARTED" | "NEEDS_CHANGES" | "PENDING_APPROVAL" | "BUDGET_APPROVED" | "FOLLOW_UP_AVAILABLE";
}

export interface MockYearsOfAreaResponse {
  area_id: number;
  yearsOfArea: MockYearsOfAreaItemDto[];
}

// Mock data para estados de área-año
export interface MockAreaYearStatusResponse {
  status: "NOT_STARTED" | "BUDGET_STARTED" | "NEEDS_CHANGES" | "PENDING_APPROVAL" | "BUDGET_APPROVED" | "FOLLOW_UP_AVAILABLE";
  area: string;
  year: number | string;
}

export const MOCK_AREA_YEAR_STATUS: Record<string, MockAreaYearStatusResponse> = {
  // Estados para área-años de Facultad de Ingeniería
  "101": { status: "BUDGET_APPROVED", area: "Facultad de Ingeniería", year: 2023 },
  "102": { status: "FOLLOW_UP_AVAILABLE", area: "Facultad de Ingeniería", year: 2024 },
  "103": { status: "BUDGET_APPROVED", area: "Facultad de Ingeniería", year: 2025 },
  "104": { status: "BUDGET_STARTED", area: "Facultad de Ingeniería", year: 2026 },
  "105": { status: "NOT_STARTED", area: "Facultad de Ingeniería", year: 2027 },
  
  // Estados para área-años de Facultad de Ciencias Biomédicas
  "201": { status: "BUDGET_APPROVED", area: "Facultad de Ciencias Biomédicas", year: 2023 },
  "202": { status: "FOLLOW_UP_AVAILABLE", area: "Facultad de Ciencias Biomédicas", year: 2024 },
  "203": { status: "PENDING_APPROVAL", area: "Facultad de Ciencias Biomédicas", year: 2025 },
  "204": { status: "BUDGET_STARTED", area: "Facultad de Ciencias Biomédicas", year: 2026 },
  "205": { status: "NOT_STARTED", area: "Facultad de Ciencias Biomédicas", year: 2027 },
  
  // Estados para área-años de Facultad de Ciencias Empresariales
  "301": { status: "BUDGET_APPROVED", area: "Facultad de Ciencias Empresariales", year: 2023 },
  "302": { status: "FOLLOW_UP_AVAILABLE", area: "Facultad de Ciencias Empresariales", year: 2024 },
  "303": { status: "BUDGET_APPROVED", area: "Facultad de Ciencias Empresariales", year: 2025 },
  "304": { status: "NOT_STARTED", area: "Facultad de Ciencias Empresariales", year: 2026 },
  "305": { status: "NOT_STARTED", area: "Facultad de Ciencias Empresariales", year: 2027 },
  
  // Estados para área-años de Facultad de Derecho
  "401": { status: "BUDGET_APPROVED", area: "Facultad de Derecho", year: 2023 },
  "402": { status: "FOLLOW_UP_AVAILABLE", area: "Facultad de Derecho", year: 2024 },
  "403": { status: "NEEDS_CHANGES", area: "Facultad de Derecho", year: 2025 },
  "404": { status: "NOT_STARTED", area: "Facultad de Derecho", year: 2026 },
  "405": { status: "NOT_STARTED", area: "Facultad de Derecho", year: 2027 },
  
  // Estados para área-años de Departamento de Sistemas
  "601": { status: "BUDGET_APPROVED", area: "Departamento de Sistemas", year: 2023 },
  "602": { status: "FOLLOW_UP_AVAILABLE", area: "Departamento de Sistemas", year: 2024 },
  "603": { status: "BUDGET_APPROVED", area: "Departamento de Sistemas", year: 2025 },
  "604": { status: "BUDGET_STARTED", area: "Departamento de Sistemas", year: 2026 },
  "605": { status: "NOT_STARTED", area: "Departamento de Sistemas", year: 2027 },
  
  // Estados para área-años de Departamento de Ingeniería Industrial
  "701": { status: "BUDGET_APPROVED", area: "Departamento de Ingeniería Industrial", year: 2023 },
  "702": { status: "FOLLOW_UP_AVAILABLE", area: "Departamento de Ingeniería Industrial", year: 2024 },
  "703": { status: "PENDING_APPROVAL", area: "Departamento de Ingeniería Industrial", year: 2025 },
  "704": { status: "NOT_STARTED", area: "Departamento de Ingeniería Industrial", year: 2026 },
  "705": { status: "NOT_STARTED", area: "Departamento de Ingeniería Industrial", year: 2027 }
};

// Datos completos de Universidad Austral
export const MOCK_FACULTIES_AREAS: MockUserFacultiesAreasResponse = {
  areas_in_charge: [
    // Facultad de Ingeniería
    {
      id: 6,
      name: "Departamento de Sistemas",
      code: "FI-SIS",
      type: "SUBAREA",
      parent_area_id: 1,
      parent: { id: 1, name: "Facultad de Ingeniería" }
    },
    {
      id: 7,
      name: "Departamento de Ingeniería Industrial",
      code: "FI-IND",
      type: "SUBAREA",
      parent_area_id: 1,
      parent: { id: 1, name: "Facultad de Ingeniería" }
    },
    {
      id: 8,
      name: "Departamento de Ingeniería Biomédica",
      code: "FI-BIO",
      type: "SUBAREA",
      parent_area_id: 1,
      parent: { id: 1, name: "Facultad de Ingeniería" }
    },
    // Facultad de Ciencias Biomédicas
    {
      id: 9,
      name: "Escuela de Medicina",
      code: "FCB-MED",
      type: "SUBAREA",
      parent_area_id: 2,
      parent: { id: 2, name: "Facultad de Ciencias Biomédicas" }
    },
    {
      id: 10,
      name: "Escuela de Odontología",
      code: "FCB-ODO",
      type: "SUBAREA",
      parent_area_id: 2,
      parent: { id: 2, name: "Facultad de Ciencias Biomédicas" }
    },
    {
      id: 11,
      name: "Centro de Investigación Biomédica",
      code: "FCB-CIB",
      type: "SUBAREA",
      parent_area_id: 2,
      parent: { id: 2, name: "Facultad de Ciencias Biomédicas" }
    },
    // Facultad de Ciencias Empresariales
    {
      id: 12,
      name: "Escuela de Negocios",
      code: "FCE-NEG",
      type: "SUBAREA",
      parent_area_id: 3,
      parent: { id: 3, name: "Facultad de Ciencias Empresariales" }
    },
    {
      id: 13,
      name: "Departamento de Economía",
      code: "FCE-ECO",
      type: "SUBAREA",
      parent_area_id: 3,
      parent: { id: 3, name: "Facultad de Ciencias Empresariales" }
    },
    {
      id: 14,
      name: "Centro de Emprendimiento",
      code: "FCE-EMP",
      type: "SUBAREA",
      parent_area_id: 3,
      parent: { id: 3, name: "Facultad de Ciencias Empresariales" }
    },
    // Facultad de Derecho
    {
      id: 15,
      name: "Departamento de Derecho Civil",
      code: "FD-CIV",
      type: "SUBAREA",
      parent_area_id: 4,
      parent: { id: 4, name: "Facultad de Derecho" }
    },
    {
      id: 16,
      name: "Departamento de Derecho Penal",
      code: "FD-PEN",
      type: "SUBAREA",
      parent_area_id: 4,
      parent: { id: 4, name: "Facultad de Derecho" }
    },
    {
      id: 17,
      name: "Instituto de Bioética",
      code: "FD-BIO",
      type: "SUBAREA",
      parent_area_id: 4,
      parent: { id: 4, name: "Facultad de Derecho" }
    },
    // Facultad de Comunicación
    {
      id: 18,
      name: "Escuela de Periodismo",
      code: "FC-PER",
      type: "SUBAREA",
      parent_area_id: 5,
      parent: { id: 5, name: "Facultad de Comunicación" }
    },
    {
      id: 19,
      name: "Departamento de Publicidad",
      code: "FC-PUB",
      type: "SUBAREA",
      parent_area_id: 5,
      parent: { id: 5, name: "Facultad de Comunicación" }
    },
    {
      id: 20,
      name: "Centro de Medios Digitales",
      code: "FC-MED",
      type: "SUBAREA",
      parent_area_id: 5,
      parent: { id: 5, name: "Facultad de Comunicación" }
    }
  ],
  faculties_in_charge: [
    {
      id: 1,
      name: "Facultad de Ingeniería",
      code: "FI",
      type: "FACULTAD",
      parent_area_id: null
    },
    {
      id: 2,
      name: "Facultad de Ciencias Biomédicas",
      code: "FCB",
      type: "FACULTAD",
      parent_area_id: null
    },
    {
      id: 3,
      name: "Facultad de Ciencias Empresariales",
      code: "FCE",
      type: "FACULTAD",
      parent_area_id: null
    },
    {
      id: 4,
      name: "Facultad de Derecho",
      code: "FD",
      type: "FACULTAD",
      parent_area_id: null
    },
    {
      id: 5,
      name: "Facultad de Comunicación",
      code: "FC",
      type: "FACULTAD",
      parent_area_id: null
    },
    {
      id: 6,
      name: "Facultad de Filosofía",
      code: "FF",
      type: "FACULTAD",
      parent_area_id: null
    },
    {
      id: 7,
      name: "Facultad de Educación",
      code: "FE",
      type: "FACULTAD",
      parent_area_id: null
    },
    {
      id: 8,
      name: "Instituto de Ciencias para la Familia",
      code: "ICF",
      type: "FACULTAD",
      parent_area_id: null
    }
  ]
};

// Datos mock para los años de cada área/facultad
export const MOCK_YEARS_DATA: Record<string, MockYearsOfAreaResponse> = {
  // Facultad de Ingeniería (ID: 1)
  "1": {
    area_id: 1,
    yearsOfArea: [
      { area_year_id: 101, year: 2023, isCurrent: false, isFuture: false, status: "BUDGET_APPROVED" },
      { area_year_id: 102, year: 2024, isCurrent: false, isFuture: false, status: "FOLLOW_UP_AVAILABLE" },
      { area_year_id: 103, year: 2025, isCurrent: true, isFuture: false, status: "BUDGET_APPROVED" },
      { area_year_id: 104, year: 2026, isCurrent: false, isFuture: true, status: "BUDGET_STARTED" },
      { area_year_id: 105, year: 2027, isCurrent: false, isFuture: true, status: "NOT_STARTED" }
    ]
  },
  // Facultad de Ciencias Biomédicas (ID: 2)
  "2": {
    area_id: 2,
    yearsOfArea: [
      { area_year_id: 201, year: 2023, isCurrent: false, isFuture: false, status: "BUDGET_APPROVED" },
      { area_year_id: 202, year: 2024, isCurrent: false, isFuture: false, status: "FOLLOW_UP_AVAILABLE" },
      { area_year_id: 203, year: 2025, isCurrent: true, isFuture: false, status: "PENDING_APPROVAL" },
      { area_year_id: 204, year: 2026, isCurrent: false, isFuture: true, status: "BUDGET_STARTED" },
      { area_year_id: 205, year: 2027, isCurrent: false, isFuture: true, status: "NOT_STARTED" }
    ]
  },
  // Facultad de Ciencias Empresariales (ID: 3)
  "3": {
    area_id: 3,
    yearsOfArea: [
      { area_year_id: 301, year: 2023, isCurrent: false, isFuture: false, status: "BUDGET_APPROVED" },
      { area_year_id: 302, year: 2024, isCurrent: false, isFuture: false, status: "FOLLOW_UP_AVAILABLE" },
      { area_year_id: 303, year: 2025, isCurrent: true, isFuture: false, status: "BUDGET_APPROVED" },
      { area_year_id: 304, year: 2026, isCurrent: false, isFuture: true, status: "NOT_STARTED" },
      { area_year_id: 305, year: 2027, isCurrent: false, isFuture: true, status: "NOT_STARTED" }
    ]
  },
  // Facultad de Derecho (ID: 4)
  "4": {
    area_id: 4,
    yearsOfArea: [
      { area_year_id: 401, year: 2023, isCurrent: false, isFuture: false, status: "BUDGET_APPROVED" },
      { area_year_id: 402, year: 2024, isCurrent: false, isFuture: false, status: "FOLLOW_UP_AVAILABLE" },
      { area_year_id: 403, year: 2025, isCurrent: true, isFuture: false, status: "NEEDS_CHANGES" },
      { area_year_id: 404, year: 2026, isCurrent: false, isFuture: true, status: "NOT_STARTED" },
      { area_year_id: 405, year: 2027, isCurrent: false, isFuture: true, status: "NOT_STARTED" }
    ]
  },
  // Facultad de Comunicación (ID: 5)
  "5": {
    area_id: 5,
    yearsOfArea: [
      { area_year_id: 501, year: 2023, isCurrent: false, isFuture: false, status: "BUDGET_APPROVED" },
      { area_year_id: 502, year: 2024, isCurrent: false, isFuture: false, status: "FOLLOW_UP_AVAILABLE" },
      { area_year_id: 503, year: 2025, isCurrent: true, isFuture: false, status: "BUDGET_APPROVED" },
      { area_year_id: 504, year: 2026, isCurrent: false, isFuture: true, status: "BUDGET_STARTED" },
      { area_year_id: 505, year: 2027, isCurrent: false, isFuture: true, status: "NOT_STARTED" }
    ]
  },
  // Departamento de Sistemas (ID: 6)
  "6": {
    area_id: 6,
    yearsOfArea: [
      { area_year_id: 601, year: 2023, isCurrent: false, isFuture: false, status: "BUDGET_APPROVED" },
      { area_year_id: 602, year: 2024, isCurrent: false, isFuture: false, status: "FOLLOW_UP_AVAILABLE" },
      { area_year_id: 603, year: 2025, isCurrent: true, isFuture: false, status: "BUDGET_APPROVED" },
      { area_year_id: 604, year: 2026, isCurrent: false, isFuture: true, status: "BUDGET_STARTED" },
      { area_year_id: 605, year: 2027, isCurrent: false, isFuture: true, status: "NOT_STARTED" }
    ]
  },
  // Departamento de Ingeniería Industrial (ID: 7)
  "7": {
    area_id: 7,
    yearsOfArea: [
      { area_year_id: 701, year: 2023, isCurrent: false, isFuture: false, status: "BUDGET_APPROVED" },
      { area_year_id: 702, year: 2024, isCurrent: false, isFuture: false, status: "FOLLOW_UP_AVAILABLE" },
      { area_year_id: 703, year: 2025, isCurrent: true, isFuture: false, status: "PENDING_APPROVAL" },
      { area_year_id: 704, year: 2026, isCurrent: false, isFuture: true, status: "NOT_STARTED" },
      { area_year_id: 705, year: 2027, isCurrent: false, isFuture: true, status: "NOT_STARTED" }
    ]
  }
};

// Mock data para documentos de armado
export interface MockArmadoDocument {
  id: number;
  type: string;
  title: string;
  area_year_id: number;
  file_key: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export const MOCK_ARMADO_DOCUMENTS: Record<string, MockArmadoDocument[]> = {
  "103": [
    {
      id: 1031,
      type: "ARMADO",
      title: "Presupuesto FI 2025 - Versión Final",
      area_year_id: 103,
      file_key: "excel/2025.xlsx",
      notes: "Versión aprobada del presupuesto 2025",
      created_at: "2024-12-15T10:30:00Z",
      updated_at: "2024-12-15T10:30:00Z"
    },
    {
      id: 1032,
      type: "ARMADO", 
      title: "Presupuesto FI 2025 - Borrador v2",
      area_year_id: 103,
      file_key: "excel/2024.xlsx",
      notes: "Segunda versión con correcciones",
      created_at: "2024-12-10T14:20:00Z",
      updated_at: "2024-12-10T14:20:00Z"
    },
    {
      id: 1033,
      type: "ARMADO",
      title: "Presupuesto FI 2025 - Borrador inicial",
      area_year_id: 103,
      file_key: "excel/2023.xlsx", 
      notes: "Primera versión del presupuesto",
      created_at: "2024-12-01T09:15:00Z",
      updated_at: "2024-12-01T09:15:00Z"
    }
  ],
  "203": [
    {
      id: 2031,
      type: "ARMADO",
      title: "Presupuesto FCB 2025 - Versión Final",
      area_year_id: 203,
      file_key: "excel/2025.xlsx",
      notes: "Presupuesto Facultad de Ciencias Biomédicas 2025",
      created_at: "2024-12-12T11:45:00Z",
      updated_at: "2024-12-12T11:45:00Z"
    }
  ],
  "303": [
    {
      id: 3031,
      type: "ARMADO",
      title: "Presupuesto FCE 2025 - Versión Final",
      area_year_id: 303,
      file_key: "excel/2025.xlsx",
      notes: "Presupuesto Facultad de Ciencias Empresariales 2025",
      created_at: "2024-12-08T16:30:00Z",
      updated_at: "2024-12-08T16:30:00Z"
    }
  ]
};

// Mock data para documentos de seguimiento
export interface MockSeguimientoDocument {
  id: number;
  type: string;
  title: string;
  area_year_id: number;
  file_key: string;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export const MOCK_SEGUIMIENTO_DOCUMENTS: Record<string, MockSeguimientoDocument[]> = {
  "103": [
    {
      id: 10301,
      type: "SEGUIMIENTO",
      title: "Seguimiento 6+6 FI 2025 - Datos Presupuestarios",
      area_year_id: 103,
      file_key: "excel/2025.xlsx",
      notes: "Seguimiento 6+6 con datos presupuestarios reales para análisis de LLM",
      created_at: "2024-12-20T15:30:00Z",
      updated_at: "2024-12-20T15:30:00Z"
    },
    {
      id: 10302,
      type: "SEGUIMIENTO",
      title: "Seguimiento Trimestral Q4 2024",
      area_year_id: 103,
      file_key: "excel/2024.xlsx",
      notes: "Análisis trimestral del último cuarto del año",
      created_at: "2024-12-15T12:15:00Z",
      updated_at: "2024-12-15T12:15:00Z"
    }
  ],
  "203": [
    {
      id: 20301,
      type: "SEGUIMIENTO", 
      title: "Seguimiento FCB 2025 - Análisis Biomédico",
      area_year_id: 203,
      file_key: "excel/2025.xlsx",
      notes: "Seguimiento específico para investigación biomédica",
      created_at: "2024-12-18T14:45:00Z",
      updated_at: "2024-12-18T14:45:00Z"
    }
  ],
  "303": [
    {
      id: 30301,
      type: "SEGUIMIENTO",
      title: "Seguimiento FCE 2025 - Gestión Empresarial",
      area_year_id: 303,
      file_key: "excel/2025.xlsx", 
      notes: "Análisis de gestión y proyecciones empresariales",
      created_at: "2024-12-16T11:20:00Z",
      updated_at: "2024-12-16T11:20:00Z"
    }
  ]
};
