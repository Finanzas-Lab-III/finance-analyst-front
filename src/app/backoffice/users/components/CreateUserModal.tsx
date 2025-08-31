"use client";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { createDirector, createUser, DirectorScope, FacultadDto, fetchFacultades } from "@/api/userService";

const AUSTRAL_DOMAIN = "austral.edu.ar";
const isAustralEmail = (email: string) => email.toLowerCase().endsWith(`@${AUSTRAL_DOMAIN}`);

interface CreateUserModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ onClose, onCreated }) => {
  const [rolDirector, setRolDirector] = useState(true);
  const [rolAdmin, setRolAdmin] = useState(false);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [facultadesDisponibles, setFacultadesDisponibles] = useState<FacultadDto[]>([]);
  const [facultadId, setFacultadId] = useState<number | null>(null);
  const [esDecano, setEsDecano] = useState(false);
  const [subareaIds, setSubareaIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchFacultades()
      .then((data) => {
        if (!cancelled) setFacultadesDisponibles(data);
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setFacultadesDisponibles([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const currentSubareas = useMemo(() => {
    const f = facultadesDisponibles.find(x => x.id === facultadId);
    return f ? (f.subareas || []) : [];
  }, [facultadesDisponibles, facultadId]);

  const canSubmit = () => {
    if (!rolDirector && !rolAdmin) return false;
    if (!nombre.trim() || !apellido.trim() || !email.trim()) return false;
    if (!isAustralEmail(email)) return false;
    if (rolDirector) {
      if (!facultadId) return false;
      if (!esDecano && subareaIds.length === 0) return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!rolDirector && !rolAdmin) {
      setFormError("Debe seleccionar al menos un rol");
      return;
    }
    if (!nombre.trim() || !apellido.trim() || !email.trim()) {
      setFormError("Faltan completar campos requeridos");
      return;
    }
    if (!isAustralEmail(email)) {
      setFormError("El mail no pertenece a la universidad");
      toast.error("El mail no pertenece a la universidad");
      return;
    }
    if (rolDirector) {
      if (!facultadId) {
        setFormError("Debe seleccionar una facultad");
        return;
      }
      if (!esDecano && subareaIds.length === 0) {
        setFormError("Debe seleccionar al menos una sub-área");
        return;
      }
    }
    try {
      setSubmitting(true);
      if (rolDirector) {
        const scope: DirectorScope = esDecano ? "SELF_AND_DESCENDANTS" : "SELF_ONLY";
        await createDirector({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.trim(),
          facultad_ids: facultadId ? [facultadId] : [],
          subarea_ids: subareaIds,
          scope,
        });
      } else {
        await createUser({ rol: "ADMINISTRADOR", nombre: nombre.trim(), apellido: apellido.trim(), email: email.trim() });
      }
      toast.success("Usuario creado exitosamente");
      onCreated();
      onClose();
    } catch (err: any) {
      const msg = err?.message || (isAustralEmail(email) ? "Error creando usuario" : "El mail no pertenece a la universidad");
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-base font-semibold text-gray-900">Crear usuario</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Rol</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                <input
                  type="radio"
                  name="rol"
                  value="DIRECTOR"
                  checked={rolDirector}
                  onChange={() => {
                    setRolDirector(true);
                    setRolAdmin(false);
                  }}
                  disabled={submitting}
                />
                Director
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                <input
                  type="radio"
                  name="rol"
                  value="ADMINISTRADOR"
                  checked={rolAdmin}
                  onChange={() => {
                    setRolAdmin(true);
                    setRolDirector(false);
                  }}
                  disabled={submitting}
                />
                Administrador
              </label>
            </div>
            <p className="mt-1 text-[11px] text-gray-600">Seleccione un único rol. Si es Director, se requerirán los campos adicionales.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Nombre</label>
              <input className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900" value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={submitting} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Apellido</label>
              <input className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900" value={apellido} onChange={(e) => setApellido(e.target.value)} disabled={submitting} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Email</label>
            <input type="email" className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900" value={email} onChange={(e) => setEmail(e.target.value)} disabled={submitting} />
            <p className="mt-1 text-[11px] text-gray-600">Debe pertenecer al dominio {AUSTRAL_DOMAIN}.</p>
          </div>

          {rolDirector && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Facultad</label>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full text-left rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 text-gray-900"
                    disabled={submitting}
                    onClick={(e) => {
                      const menu = (e.currentTarget.nextSibling as HTMLDivElement);
                      if (menu) menu.classList.toggle("hidden");
                    }}
                  >
                    {facultadId ? (facultadesDisponibles.find(f => f.id === facultadId)?.nombre ?? "Seleccionar") : "Seleccionar"}
                  </button>
                  <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg hidden">
                    <div className="max-h-48 overflow-auto py-1">
                      {facultadesDisponibles.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
                          onClick={() => {
                            setFacultadId(f.id);
                            setSubareaIds([]);
                            setEsDecano(false);
                          }}
                          disabled={submitting}
                        >
                          {f.nombre}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-gray-600">Seleccione una facultad.</p>
              </div>

              {facultadId && (
                <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    checked={esDecano}
                    onChange={(e) => {
                      setEsDecano(e.target.checked);
                    }}
                    disabled={submitting}
                  />
                  Es decano de esta facultad
                </label>
              )}

              {facultadId && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Sub-áreas</label>
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full text-left rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 text-gray-900"
                      disabled={submitting}
                      onClick={(e) => {
                        const menu = (e.currentTarget.nextSibling as HTMLDivElement);
                        if (menu) menu.classList.toggle("hidden");
                      }}
                    >
                      {subareaIds.length > 0
                        ? currentSubareas.filter(s => subareaIds.includes(s.id)).map(s => s.nombre).join(", ")
                        : "Seleccionar"}
                    </button>
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg hidden">
                      <div className="max-h-48 overflow-auto py-1">
                        {currentSubareas.map((s) => {
                          const checked = subareaIds.includes(s.id);
                          return (
                            <label key={s.id} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  setSubareaIds((prev) => e.target.checked
                                    ? Array.from(new Set([...prev, s.id]))
                                    : prev.filter((x) => x !== s.id)
                                  );
                                }}
                                disabled={submitting}
                              />
                              {s.nombre}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-600">Seleccione una o varias sub-áreas de la facultad{esDecano ? " (opcional si es decano)" : ""}.</p>
                </div>
              )}

              {/* scope visual intentionally removed as per requirements */}
            </div>
          )}

          {formError && (
            <div className="rounded-md bg-red-50 p-2 text-sm text-red-700 border border-red-200">{formError}</div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} disabled={submitting} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={submitting || !canSubmit()} className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {submitting ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;


