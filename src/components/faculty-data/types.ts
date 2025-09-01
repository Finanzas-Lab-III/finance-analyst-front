export interface BudgetVariation {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
  description: string;
  fileName: string;
}

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

export interface BudgetDetail {
  id: string;
  name: string;
  faculty: string;
  area: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_review' | 'draft';
  createdBy: string;
  createdAt: string;
  lastModified: string;
  originalBudget: string;
  financeBudget?: string;
  variations: BudgetVariation[];
  totalAmount: number;
  description: string;
  items: BudgetItem[];
}

export interface BudgetComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  type: 'general' | 'approval' | 'rejection' | 'revision';
}


