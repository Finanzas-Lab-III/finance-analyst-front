"use client"
import React, { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { AreaYearStatus, fetchAreaYearStatus, updateAreaYearStatus } from "@/api/userService";

interface UploadBudgetModalProps {
  open: boolean;
  onClose: () => void;
  areaYearId: string | number;
  onUploaded?: () => void;
}

export default function UploadBudgetModal({ open, onClose, areaYearId, onUploaded }: UploadBudgetModalProps) {
  if (!open) return null;

  const USERS_API_BASE = process.env.NEXT_PUBLIC_USERS_API_URL || "http://localhost:8000";
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPickFile = () => inputRef.current?.click();
  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFile(f);
  };

  const resetAndClose = () => {
    setFile(null);
    setTitle("");
    setNotes("");
    setError(null);
    onClose();
  };

  const onSubmit = async () => {
    if (!file) {
      setError("Selecciona un archivo .xlsx");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", "ARMADO");
      form.append("area_year_id", String(areaYearId));
      if (title && title.trim().length > 0) form.append("title", title.trim());
      if (notes && notes.trim().length > 0) form.append("notes", notes.trim());

      const res = await fetch(`${USERS_API_BASE}/api/upload`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        let message = `Error subiendo archivo: ${res.status} ${res.statusText}`;
        try {
          const data = await res.json();
          if (data?.detail) message = String(data.detail);
        } catch {}
        throw new Error(message);
      }
      // After successful upload: if current status is NOT_STARTED, move to PENDING_APPROVAL
      try {
        const current = await fetchAreaYearStatus(areaYearId);
        if ((current.status as AreaYearStatus) === "NOT_STARTED") {
          await updateAreaYearStatus(areaYearId, "PENDING_APPROVAL");
        }
      } catch (e) {
        // Non-blocking: ignore status update error here, but log for debugging
        console.error("Error updating status after upload", e);
      }

      onUploaded?.();
      resetAndClose();
    } catch (e: any) {
      setError(e?.message ?? "Error subiendo archivo");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Subir Nueva Versión</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Ej: Seguimiento Enero"
              maxLength={120}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo de Presupuesto
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
              onClick={onPickFile}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {file ? `Seleccionado: ${file.name}` : "Arrastra un archivo aquí o haz clic para seleccionar"}
              </p>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={onFileChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción de cambios
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Describe los cambios realizados en esta versión..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          <div className="flex justify-end space-x-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Subir Archivo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


