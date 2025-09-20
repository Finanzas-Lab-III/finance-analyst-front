# Authentication System Documentation

## Overview
This document describes the complete authentication system implemented for the Finance Analyst Frontend application. The system integrates with a backend API that uses bcrypt-hashed passwords and provides role-based access control.

## Features Implemented

### ✅ Core Authentication
- **Login Form Component** (`src/components/LoginForm.tsx`)
  - Email and password validation
  - Password visibility toggle
  - Remember me functionality
  - Loading states and error handling
  - Responsive design with Tailwind CSS

- **Authentication API Service** (`src/api/authService.ts`)
  - `loginUser(email, password)` function
  - `setUserPassword(email, password, adminSecret)` function
  - Proper error handling for 401, network errors
  - TypeScript interfaces for type safety

- **Updated AuthContext** (`src/components/AuthContext.tsx`)
  - Real API integration with fallback to mock users
  - Loading and error state management
  - Persistent authentication with localStorage
  - Role-based user management

### ✅ Route Protection
- **ProtectedRoute Component** (`src/components/ProtectedRoute.tsx`)
  - Role-based access control
  - Automatic redirects for unauthorized users
  - Loading states during authentication checks

- **Updated App Routing** (`src/app/page.tsx`)
  - Automatic redirection based on user role
  - ADMINISTRADOR → `/backoffice/dashboard`
  - DIRECTOR → `/directors-home`

### ✅ User Interface Updates
- **Login Page** (`src/app/login/page.tsx`)
  - Complete login flow with form validation
  - Automatic redirect after successful login

- **Updated Headers**
  - BackofficeHeader with user dropdown and logout
  - DirectorsHomePage with user info and logout
  - Click-outside-to-close dropdown functionality

### ✅ Layout Protection
- **Backoffice Layout** (`src/app/backoffice/layout.tsx`)
  - Protected for ADMINISTRADOR role only
  - Automatic redirect for unauthorized users

- **Directors Layout** (`src/app/directors-home/layout.tsx`)
  - Protected for DIRECTOR role only
  - Automatic redirect for unauthorized users

## API Integration

### Backend Endpoints
- **Login**: `POST /api/auth/login/`
  - Body: `{"email": "user@example.com", "password": "password123"}`
  - Success Response: `{"user": {"id": 1, "email": "...", "name": "...", "role": "..."}}`
  - Error Response: `{"detail": "Credenciales inválidas"}`

- **Set Password** (Admin only): `POST /api/auth/admin-set-password/`
  - Body: `{"email": "user@example.com", "password": "newpassword", "admin_secret": "secret"}`

### Test Credentials
The system includes test credentials for development:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin.finanzas@ejemplo.com | admin123 |
| Director | director.ingenieria@ejemplo.com | director123 |
| Director FCB | director.ciencias@ejemplo.com | director123 |
| Coordinator | coord.sistemas@ejemplo.com | coord123 |

## User Roles

### ADMINISTRADOR
- Full access to backoffice features
- User management capabilities
- Access to all financial data
- Redirected to `/backoffice/dashboard`

### DIRECTOR
- Access to director-specific features
- Limited to their faculty/area data
- Redirected to `/directors-home`

## Security Features

### ✅ Client-Side Security
- No passwords stored in localStorage
- Secure token management
- Automatic logout on session expiry
- CSRF protection ready

### ✅ Form Validation
- Email format validation
- Password strength requirements
- Real-time validation feedback
- Prevents submission with invalid data

### ✅ Error Handling
- Specific error messages for different failure types
- Network error handling
- Graceful fallback to mock users for testing
- User-friendly error display

## Usage Examples

### Basic Login Flow
```typescript
import { useAuth } from '@/components/AuthContext';

function LoginComponent() {
  const { login, isLoading, error } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      // User will be automatically redirected
    } catch (error) {
      // Error is handled by AuthContext
    }
  };
}
```

### Protected Route Usage
```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

function AdminPage() {
  return (
    <ProtectedRoute requiredRole="ADMINISTRADOR">
      <div>Admin-only content</div>
    </ProtectedRoute>
  );
}
```

### Checking Authentication Status
```typescript
import { useAuth } from '@/components/AuthContext';

function MyComponent() {
  const { user, userRole, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;
  
  return <div>Welcome, {user.name}!</div>;
}
```

## File Structure

```
src/
├── api/
│   └── authService.ts          # Authentication API calls
├── components/
│   ├── AuthContext.tsx         # Authentication state management
│   ├── LoginForm.tsx           # Login form component
│   └── ProtectedRoute.tsx      # Route protection component
├── app/
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── backoffice/
│   │   └── layout.tsx          # Protected admin layout
│   ├── directors-home/
│   │   ├── layout.tsx          # Protected director layout
│   │   └── page.tsx            # Director home page
│   └── test-auth/
│       └── page.tsx            # Authentication testing page
```

## Testing

### Test Page
Visit `/test-auth` to test the authentication system with different credentials.

### Manual Testing Steps
1. Navigate to `/login`
2. Try invalid credentials (should show error)
3. Try valid credentials (should redirect to appropriate dashboard)
4. Test logout functionality
5. Test role-based access control

## Environment Variables

Make sure to set the following environment variable:

```env
NEXT_PUBLIC_SERVICE_URL=http://localhost:8000
```

## Future Enhancements

### Potential Improvements
- [ ] JWT token refresh mechanism
- [ ] Remember me with longer session duration
- [ ] Two-factor authentication
- [ ] Password reset functionality
- [ ] Session timeout warnings
- [ ] Audit logging for authentication events

## Troubleshooting

### Common Issues

1. **Login not working**: Check if backend is running on correct port
2. **Redirect loops**: Verify role assignments in AuthContext
3. **CORS errors**: Ensure backend CORS is configured for frontend URL
4. **TypeScript errors**: Check that all interfaces match backend response format

### Debug Mode
Enable debug logging by adding `console.log` statements in the AuthContext login function to see API responses and errors.

## Conclusion

The authentication system is now fully integrated and provides:
- Secure login with real backend API
- Role-based access control
- Persistent sessions
- User-friendly interface
- Comprehensive error handling
- Fallback testing capabilities

The system is ready for production use and can be easily extended with additional features as needed.
