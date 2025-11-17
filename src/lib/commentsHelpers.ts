import { DocumentStatus } from "@/api/commentsService";
import { AreaYearStatus } from "@/api/userService";

/**
 * Maps AreaYearStatus to DocumentStatus for comments API
 */
export function mapAreaYearStatusToDocumentStatus(status: AreaYearStatus): DocumentStatus {
  switch (status) {
    case "SIN_EMPEZAR":
      return DocumentStatus.NOT_STARTED;
    case "NECESITA_CAMBIOS_IA":
      return DocumentStatus.NEEDS_CHANGES;
    case "REVISION_FINANZAS":
      return DocumentStatus.PENDING_APPROVAL;
    case "NECESITA_CAMBIOS_FINANZAS":
      return DocumentStatus.NEEDS_CHANGES;
    case "APROBADO":
      return DocumentStatus.BUDGET_APPROVED;
    default:
      return DocumentStatus.NOT_STARTED;
  }
}

/**
 * Validates if a user can edit a comment
 */
export function canUserEditComment(commentUserId: number, currentUserId: number): boolean {
  return commentUserId === currentUserId;
}

/**
 * Validates if a user can delete a comment
 */
export function canUserDeleteComment(commentUserId: number, currentUserId: number): boolean {
  return commentUserId === currentUserId;
}

/**
 * Validates comment content
 */
export function validateCommentContent(content: string): { isValid: boolean; error?: string } {
  if (!content.trim()) {
    return { isValid: false, error: 'El contenido del comentario no puede estar vacío' };
  }
  
  if (content.length > 1000) {
    return { isValid: false, error: 'El comentario no puede exceder los 1000 caracteres' };
  }
  
  return { isValid: true };
}

/**
 * Gets the document ID from area year ID (assuming they're the same)
 */
export function getDocumentIdFromAreaYearId(areaYearId: string): number {
  const id = parseInt(areaYearId);
  if (isNaN(id)) {
    throw new Error('Invalid area year ID format');
  }
  return id;
}

/**
 * Formats a comment count for display
 */
export function formatCommentCount(count: number): string {
  if (count === 0) return 'Sin comentarios';
  if (count === 1) return '1 comentario';
  return `${count} comentarios`;
}

/**
 * Gets comment preview text (truncated)
 */
export function getCommentPreview(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + '...';
}
