"use client"
import React, { useState } from "react";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Users, 
  FileText,
  Plus,
  Filter
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'deadline' | 'meeting' | 'review' | 'submission';
  description: string;
  participants?: string[];
  budgetId?: string;
}

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Fecha límite - Presupuestos Q1 2025",
    date: "2025-02-15",
    time: "23:59",
    type: "deadline",
    description: "Fecha límite para la entrega de presupuestos del primer trimestre",
    budgetId: "general-q1-2025"
  },
  {
    id: "2",
    title: "Reunión con Directores de Ingeniería",
    date: "2025-02-10",
    time: "14:00",
    type: "meeting",
    description: "Revisión de presupuestos pendientes y planificación",
    participants: ["Santiago Ascasibar", "Dra. María García", "Dr. Carlos López"]
  },
  {
    id: "3",
    title: "Revisión presupuesto Laboratorio",
    date: "2025-02-08",
    time: "10:00",
    type: "review",
    description: "Revisión detallada del presupuesto del laboratorio de investigación",
    budgetId: "lab-2025"
  },
  {
    id: "4",
    title: "Entrega presupuesto Biomédica",
    date: "2025-02-12",
    time: "16:30",
    type: "submission",
    description: "Entrega del presupuesto revisado del área biomédica",
    budgetId: "biomedica-2025"
  },
  {
    id: "5",
    title: "Reunión de seguimiento mensual",
    date: "2025-02-20",
    time: "11:00",
    type: "meeting",
    description: "Seguimiento mensual del estado de todos los presupuestos",
    participants: ["Equipo Finanzas", "Coordinadores"]
  }
];

const eventTypeColors = {
  deadline: "bg-red-100 text-red-800 border-red-200",
  meeting: "bg-blue-100 text-blue-800 border-blue-200",
  review: "bg-yellow-100 text-yellow-800 border-yellow-200",
  submission: "bg-green-100 text-green-800 border-green-200"
};

const eventTypeIcons = {
  deadline: Clock,
  meeting: Users,
  review: FileText,
  submission: FileText
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 1, 1)); // February 2025
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getEventsForDate = (dateStr: string) => {
    return mockEvents.filter(event => {
      const matchesDate = event.date === dateStr;
      const matchesFilter = eventTypeFilter === 'all' || event.type === eventTypeFilter;
      return matchesDate && matchesFilter;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendario</h1>
            <p className="text-gray-600">Gestión de fechas límite, reuniones y eventos importantes</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
            >
              <option value="all">Todos los eventos</option>
              <option value="deadline">Fechas límite</option>
              <option value="meeting">Reuniones</option>
              <option value="review">Revisiones</option>
              <option value="submission">Entregas</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-5 h-5" />
              <span>Nuevo Evento</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {monthNames[month]} {year}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {daysOfWeek.map(day => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month start */}
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`empty-${i}`} className="p-3"></div>
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = formatDate(year, month, day);
                const events = getEventsForDate(dateStr);
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === new Date().toISOString().split('T')[0];

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`p-2 min-h-[80px] border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50 border-blue-200' : ''
                    } ${isToday ? 'bg-yellow-50' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {events.slice(0, 2).map(event => {
                        const Icon = eventTypeIcons[event.type];
                        return (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded border ${eventTypeColors[event.type]} flex items-center`}
                          >
                            <Icon className="w-3 h-3 mr-1" />
                            <span className="truncate">{event.title}</span>
                          </div>
                        );
                      })}
                      {events.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{events.length - 2} más
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Event Details Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Events */}
          {selectedDate && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Eventos del {new Date(selectedDate).toLocaleDateString('es-AR')}
              </h3>
              {selectedEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedEvents.map(event => {
                    const Icon = eventTypeIcons[event.type];
                    return (
                      <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${eventTypeColors[event.type]}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{event.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {event.time}
                            </div>
                            {event.participants && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Participantes:</p>
                                <div className="flex flex-wrap gap-1">
                                  {event.participants.map(participant => (
                                    <span
                                      key={participant}
                                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                    >
                                      {participant}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hay eventos programados para esta fecha.</p>
              )}
            </div>
          )}

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Eventos</h3>
            <div className="space-y-3">
              {mockEvents
                .filter(event => new Date(event.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map(event => {
                  const Icon = eventTypeIcons[event.type];
                  const daysUntil = Math.ceil(
                    (new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded ${eventTypeColors[event.type]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.date).toLocaleDateString('es-AR')} - {event.time}
                        </p>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        daysUntil <= 3 ? 'bg-red-100 text-red-800' :
                        daysUntil <= 7 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {daysUntil} días
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
