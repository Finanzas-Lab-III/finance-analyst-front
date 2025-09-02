"use client"
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Save, 
  X, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  FileText,
  History,
  User,
  Calendar,
  Upload,
  MessageSquare,
  Send
} from "lucide-react";
import Link from "next/link";

interface BudgetDetail {
  id: string;
  name: string;
  faculty: string;
  area: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_review' | 'draft';
  createdBy: string;
  createdAt: string;
  lastModified: string;
  originalBudget: string;
  financeBudget?: string;
  variations: BudgetVariation[];
  totalAmount: number;
  description: string;
  items: BudgetItem[];
}

interface BudgetVariation {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
  description: string;
  fileName: string;
}

interface BudgetItem {
  id: number;
  nombre_recurso: string;
  tipo_contratacion: string;
  meses: number;
  remuneracion_bruta_mensual: number;
  costo_total: number;
  mes_inicio: string;
  comentarios: string;
}

interface BudgetComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  type: 'general' | 'approval' | 'rejection' | 'revision';
}

// Mock data for faculty-old-year detail
const mockBudgetDetail: BudgetDetail = {
  id: "1",
  name: "Presupuesto Laboratorio 2025",
  faculty: "Ingeniería",
  area: "Laboratorio",
  status: "pending",
  createdBy: "Santiago Ascasibar",
  createdAt: "2024-01-15",
  lastModified: "2024-01-20",
  originalBudget: "lab_2025_original.xlsx",
  financeBudget: "lab_2025_finance.xlsx",
  totalAmount: 1500000,
  description: "Presupuesto para equipamiento y personal del laboratorio de investigación para el año 2025",
  variations: [
    {
      id: "1",
      name: "Versión inicial",
      createdAt: "2024-01-15",
      createdBy: "Santiago Ascasibar",
      description: "Presupuesto original presentado por el director",
      fileName: "lab_2025_v1.xlsx"
    },
    {
      id: "2", 
      name: "Revisión finanzas",
      createdAt: "2024-01-18",
      createdBy: "Ana Martínez (Finanzas)",
      description: "Ajustes en costos de personal y equipamiento",
      fileName: "lab_2025_v2.xlsx"
    },
    {
      id: "3",
      name: "Ajuste final",
      createdAt: "2024-01-20",
      createdBy: "Carlos González (Finanzas)",
      description: "Optimización de recursos y redistribución de partidas",
      fileName: "lab_2025_v3.xlsx"
    }
  ],
  items: [
    {
      id: 1,
      nombre_recurso: "Ayudante de prácticas",
      tipo_contratacion: "Docente Nómina",
      meses: 10,
      remuneracion_bruta_mensual: 230000,
      costo_total: 2300000,
      mes_inicio: "Febrero",
      comentarios: "Asistencia en prácticas de laboratorio de investigación"
    },
    {
      id: 2,
      nombre_recurso: "Equipamiento científico",
      tipo_contratacion: "Compra directa",
      meses: 1,
      remuneracion_bruta_mensual: 500000,
      costo_total: 500000,
      mes_inicio: "Marzo",
      comentarios: "Microscopio y equipos de medición"
    }
  ]
};

const mockComments: BudgetComment[] = [
  {
    id: "1",
    author: "Ana Martínez (Finanzas)",
    content: "Revisé el presupuesto inicial. Los costos de personal están dentro del rango esperado, pero necesitamos ajustar los gastos de equipamiento.",
    createdAt: "2024-01-18T10:30:00Z",
    type: "revision"
  },
  {
    id: "2",
    author: "Santiago Ascasibar",
    content: "Gracias por los comentarios. He reducido un 15% el presupuesto de equipamiento y redistribuido hacia material de laboratorio.",
    createdAt: "2024-01-19T14:15:00Z",
    type: "general"
  },
  {
    id: "3",
    author: "Carlos González (Finanzas)",
    content: "La nueva versión se ve mucho mejor. Aprobado para el siguiente trimestre con las modificaciones realizadas.",
    createdAt: "2024-01-20T09:45:00Z",
    type: "approval"
  }
];

const getStatusIcon = (status: BudgetDetail['status']) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-5 h-5 text-yellow-500" />;
    case 'approved':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'rejected':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'in_review':
      return <AlertCircle className="w-5 h-5 text-blue-500" />;
    case 'draft':
      return <Edit className="w-5 h-5 text-gray-500" />;
    default:
      return null;
  }
};

const getStatusText = (status: BudgetDetail['status']) => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'approved':
      return 'Aprobado';
    case 'rejected':
      return 'Rechazado';
    case 'in_review':
      return 'En Revisión';
    case 'draft':
      return 'Borrador';
    default:
      return 'Desconocido';
  }
};

