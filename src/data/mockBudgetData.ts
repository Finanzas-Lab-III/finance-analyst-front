// Mock data for budget years 2023, 2024, 2025
export interface BudgetItem {
  id: number;
  nombre_recurso: string;
  tipo_contratacion: string;
  meses: number;
  remuneracion_bruta_mensual: number;
  costo_total: number;
  mes_inicio: string;
  comentarios: string;
}

export interface BudgetData {
  year: string;
  archivo: string;
  estatus: string;
  ultima_actualizacion: string;
  actualizado_por: string;
  items: BudgetItem[];
}

export const mockBudgetData: Record<string, BudgetData> = {
  "2025": {
    year: "2025",
    archivo: "2025.xlsx",
    estatus: "En Proceso",
    ultima_actualizacion: "15/12/2024",
    actualizado_por: "Fernando Vassolo",
    items: [
      {
        id: 1,
        nombre_recurso: "Ayudante de prácticas",
        tipo_contratacion: "Docente Nómina",
        meses: 10,
        remuneracion_bruta_mensual: 230000,
        costo_total: 2300000,
        mes_inicio: "Febrero",
        comentarios: "Asistencia en prácticas de laboratorio de investigación"
      },
      {
        id: 2,
        nombre_recurso: "Docente auxiliar",
        tipo_contratacion: "Docente Nómina",
        meses: 10,
        remuneracion_bruta_mensual: 210000,
        costo_total: 2100000,
        mes_inicio: "Febrero",
        comentarios: "Encargado de clases de laboratorio analítico"
      },
      {
        id: 3,
        nombre_recurso: "Investigador asistente",
        tipo_contratacion: "Docente Factura",
        meses: 10,
        remuneracion_bruta_mensual: 230000,
        costo_total: 2300000,
        mes_inicio: "Febrero",
        comentarios: "Apoyo en proyectos de investigación básica"
      },
      {
        id: 4,
        nombre_recurso: "Becario de investigación",
        tipo_contratacion: "Docente Factura",
        meses: 5,
        remuneracion_bruta_mensual: 85000,
        costo_total: 425000,
        mes_inicio: "Febrero",
        comentarios: "Proyecto sobre cinética de reacciones enzimáticas"
      },
      {
        id: 5,
        nombre_recurso: "Técnico de instrumentación",
        tipo_contratacion: "No Docente Factura",
        meses: 10,
        remuneracion_bruta_mensual: 200000,
        costo_total: 2000000,
        mes_inicio: "Febrero",
        comentarios: "Mantenimiento de espectrómetros y cromatógrafo"
      }
    ]
  },
  "2024": {
    year: "2024",
    archivo: "2024.xlsx",
    estatus: "Aprobado",
    ultima_actualizacion: "05/12/2023",
    actualizado_por: "Fernando Vassolo",
    items: [
      {
        id: 1,
        nombre_recurso: "Ayudante de prácticas",
        tipo_contratacion: "Docente Nómina",
        meses: 10,
        remuneracion_bruta_mensual: 220000,
        costo_total: 2200000,
        mes_inicio: "Febrero",
        comentarios: "Asistencia en prácticas de laboratorio de investigación"
      },
      {
        id: 2,
        nombre_recurso: "Docente auxiliar",
        tipo_contratacion: "Docente Nómina",
        meses: 10,
        remuneracion_bruta_mensual: 200000,
        costo_total: 2000000,
        mes_inicio: "Febrero",
        comentarios: "Encargado de clases de laboratorio analítico"
      },
      {
        id: 3,
        nombre_recurso: "Investigador asistente",
        tipo_contratacion: "Docente Factura",
        meses: 10,
        remuneracion_bruta_mensual: 220000,
        costo_total: 2200000,
        mes_inicio: "Febrero",
        comentarios: "Apoyo en proyectos de investigación básica"
      },
      {
        id: 4,
        nombre_recurso: "Analista de datos",
        tipo_contratacion: "No Docente Factura",
        meses: 10,
        remuneracion_bruta_mensual: 150000,
        costo_total: 1500000,
        mes_inicio: "Febrero",
        comentarios: "Procesamiento estadístico de muestras experimentales"
      },
      {
        id: 5,
        nombre_recurso: "Encargado de stock",
        tipo_contratacion: "No Docente Factura",
        meses: 10,
        remuneracion_bruta_mensual: 120000,
        costo_total: 1200000,
        mes_inicio: "Febrero",
        comentarios: "Control de inventario de reactivos y materiales"
      }
    ]
  },
  "2023": {
    year: "2023",
    archivo: "2023.xlsx",
    estatus: "Aprobado",
    ultima_actualizacion: "08/12/2022",
    actualizado_por: "Fernando Vassolo",
    items: [
      {
        id: 1,
        nombre_recurso: "Ayudante de prácticas",
        tipo_contratacion: "Docente Nómina",
        meses: 10,
        remuneracion_bruta_mensual: 200000,
        costo_total: 2000000,
        mes_inicio: "Febrero",
        comentarios: "Asistencia en prácticas de laboratorio de investigación"
      },
      {
        id: 2,
        nombre_recurso: "Docente auxiliar",
        tipo_contratacion: "Docente Nómina",
        meses: 10,
        remuneracion_bruta_mensual: 180000,
        costo_total: 1800000,
        mes_inicio: "Febrero",
        comentarios: "Encargado de clases de laboratorio analítico"
      },
      {
        id: 3,
        nombre_recurso: "Supervisor de seguridad",
        tipo_contratacion: "No Docente Factura",
        meses: 10,
        remuneracion_bruta_mensual: 250000,
        costo_total: 2500000,
        mes_inicio: "Febrero",
        comentarios: "Implementación de normas de seguridad en laboratorio"
      },
      {
        id: 4,
        nombre_recurso: "Asistente administrativo",
        tipo_contratacion: "No Docente Nómina",
        meses: 10,
        remuneracion_bruta_mensual: 100000,
        costo_total: 1000000,
        mes_inicio: "Febrero",
        comentarios: "Gestión de documentación y compras de insumos"
      }
    ]
  }
};

export const getBudgetData = (year: string): BudgetData | null => {
  return mockBudgetData[year] || null;
};

export const getAllBudgetYears = (): string[] => {
  return Object.keys(mockBudgetData).sort((a, b) => parseInt(b) - parseInt(a));
};
