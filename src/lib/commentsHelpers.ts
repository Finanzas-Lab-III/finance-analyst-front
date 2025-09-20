import { DocumentStatus } from "@/api/commentsService";
import { AreaYearStatus } from "@/api/userService";

/**
 * Maps AreaYearStatus to DocumentStatus for comments API
 */
export function mapAreaYearStatusToDocumentStatus(status: AreaYearStatus): DocumentStatus {
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
