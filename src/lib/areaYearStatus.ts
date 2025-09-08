import type { AreaYearStatus } from "@/api/userService";
// import { DocumentStatus } from "@/api/commentsService"; // Temporarily disabled

export type { AreaYearStatus } from "@/api/userService";

export const statusColor = (status: AreaYearStatus) => {
  switch (status) {
    case "NOT_STARTED":
      return "bg-gray-100 text-gray-800";
    case "BUDGET_STARTED":
      return "bg-blue-100 text-blue-800";
    case "NEEDS_CHANGES":
      return "bg-yellow-100 text-yellow-800";
    case "PENDING_APPROVAL":
      return "bg-purple-100 text-purple-800";
    case "BUDGET_APPROVED":
      return "bg-green-100 text-green-800";
    case "FOLLOW_UP_AVAILABLE":
      return "bg-teal-100 text-teal-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const statusLabelEs = (status: AreaYearStatus): string => {
  switch (status) {
    case "NOT_STARTED":
      return "No iniciado";
    case "BUDGET_STARTED":
      return "Presupuesto iniciado";
    case "NEEDS_CHANGES":
      return "Requiere cambios";
    case "PENDING_APPROVAL":
      return "Pendiente de aprobación";
    case "BUDGET_APPROVED":
      return "Presupuesto aprobado";
    case "FOLLOW_UP_AVAILABLE":
      return "Seguimiento disponible";
    default:
      return "Desconocido";
  }
};

// Temporarily disabled - will be restored when comments system is fixed
/*
export const areaYearStatusToDocumentStatus = (status: AreaYearStatus): DocumentStatus => {
  switch (status) {
    case "NOT_STARTED":
      return DocumentStatus.NOT_STARTED;
    case "BUDGET_STARTED":
      return DocumentStatus.BUDGET_STARTED;
    case "NEEDS_CHANGES":
      return DocumentStatus.NEEDS_CHANGES;
    case "PENDING_APPROVAL":
      return DocumentStatus.PENDING_APPROVAL;
    case "BUDGET_APPROVED":
      return DocumentStatus.BUDGET_APPROVED;
    case "FOLLOW_UP_AVAILABLE":
      return DocumentStatus.FOLLOW_UP_AVAILABLE;
    default:
      return DocumentStatus.NOT_STARTED;
  }
};
*/