const getStatusColor = (status: BudgetDetail['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'in_review':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function BudgetDetailPage() {
  const params = useParams();
  const budgetId = params.id as string;
  
  const [budget] = useState<BudgetDetail>(mockBudgetDetail);
  const [comments] = useState<BudgetComment[]>(mockComments);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<BudgetDetail['status']>(budget.status);
  const [activeTab, setActiveTab] = useState<'overview' | 'original' | 'finance' | 'variations' | 'comments'>('overview');
  const [newComment, setNewComment] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleStatusChange = () => {
    // Aquí implementarías la lógica para cambiar el estado
    console.log(`Cambiando estado a: ${newStatus}`);
    setIsEditingStatus(false);
    // Actualizar el estado del presupuesto
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      // Aquí implementarías la lógica para enviar el comentario
      console.log("Nuevo comentario:", newComment);
      setNewComment("");
    }
  };

  const getCommentTypeColor = (type: BudgetComment['type']) => {
    switch (type) {
      case 'approval':
        return 'bg-green-50 border-green-200';
      case 'rejection':
        return 'bg-red-50 border-red-200';
      case 'revision':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/backoffice"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Volver al portal
          </Link>
        </div>
      </div>

      {/* Budget Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{budget.name}</h1>
            <p className="text-gray-600 mb-4">{budget.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <User className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Creado por:</span>
                <span className="ml-1 font-medium">{budget.createdBy}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-600">Fecha:</span>
                <span className="ml-1 font-medium">{new Date(budget.createdAt).toLocaleDateString('es-AR')}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600">Área:</span>
                <span className="ml-1 font-medium">{budget.faculty} - {budget.area}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(budget.totalAmount)}</div>
              <div className="text-sm text-gray-500">Monto total</div>
            </div>
            
            {/* Status with edit capability */}
            <div className="flex items-center space-x-2">
              {!isEditingStatus ? (
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(budget.status)}`}>
                    {getStatusIcon(budget.status)}
                    <span className="ml-1">{getStatusText(budget.status)}</span>
                  </span>
                  <button
                    onClick={() => setIsEditingStatus(true)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                    title="Cambiar estado"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as BudgetDetail['status'])}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in_review">En Revisión</option>
                    <option value="approved">Aprobado</option>
                    <option value="rejected">Rechazado</option>
                    <option value="draft">Borrador</option>
                  </select>
                  <button
                    onClick={handleStatusChange}
                    className="text-green-600 hover:text-green-800 p-1"
                    title="Guardar"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingStatus(false);
                      setNewStatus(budget.status);
                    }}
                    className="text-gray-500 hover:text-gray-700 p-1"
                    title="Cancelar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('original')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'original'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Presupuesto Original
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'finance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Presupuesto Finanzas
            </button>
            <button
              onClick={() => setActiveTab('variations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'variations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Variaciones ({budget.variations.length})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'comments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Comentarios ({comments.length})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'comments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Comentarios
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Información General</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Facultad:</span> <span className="font-medium">{budget.faculty}</span></div>
                    <div><span className="text-gray-600">Área:</span> <span className="font-medium">{budget.area}</span></div>
                    <div><span className="text-gray-600">Total de ítems:</span> <span className="font-medium">{budget.items.length}</span></div>
                    <div><span className="text-gray-600">Última modificación:</span> <span className="font-medium">{new Date(budget.lastModified).toLocaleDateString('es-AR')}</span></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Archivos</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm">{budget.originalBudget}</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    {budget.financeBudget && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm">{budget.financeBudget}</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Budget Items Summary */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Resumen de Ítems</h3>
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recurso</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meses</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {budget.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.nombre_recurso}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.tipo_contratacion}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.meses}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(item.costo_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Original Budget Tab */}
          {activeTab === 'original' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Presupuesto Original del Director</h3>
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Download className="w-4 h-4" />
                    <span>Descargar</span>
                  </button>
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Nueva Versión</span>
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm mb-2">Archivo: {budget.originalBudget}</p>
                <p className="text-gray-600 text-sm">Este es el presupuesto original presentado por el director de cátedra.</p>
                {/* Aquí podrías integrar un componente para mostrar el Excel */}
              </div>
            </div>
          )}

          {/* Finance Budget Tab */}
          {activeTab === 'finance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Presupuesto Analizado por Finanzas</h3>
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Download className="w-4 h-4" />
                    <span>Descargar</span>
                  </button>
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Subir Versión</span>
                  </button>
                </div>
              </div>
              {budget.financeBudget ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm mb-2">Archivo: {budget.financeBudget}</p>
                  <p className="text-gray-600 text-sm">Este es el presupuesto analizado y mejorado por el equipo de finanzas.</p>
                  {/* Aquí podrías integrar un componente para mostrar el Excel */}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">No hay presupuesto de finanzas disponible aún.</p>
                </div>
              )}
            </div>
          )}

          {/* Variations Tab */}
          {activeTab === 'variations' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Historial de Versiones</h3>
              <div className="space-y-3">
                {budget.variations.map((variation) => (
                  <div key={variation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <History className="w-4 h-4 text-gray-400" />
                          <h4 className="font-medium text-gray-900">{variation.name}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(variation.createdAt).toLocaleDateString('es-AR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{variation.description}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <User className="w-3 h-3 mr-1" />
                          {variation.createdBy}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{variation.fileName}</span>
                        <button className="text-blue-600 hover:text-blue-800 p-1">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900">Comentarios y Comunicación</h3>
              
              {/* Add Comment */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Agregar Comentario</h4>
                <div className="space-y-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe tu comentario o observación..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleCommentSubmit}
                      disabled={!newComment.trim()}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className={`border rounded-lg p-4 ${getCommentTypeColor(comment.type)}`}>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{comment.author}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString('es-AR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {comment.type !== 'general' && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              comment.type === 'approval' ? 'bg-green-100 text-green-800' :
                              comment.type === 'rejection' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {comment.type === 'approval' ? 'Aprobación' :
                               comment.type === 'rejection' ? 'Rechazo' : 'Revisión'}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Subir Nueva Versión</h3>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Archivo de Presupuesto
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Arrastra un archivo aquí o haz clic para seleccionar</p>
                    <input type="file" className="hidden" accept=".xlsx,.xls,.csv" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción de cambios
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe los cambios realizados en esta versión..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Subir Archivo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
