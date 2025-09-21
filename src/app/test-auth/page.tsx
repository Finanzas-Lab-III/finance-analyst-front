'use client';

import { useAuth } from '@/components/AuthContext';
import { useState, useEffect } from 'react';

export default function TestAuthPage() {
  const { user, userRole, login, logout } = useAuth();
  const [testEmail, setTestEmail] = useState('director@universidad.edu');
  const [testPassword, setTestPassword] = useState('password123');
  const [cookies, setCookies] = useState<Record<string, string>>({});

  // Read cookies on component mount
  useEffect(() => {
    const cookieString = document.cookie;
    const cookieObj: Record<string, string> = {};
    cookieString.split(';').forEach(cookie => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        cookieObj[key] = decodeURIComponent(value);
      }
    });
    setCookies(cookieObj);
  }, [user, userRole]);

  const handleTestLogin = async () => {
    try {
      await login(testEmail, testPassword);
      // Refresh cookies after login
      const cookieString = document.cookie;
      const cookieObj: Record<string, string> = {};
      cookieString.split(';').forEach(cookie => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          cookieObj[key] = decodeURIComponent(value);
        }
      });
      setCookies(cookieObj);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
    // Refresh cookies after logout
    const cookieString = document.cookie;
    const cookieObj: Record<string, string> = {};
    cookieString.split(';').forEach(cookie => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        cookieObj[key] = decodeURIComponent(value);
      }
    });
    setCookies(cookieObj);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Cookie-Based Authentication Test</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Current Auth State</h2>
          <div className="space-y-2 text-gray-300">
            <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'Not logged in'}</p>
            <p><strong>Role:</strong> {userRole || 'None'}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Cookies</h2>
          <div className="space-y-2 text-gray-300">
            <p><strong>userRole:</strong> {cookies.userRole || 'Not set'}</p>
            <p><strong>userId:</strong> {cookies.userId || 'Not set'}</p>
            <p><strong>All cookies:</strong> {JSON.stringify(cookies, null, 2)}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Login</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Email:</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Password:</label>
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
              />
            </div>
            <button
              onClick={handleTestLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Test Login
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Credentials</h2>
          <div className="space-y-2 text-gray-300">
            <p><strong>Director:</strong> director@universidad.edu / password123</p>
            <p><strong>Finance:</strong> finanzas@universidad.edu / password123</p>
            <p><strong>Admin:</strong> admin@mail.austral.edu.ar / password123</p>
            <p><strong>Director Ing:</strong> director-ing@mail.austral.edu.ar / password123</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Expected Behavior</h2>
          <div className="space-y-2 text-gray-300">
            <p>• <strong>Director login:</strong> Should set userRole=director cookie and redirect to /backoffice/archive</p>
            <p>• <strong>Finance login:</strong> Should set userRole=finance cookie and redirect to /backoffice/archive</p>
            <p>• <strong>Main page:</strong> Should check userRole cookie and redirect accordingly</p>
          </div>
        </div>

        {user && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
