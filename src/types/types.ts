// YearsOfAreaItemDto: lo que la UI necesita para las tablas/links
export interface YearsOfAreaItemDto {
  area_year_id: number;
  year: number;
  isCurrent: boolean;
  isFuture: boolean;
  status: string; // "BUDGET_STARTED" | "BUDGET_APPROVED" | "NOT_STARTED" | ...
}

// Para devolver nombre del área + items ya mapeados
export interface YearsOfAreaResponse {
  areaName: string;
  items: YearsOfAreaItemDto[];
}
