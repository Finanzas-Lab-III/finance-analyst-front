export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: 'ADMINISTRADOR' | 'DIRECTOR';
  };
}

export interface AuthError {
  detail: string;
}

const AUTH_API_BASE = process.env.NEXT_PUBLIC_SERVICE_URL || 'http://localhost:8000';

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const url = `${AUTH_API_BASE}/api/auth/login/`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    let errorMessage = 'Error de autenticación';
    
    try {
      const errorData: AuthError = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // If we can't parse the error response, use the status text
      errorMessage = response.status === 401 
        ? 'Credenciales inválidas' 
        : `Error ${response.status}: ${response.statusText}`;
    }
    
    throw new Error(errorMessage);
  }

  const data: LoginResponse = await response.json();
  return data;
}

export async function setUserPassword(
  email: string, 
  password: string, 
  adminSecret: string
): Promise<void> {
  const url = `${AUTH_API_BASE}/api/auth/admin-set-password/`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      email, 
      password, 
      admin_secret: adminSecret 
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Error estableciendo contraseña';
    
    try {
      const errorData: AuthError = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = `Error ${response.status}: ${response.statusText}`;
    }
    
    throw new Error(errorMessage);
  }
}
