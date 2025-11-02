"use client";
import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { FacultyInChargeDto } from "@/api/userService";
import { createFacultyOrArea, CreateFacultyAreaPayload } from "@/lib/user-api";

interface AddFacultyAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableFaculties: FacultyInChargeDto[];
}

type FormType = "faculty" | "area" | null;

interface FacultyFormData {
  name: string;
  code: string;
}

interface AreaFormData {
  name: string;
  code: string;
  parent_area_id: number | "";
}

export default function AddFacultyAreaModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  availableFaculties 
}: AddFacultyAreaModalProps) {
  const [formType, setFormType] = useState<FormType>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Faculty form state
  const [facultyForm, setFacultyForm] = useState<FacultyFormData>({
    name: "",
    code: ""
  });
  
  // Area form state
  const [areaForm, setAreaForm] = useState<AreaFormData>({
    name: "",
    code: "",
    parent_area_id: ""
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormType(null);
      setError(null);
      setFacultyForm({ name: "", code: "" });
      setAreaForm({ name: "", code: "", parent_area_id: "" });
    }
  }, [isOpen]);

  const handleSubmitFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyForm.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const payload: CreateFacultyAreaPayload = {
        name: facultyForm.name.trim(),
        type: "FACULTAD"
      };
      
      // Add code only if provided
      if (facultyForm.code.trim()) {
        payload.code = facultyForm.code.trim();
      }
      
      const result = await createFacultyOrArea(payload);
      console.log("Faculty created successfully:", result);
      
      toast.success("Facultad creada exitosamente");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error creating faculty:", err);
      const errorMessage = err?.message || "Error creando facultad";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaForm.name.trim() || !areaForm.parent_area_id) {
      setError("El nombre y la facultad son obligatorios");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const payload: CreateFacultyAreaPayload = {
        name: areaForm.name.trim(),
        type: "SUBAREA",
        parent_area_id: Number(areaForm.parent_area_id)
      };
      
      // Add code only if provided
      if (areaForm.code.trim()) {
        payload.code = areaForm.code.trim();
      }
      
      const result = await createFacultyOrArea(payload);
      console.log("Area created successfully:", result);
      
      toast.success("Área creada exitosamente");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error creating area:", err);
      const errorMessage = err?.message || "Error creando área";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {formType === null && "Agregar Facultad o Área"}
            {formType === "faculty" && "Crear Nueva Facultad"}
            {formType === "area" && "Crear Nueva Área"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Type selection */}
          {formType === null && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Selecciona qué tipo de elemento deseas crear:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormType("faculty")}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="font-medium text-gray-900">Facultad</div>
                  <div className="text-sm text-gray-500">Crear una nueva facultad</div>
                </button>
                <button
                  onClick={() => setFormType("area")}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="font-medium text-gray-900">Área</div>
                  <div className="text-sm text-gray-500">Crear un área dentro de una facultad</div>
                </button>
              </div>
            </div>
          )}

          {/* Faculty form */}
          {formType === "faculty" && (
            <form onSubmit={handleSubmitFaculty} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Facultad
                </label>
                <input
                  type="text"
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="ej: Facultad de Ingeniería"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código (opcional)
                </label>
                <input
                  type="text"
                  value={facultyForm.code}
                  onChange={(e) => setFacultyForm(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="ej: FI"
                  disabled={loading}
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setFormType(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={loading}
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Creando..." : "Crear Facultad"}
                </button>
              </div>
            </form>
          )}

          {/* Area form */}
          {formType === "area" && (
            <form onSubmit={handleSubmitArea} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Área
                </label>
                <input
                  type="text"
                  value={areaForm.name}
                  onChange={(e) => setAreaForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="ej: Área de Sistemas"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código (opcional)
                </label>
                <input
                  type="text"
                  value={areaForm.code}
                  onChange={(e) => setAreaForm(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="ej: AS"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facultad
                </label>
                <select
                  value={areaForm.parent_area_id}
                  onChange={(e) => setAreaForm(prev => ({ ...prev, parent_area_id: e.target.value ? Number(e.target.value) : "" }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  disabled={loading}
                >
                  <option value="">Selecciona una facultad</option>
                  {availableFaculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setFormType(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={loading}
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Creando..." : "Crear Área"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
