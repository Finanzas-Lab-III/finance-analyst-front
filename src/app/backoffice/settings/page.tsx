"use client"
import React, { useState } from "react";
import { Save, Bell, Mail, Shield, Database, Users, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    budgetApproval: true,
    budgetSubmission: true,
    deadlineReminders: true
  });

  const [emailSettings, setEmailSettings] = useState({
    dailyDigest: true,
    weeklyReport: false,
    monthlyReport: true
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleEmailChange = (key: string, value: boolean) => {
    setEmailSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
        <p className="text-gray-600">Gestiona las preferencias del portal de finanzas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <nav className="space-y-2">
              <a href="#notifications" className="flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg">
                <Bell className="w-5 h-5 mr-3" />
                Notificaciones
              </a>
              <a href="#email" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 mr-3" />
                Email
              </a>
              <a href="#security" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                <Shield className="w-5 h-5 mr-3" />
                Seguridad
              </a>
              <a href="#system" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                <Database className="w-5 h-5 mr-3" />
                Sistema
              </a>
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notifications */}
          <div id="notifications" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notificaciones
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Notificaciones por Email</label>
                  <p className="text-sm text-gray-500">Recibir notificaciones por correo electrónico</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => handleNotificationChange('email', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Aprobación de Presupuestos</label>
                  <p className="text-sm text-gray-500">Notificar cuando un presupuesto sea aprobado</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.budgetApproval}
                  onChange={(e) => handleNotificationChange('budgetApproval', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Nuevos Presupuestos</label>
                  <p className="text-sm text-gray-500">Notificar cuando se envíe un nuevo presupuesto</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.budgetSubmission}
                  onChange={(e) => handleNotificationChange('budgetSubmission', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Recordatorios de Fecha Límite</label>
                  <p className="text-sm text-gray-500">Recordatorios antes de fechas límite importantes</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.deadlineReminders}
                  onChange={(e) => handleNotificationChange('deadlineReminders', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div id="email" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Configuración de Email
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Resumen Diario</label>
                  <p className="text-sm text-gray-500">Recibir un resumen diario de actividades</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailSettings.dailyDigest}
                  onChange={(e) => handleEmailChange('dailyDigest', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Reporte Semanal</label>
                  <p className="text-sm text-gray-500">Reporte semanal de presupuestos</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailSettings.weeklyReport}
                  onChange={(e) => handleEmailChange('weeklyReport', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Reporte Mensual</label>
                  <p className="text-sm text-gray-500">Análisis mensual completo</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailSettings.monthlyReport}
                  onChange={(e) => handleEmailChange('monthlyReport', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Security */}
          <div id="security" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Seguridad
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Cambiar Contraseña
                </label>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  Cambiar Contraseña
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Autenticación de Dos Factores
                </label>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Estado: Deshabilitado</span>
                  <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                    Habilitar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Sesiones Activas
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">
                    <div>Sesión actual - Chrome en macOS</div>
                    <div className="text-xs text-gray-500">Última actividad: hace 5 minutos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div id="system" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Configuración del Sistema
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Zona Horaria
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>UTC-3 (Buenos Aires)</option>
                  <option>UTC-5 (Nueva York)</option>
                  <option>UTC+0 (Londres)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Idioma
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>Español</option>
                  <option>English</option>
                  <option>Português</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Formato de Fecha
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              <Save className="w-5 h-5" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
