"use client";
import React, { useEffect, useState } from "react";
import Input from "@/components/Input";
import { fetchUserDetail, UserDetailDto } from "@/api/userService";

interface EditUserModalProps {
  open: boolean;
  userId: string | number | null;
  onClose: () => void;
}

export default function EditUserModal({ open, userId, onClose }: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<"ADMINISTRADOR" | "DIRECTOR" | "">("");
  const [facultadesTexto, setFacultadesTexto] = useState("");

  useEffect(() => {
    async function loadDetail() {
      if (!open || userId == null) return;
      try {
        setLoading(true);
        setError(null);
        const detail: UserDetailDto = await fetchUserDetail(userId);
        setNombre(detail.nombre || "");
        setApellido(detail.apellido || "");
        setEmail(detail.email || "");
        setRol(detail.rol || "");
        // Texto amigable de facultades si están presentes (por ahora informativo)
        if (Array.isArray(detail.facultad_ids) && detail.facultad_ids.length > 0) {
          setFacultadesTexto(detail.facultad_ids.join(", "));
        } else {
          setFacultadesTexto("—");
        }
      } catch (e: any) {
        setError(e?.message || "Error cargando usuario");
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [open, userId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Editar Usuario</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-5 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Nombre" value={nombre} onChange={(e) => setNombre((e.target as HTMLInputElement).value)} />
            <Input label="Apellido" value={apellido} onChange={(e) => setApellido((e.target as HTMLInputElement).value)} />
          </div>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail((e.target as HTMLInputElement).value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Rol</label>
              <select
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-0 focus:border-gray-400"
                value={rol}
                onChange={(e) => setRol(e.target.value as any)}
              >
                <option value="">—</option>
                <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                <option value="DIRECTOR">DIRECTOR</option>
              </select>
            </div>
            <Input label="Facultades (IDs)" value={facultadesTexto} readOnly />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
          <button onClick={onClose} className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">
            Cancelar
          </button>
          <button disabled={loading} className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}


