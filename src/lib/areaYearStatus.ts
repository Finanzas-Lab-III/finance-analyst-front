import type { AreaYearStatus } from "@/api/userService";
// import { DocumentStatus } from "@/api/commentsService"; // Temporarily disabled

export type { AreaYearStatus } from "@/api/userService";

export const statusColor = (status: AreaYearStatus) => {
  switch (status) {
    case "SIN_EMPEZAR":
      return "bg-gray-100 text-gray-800";
    case "NECESITA_CAMBIOS_IA":
      return "bg-yellow-100 text-yellow-800";
    case "REVISION_FINANZAS":
      return "bg-purple-100 text-purple-800";
    case "NECESITA_CAMBIOS_FINANZAS":
      return "bg-yellow-100 text-yellow-800";
    case "APROBADO":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const statusLabelEs = (status: AreaYearStatus): string => {
  switch (status) {
    case "SIN_EMPEZAR":
      return "Sin empezar";
    case "NECESITA_CAMBIOS_IA":
      return "Necesita cambios (IA)";
    case "REVISION_FINANZAS":
      return "Revisión finanzas";
    case "NECESITA_CAMBIOS_FINANZAS":
      return "Necesita cambios (Finanzas)";
    case "APROBADO":
      return "Aprobado";
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


