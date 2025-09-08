"use client"
import React, { useEffect, useState } from "react";
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
  Send,
  Eye
} from "lucide-react";
import Link from "next/link";
import TabManager from "@/components/TabManager";
import OverviewTab from "@/components/faculty-data/OverviewTab";
import BudgetTab from "@/components/faculty-data/BudgetTab";
import TrackingTab from "@/components/faculty-data/TrackingTab";
import IntegratedComments from "@/components/IntegratedComments";
import DocumentSnapshotModal from "@/components/faculty-data/DocumentSnapshotModal";
import UploadBudgetModal from "@/components/faculty-data/UploadBudgetModal";
import { useAreaYearStatus } from "@/hooks/useAreaYearStatus";
import { statusColor as areaYearStatusColor, statusLabelEs as areaYearStatusLabel } from "@/lib/areaYearStatus";
import { mapAreaYearStatusToDocumentStatus, getDocumentIdFromAreaYearId } from "@/lib/commentsHelpers";
import BudgetHeader from "@/components/faculty-data/BudgetHeader";
import { useArmadoDocuments } from "@/hooks/useArmadoDocuments";
import { useAuth } from "@/components/AuthContext";

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
  const params = useParams() as { area_year_id?: string };
  const areaYearId = params.area_year_id as string;
  const { user } = useAuth();
  
  const [budget] = useState<BudgetDetail>(mockBudgetDetail);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<BudgetDetail['status']>(budget.status);
  const { status, area, year } = useAreaYearStatus(areaYearId);
  const headerStatus = (status as any) ?? budget.status;
  
  // Map area names to their abbreviations for display
  const getAreaDisplayName = (areaName: string) => {
    const areaMap: Record<string, string> = {
      'Ingeniería': 'FI',
      'Facultad de Ingeniería': 'FI',
      'Laboratorio': 'FI',
      'Biomédica': 'FI',
      // Add more mappings as needed
    };
    return areaMap[areaName] || areaName;
  };

  const headerName = `Presupuesto ${getAreaDisplayName(area || budget.area)} ${year || new Date().getFullYear()}`;
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'tracking' | 'comments'>('budget');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDocumentSnapshot, setShowDocumentSnapshot] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<BudgetVariation | null>(null);
  const [commentContext, setCommentContext] = useState<{
    monthlyDocument?: {
      documentId: number;
      month: string;
      version: string;
      createdAt: string;
    };
  }>({});
  const { latest, history } = useArmadoDocuments(areaYearId);

  const handleStatusChange = () => {
    // Aquí implementarías la lógica para cambiar el estado
    console.log(`Cambiando estado a: ${newStatus}`);
    setIsEditingStatus(false);
    // Actualizar el estado del presupuesto
  };

  const handleViewSnapshot = (variation: BudgetVariation) => {
    setSelectedVariation(variation);
    setShowDocumentSnapshot(true);
  };

  // Handler para navegar a comentarios con contexto de documento mensual
  const handleNavigateToComments = (documentId: number, month: string, version: string, createdAt: string) => {
    setCommentContext({
      monthlyDocument: {
        documentId,
        month,
        version,
        createdAt
      }
    });
    setActiveTab('comments');
  };

  // Handler para limpiar el contexto
  const handleClearCommentContext = () => {
    setCommentContext({});
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

  

  const tabs = [
    // { id: 'overview', label: 'Resumen' },
    { id: 'budget', label: 'Presupuesto' },
    { id: 'tracking', label: 'Seguimientos' },
    { id: 'comments', label: 'Comentarios' },
  ] as const;

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

      <BudgetHeader
        name={headerName}
        description={budget.description}
        faculty={budget.faculty}
        area={budget.area}
        status={String(headerStatus)}
        lastModifiedISO={budget.lastModified}
        getStatusText={(s) => areaYearStatusLabel(s as any)}
        getStatusColor={(s) => areaYearStatusColor(s as any)}
      />

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <TabManager tabs={tabs as any} activeTab={activeTab as any} onChange={setActiveTab as any} />

        <div className="p-6">
          {activeTab === 'overview' && (
            <OverviewTab budget={budget as any} formatCurrency={formatCurrency} />
          )}

          {activeTab === 'budget' && (
            <BudgetTab 
              latest={latest}
              history={history}
              onOpenUpload={() => setShowUploadModal(true)}
              areaYearId={areaYearId}
            />
          )}

          {activeTab === 'tracking' && (
            <TrackingTab 
              areaYearId={areaYearId} 
              onNavigateToComments={handleNavigateToComments}
            />
          )}

          {activeTab === 'comments' && user && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Comentarios y Comunicación</h3>
              </div>

              <IntegratedComments
                documentId={commentContext.monthlyDocument?.documentId || getDocumentIdFromAreaYearId(areaYearId)}
                documentStatus={mapAreaYearStatusToDocumentStatus(status || 'NOT_STARTED')}
                currentUserId={parseInt(user.id)}
                currentUserName={user.name}
                canEdit={true}
                canDelete={true}
                monthlyDocumentContext={commentContext.monthlyDocument}
                onCommentSubmitted={() => {
                  console.log('Comment submitted');
                }}
                onClearContext={handleClearCommentContext}
              />
            </div>
          )}
        </div>

        <DocumentSnapshotModal 
          open={showDocumentSnapshot}
          variation={selectedVariation}
          budget={{
            faculty: budget.faculty,
            area: budget.area,
            totalAmount: budget.totalAmount,
            status: budget.status,
            items: budget.items,
          }}
          onClose={() => setShowDocumentSnapshot(false)}
          formatCurrency={formatCurrency}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
        />

        <UploadBudgetModal 
          open={showUploadModal} 
          onClose={() => setShowUploadModal(false)} 
          areaYearId={areaYearId}
          onUploaded={() => {
            // refresh documents after upload
            // The hook useArmadoDocuments depends on areaYearId; re-setting state can force refresh if needed
            // Simpler approach: reload the page data
            window.location.reload();
          }}
        />
      </div>
    </div>
  );
}
