// Real Authentication System
// Replaces mock authentication with actual backend calls

const USERS_API_BASE = process.env.NEXT_PUBLIC_SERVICE_URL || "http://localhost:8000";

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role?: string;
  facultad?: string;
}

/**
 * Gets current user information from backend
 * Uses userId from cookie/localStorage to fetch real user data
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    // Get user ID from cookie or localStorage
    let userId: string | null = null;
    
    // Try to get from cookie first
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'userId') {
          userId = decodeURIComponent(value);
          break;
        }
      }
      
      // Fallback to localStorage
      if (!userId) {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            userId = parsed.id;
          } catch (e) {
            console.warn('Failed to parse saved user from localStorage');
          }
        }
      }
    }

    if (!userId) {
      console.warn('No user ID found in cookies or localStorage');
      return null;
    }

    // Fetch user details from backend
    const url = `${USERS_API_BASE}/api/admin/users/${userId}/`;
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch user ${userId}: ${response.status} ${response.statusText}`);
      return null;
    }

    const userData = await response.json();
    
    // Map backend user data to our CurrentUser interface
    const fullName = userData.nombre_apellido || `${userData.nombre || ''} ${userData.apellido || ''}`.trim();
    
    const currentUser: CurrentUser = {
      id: parseInt(userId),
      name: fullName || userData.email || `Usuario ${userId}`,
      email: userData.email || userData.mail || `user${userId}@austral.edu.ar`,
      role: userData.rol || 'USER',
      facultad: Array.isArray(userData.facultades) && userData.facultades.length > 0 
        ? userData.facultades.map((f: any) => f.nombre || f.name || String(f)).join(', ')
        : undefined
    };

    console.log('✅ Real user loaded:', currentUser);
    return currentUser;

  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

/**
 * Gets current user ID from various sources
 */
export function getCurrentUserId(): number | null {
  if (typeof window === 'undefined') return null;
  
  // Try cookie first
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'userId') {
      const id = parseInt(decodeURIComponent(value));
      if (!isNaN(id)) return id;
    }
  }
  
  // Fallback to localStorage
  try {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const id = parseInt(parsed.id);
      if (!isNaN(id)) return id;
    }
  } catch (e) {
    console.warn('Failed to parse user ID from localStorage');
  }
  
  return null;
}

/**
 * Checks if user is authenticated (has valid user ID)
 */
export function isAuthenticated(): boolean {
  return getCurrentUserId() !== null;
}
