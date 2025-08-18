"use client"
import React, { useState } from "react";
import { Search, User, Mail, Phone, Calendar, Edit, Eye, Plus, Building } from "lucide-react";

interface Director {
  id: string;
  name: string;
  email: string;
  phone: string;
  faculty: string;
  area: string;
  joinDate: string;
  budgetsCount: number;
  status: 'active' | 'inactive';
  lastLogin: string;
}

const mockDirectors: Director[] = [
  {
    id: "1",
    name: "Dr. Juan Pérez",
    email: "juan.perez@universidad.edu",
    phone: "+54 11 1234-5678",
    faculty: "Ingeniería",
    area: "Laboratorio",
    joinDate: "2020-03-15",
    budgetsCount: 8,
    status: "active",
    lastLogin: "2024-01-20"
  },
  {
    id: "2",
    name: "Dra. María García", 
    email: "maria.garcia@universidad.edu",
    phone: "+54 11 2345-6789",
    faculty: "Ingeniería",
    area: "Biomédica",
    joinDate: "2019-08-22",
    budgetsCount: 12,
    status: "active",
    lastLogin: "2024-01-19"
  },
  {
    id: "3",
    name: "Dr. Carlos López",
    email: "carlos.lopez@universidad.edu", 
    phone: "+54 11 3456-7890",
    faculty: "Ingeniería",
    area: "General",
    joinDate: "2018-01-10",
    budgetsCount: 15,
    status: "active",
    lastLogin: "2024-01-18"
  },
  {
    id: "4",
    name: "Dra. Ana Rodríguez",
    email: "ana.rodriguez@universidad.edu",
    phone: "+54 11 4567-8901",
    faculty: "Medicina",
    area: "Investigación",
    joinDate: "2021-06-12",
    budgetsCount: 6,
    status: "inactive",
    lastLogin: "2024-01-10"
  }
];

export default function DirectorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [facultyFilter, setFacultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<Director['status'] | 'all'>('all');

  const filteredDirectors = mockDirectors.filter(director => {
    const matchesSearch = director.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         director.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaculty = facultyFilter === 'all' || director.faculty === facultyFilter;
    const matchesStatus = statusFilter === 'all' || director.status === statusFilter;
    
    return matchesSearch && matchesFaculty && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Directores de Cátedra</h1>
            <p className="text-gray-600">Gestión de directores y sus presupuestos</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-5 h-5" />
            <span>Nuevo Director</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar directores..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Faculty Filter */}
          <div className="md:w-48">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={facultyFilter}
              onChange={(e) => setFacultyFilter(e.target.value)}
            >
              <option value="all">Todas las facultades</option>
              <option value="Ingeniería">Ingeniería</option>
              <option value="Medicina">Medicina</option>
              <option value="Ciencias">Ciencias</option>
              <option value="Humanidades">Humanidades</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:w-48">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Director['status'] | 'all')}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDirectors.map((director) => (
          <div key={director.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{director.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      director.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {director.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-gray-500 hover:text-gray-700 p-1">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-gray-500 hover:text-gray-700 p-1">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {director.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {director.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="w-4 h-4 mr-2" />
                  {director.faculty} - {director.area}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Desde {new Date(director.joinDate).toLocaleDateString('es-AR')}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Presupuestos</span>
                  <span className="font-medium text-gray-900">{director.budgetsCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Último acceso</span>
                  <span className="text-gray-500">{new Date(director.lastLogin).toLocaleDateString('es-AR')}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                Ver presupuestos →
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDirectors.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No se encontraron directores con los filtros aplicados.</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{mockDirectors.length}</div>
            <div className="text-sm text-gray-600">Total Directores</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {mockDirectors.filter(d => d.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Activos</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600">4</div>
            <div className="text-sm text-gray-600">Facultades</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {mockDirectors.reduce((sum, d) => sum + d.budgetsCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Presupuestos Totales</div>
          </div>
        </div>
      </div>
    </div>
  );
}
