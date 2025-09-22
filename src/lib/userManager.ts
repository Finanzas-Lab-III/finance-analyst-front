// User Management System for Real Names in Comments
// This allows easy configuration of which real user is currently logged in

const USERS_API_BASE = process.env.NEXT_PUBLIC_SERVICE_URL || "http://localhost:8000";

export interface RealUser {
  id: number;
  name: string;
  email: string;
  role?: string;
  facultad?: string;
}

// Available real users in the system
export const AVAILABLE_USERS = {
  // Finance Team - can be used as default
  EQUIPO_FINANZAS: { id: 1, name: "Equipo Finanzas", email: "finanzas@austral.edu.ar" },
  
  // Real users from backend
  CARLOS_PEREZ: { id: 2, name: "Carlos Pérez", email: "director.ingenieria@ejemplo.com" },
  MARIA_GONZALEZ: { id: 3, name: "María González", email: "director.ciencias@ejemplo.com" },
  JORGE_MARTINEZ: { id: 4, name: "Jorge Martínez", email: "secretario.ingenieria@ejemplo.com" },
  LAURA_SILVA: { id: 5, name: "Laura Silva", email: "secretario.ciencias@ejemplo.com" },
  ROBERTO_FERNANDEZ: { id: 6, name: "Roberto Fernández", email: "coord.sistemas@ejemplo.com" }
};

/**
 * Set the current user (for easy switching between users)
 */
export function setCurrentUser(userKey: keyof typeof AVAILABLE_USERS | number) {
  let userId: number;
  let userName: string;
  let userEmail: string;

  if (typeof userKey === 'number') {
    userId = userKey;
    userName = `Usuario ${userId}`;
    userEmail = `user${userId}@austral.edu.ar`;
  } else {
    const user = AVAILABLE_USERS[userKey];
    userId = user.id;
    userName = user.name;
    userEmail = user.email;
  }

  // Set cookie for the application to read
  if (typeof window !== 'undefined') {
    document.cookie = `userId=${userId}; path=/; max-age=86400`;
    
    // Also set localStorage for compatibility
    const mockUser = {
      id: userId.toString(),
      name: userName,
      email: userEmail,
      role: 'director'
    };
    
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    localStorage.setItem('testRole', 'director');
    document.cookie = `userRole=director; path=/; max-age=86400`;
    
    console.log(`✅ Usuario configurado: ${userName} (ID: ${userId})`);
  }

  return { id: userId, name: userName, email: userEmail };
}

/**
 * Gets current user information from backend
 */
export async function getCurrentUser(): Promise<RealUser | null> {
  let userId: string | null = null;
  
  try {
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
      console.warn('No user ID found - using default Equipo Finanzas');
      // Use Equipo Finanzas as default
      return {
        id: 1,
        name: "Equipo Finanzas",
        email: "finanzas@austral.edu.ar",
        role: "FINANCE"
      };
    }

    console.log(`🔍 Fetching user data for ID: ${userId}`);

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
      
      // Fallback to predefined users instead of generic "Equipo Finanzas"
      const userIdNum = parseInt(userId);
      const predefinedUser = Object.values(AVAILABLE_USERS).find(u => u.id === userIdNum);
      
      if (predefinedUser) {
        console.log(`📋 Using predefined user: ${predefinedUser.name}`);
        return {
          id: userIdNum,
          name: predefinedUser.name,
          email: predefinedUser.email,
          role: "DIRECTOR"
        };
      }
      
      // Final fallback to Equipo Finanzas
      return {
        id: userIdNum,
        name: "Equipo Finanzas",
        email: "finanzas@austral.edu.ar",
        role: "FINANCE"
      };
    }

    const userData = await response.json();
    console.log('📥 Backend user data:', userData);
    
    // Map backend user data to our interface
    const fullName = userData.nombre_apellido || userData.email || `Usuario ${userId}`;
    
    const currentUser: RealUser = {
      id: parseInt(userId),
      name: fullName,
      email: userData.mail || userData.email || `user${userId}@austral.edu.ar`,
      role: userData.rol || 'USER',
      facultad: Array.isArray(userData.facultades) && userData.facultades.length > 0 
        ? userData.facultades.map((f: any) => f.nombre || f.name || String(f)).join(', ')
        : undefined
    };

    console.log('✅ Real user loaded:', currentUser);
    return currentUser;

  } catch (error) {
    console.error('Error fetching current user:', error);
    
    // Try to use predefined user if we have a userId
    if (userId) {
      const userIdNum = parseInt(userId);
      const predefinedUser = Object.values(AVAILABLE_USERS).find(u => u.id === userIdNum);
      
      if (predefinedUser) {
        console.log(`📋 Fallback to predefined user: ${predefinedUser.name}`);
        return {
          id: userIdNum,
          name: predefinedUser.name,
          email: predefinedUser.email,
          role: "DIRECTOR"
        };
      }
    }
    
    // Final fallback to Equipo Finanzas
    return {
      id: 1,
      name: "Equipo Finanzas", 
      email: "finanzas@austral.edu.ar",
      role: "FINANCE"
    };
  }
}

/**
 * Quick user switching functions for easy testing
 */
export const switchToUser = {
  equipoFinanzas: () => setCurrentUser('EQUIPO_FINANZAS'),
  carlosPerez: () => setCurrentUser('CARLOS_PEREZ'),
  mariaGonzalez: () => setCurrentUser('MARIA_GONZALEZ'),
  jorgeMartinez: () => setCurrentUser('JORGE_MARTINEZ'),
  lauraSilva: () => setCurrentUser('LAURA_SILVA'),
  robertoFernandez: () => setCurrentUser('ROBERTO_FERNANDEZ')
};

// Make functions available globally for easy debugging
if (typeof window !== 'undefined') {
  (window as any).setCurrentUser = setCurrentUser;
  (window as any).switchToUser = switchToUser;
  (window as any).getCurrentUser = getCurrentUser;
}
