/**
 * Formats a date to a relative time string in Spanish
 * e.g., "hace 2 horas", "ayer", "hace 3 días"
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Handle future dates
  if (diffInSeconds < 0) {
    return 'ahora';
  }

  // Less than a minute
  if (diffInSeconds < 60) {
    return 'hace un momento';
  }

  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  }

  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  }

  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    if (days === 1) {
      return 'ayer';
    }
    return `hace ${days} días`;
  }

  // Less than a month
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
  }

  // Less than a year
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `hace ${months} mes${months > 1 ? 'es' : ''}`;
  }

  // Years
  const years = Math.floor(diffInSeconds / 31536000);
  return `hace ${years} año${years > 1 ? 's' : ''}`;
}

/**
 * Gets user initials from a name
 */
export function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Maps document status to comment context
 */
export function getDocumentStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    'NOT_STARTED': 'No iniciado',
    'BUDGET_STARTED': 'Presupuesto iniciado',
    'NEEDS_CHANGES': 'Necesita cambios',
    'PENDING_APPROVAL': 'Pendiente de aprobación',
    'BUDGET_APPROVED': 'Presupuesto aprobado',
    'FOLLOW_UP_AVAILABLE': 'Seguimiento disponible',
  };
  
  return statusMap[status] || status;
}
