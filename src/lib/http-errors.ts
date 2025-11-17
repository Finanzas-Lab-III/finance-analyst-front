// Centralized helper to turn raw HTTP/axios/fetch errors into friendly messages (ES)

export type FriendlyError = {
  title: string;
  message: string;
  code?: number | string;
};

function extractStatus(error: any): number | undefined {
  // axios error
  if (error?.response?.status) return error.response.status;
  // fetch Response passed through
  if (typeof error?.status === 'number') return error.status;
  // errors like TypeError: Failed to fetch
  return undefined;
}

export function toFriendlyError(error: unknown, fallback: string = 'Ocurrió un error inesperado.'):
  FriendlyError {
  const status = extractStatus(error as any);
  const rawMessage = (error as any)?.message || String(error || '');

  // Map common statuses
  if (status === 400) {
    return {
      title: 'Solicitud inválida',
      message: 'Algunos datos enviados no son válidos. Verificá los parámetros o intentá nuevamente.',
      code: status,
    };
  }
  if (status === 401) {
    return {
      title: 'No autorizado',
      message: 'Necesitás iniciar sesión para ver esta información.',
      code: status,
    };
  }
  if (status === 403) {
    return {
      title: 'Acceso denegado',
      message: 'No tenés permisos suficientes para realizar esta acción.',
      code: status,
    };
  }
  if (status === 404) {
    return {
      title: 'No encontrado',
      message: 'No pudimos encontrar la información solicitada. Puede que aún no exista.',
      code: status,
    };
  }
  if (status === 500) {
    return {
      title: 'Error del servidor',
      message: 'Hay un problema en el servidor. Intentalo más tarde.',
      code: status,
    };
  }

  // Network issues
  if (rawMessage?.toLowerCase?.().includes('network') || rawMessage?.includes('Failed to fetch')) {
    return {
      title: 'Problema de conexión',
      message: 'No pudimos conectarnos al servidor. Verificá tu conexión e intentá nuevamente.',
    };
  }

  return {
    title: 'Error',
    message: fallback || 'Ocurrió un error inesperado.',
    code: status,
  };
}

export function formatFriendlyErrorInline(err: FriendlyError): string {
  // For compact in-line display blocks
  return err.code ? `${err.title} (código ${err.code}). ${err.message}` : `${err.title}. ${err.message}`;
}


