"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Table, { TableColumn } from "@/components/Table";
import Input from "@/components/Input";
import { createUser, deleteUser, fetchUsers, UserDto, fetchFacultades, FacultadDto, createDirector, DirectorScope, fetchUserDetail, updateUser } from "@/api/userService";
import { toast } from "react-toastify";
import { Search, Filter, X, MoreVertical, Pencil, Trash2 } from "lucide-react";

export default function UsersPage() {
  type FilterKey = "nombre_apellido" | "facultad" | "mail";
  const filterLabels: Record<FilterKey, string> = {
    nombre_apellido: "Nombre o Apellido",
    facultad: "Facultad",
    mail: "Mail",
  };

  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>("nombre_apellido");
  const [filters, setFilters] = useState<Array<{ key: FilterKey; value: string }>>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserDto[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const handleEditUser = (user: UserDto) => {
    setEditingUserId(String(user.id));
    setIsEditOpen(true);
  };

  const handleDeleteUser = async (user: UserDto) => {
    const confirmed = window.confirm(`¿Eliminar al usuario ${user.nombre} ${user.apellido}?`);
    if (!confirmed) return;
    try {
      setLoading(true);
      setError(null);
      await deleteUser(user.id);
      toast.success("Usuario eliminado correctamente");
      await load();
    } catch (e: any) {
      const msg = e?.message || "No se pudo eliminar el usuario";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const RowActions: React.FC<{ user: UserDto }> = ({ user }) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      function onDocClick(e: MouseEvent) {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      }
      if (open) document.addEventListener("mousedown", onDocClick);
      return () => document.removeEventListener("mousedown", onDocClick);
    }, [open]);

    return (
      <div className="relative inline-block text-left" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`Acciones para ${user.nombre} ${user.apellido}`}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        {open && (
          <div className="absolute right-0 z-20 mt-1 w-40 origin-top-right rounded-md border border-gray-200 bg-white shadow-lg">
            <div className="py-1">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
                onClick={() => {
                  setOpen(false);
                  handleEditUser(user);
                }}
              >
                <Pencil className="w-4 h-4 text-gray-600" />
                Editar usuario
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                onClick={() => {
                  setOpen(false);
                  handleDeleteUser(user);
                }}
              >
                <Trash2 className="w-4 h-4" />
                Eliminar usuario
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const columns: TableColumn<UserDto>[] = useMemo(
    () => [
      { key: "nombre", header: "Nombre" },
      { key: "apellido", header: "Apellido" },
      { key: "facultad", header: "Facultad" },
      { key: "mail", header: "Mail" },
      {
        key: "actions",
        header: "Acciones",
        className: "text-right w-0",
        render: (u) => (
          <div className="flex justify-end">
            <RowActions user={u} />
          </div>
        ),
      },
    ],
    []
  );

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: { nombre_apellido?: string; facultad?: string; mail?: string } = {} as any;
      if (filters.length > 0) {
        for (const f of filters) {
          (params as any)[f.key] = f.value;
        }
      }
      const data = await fetchUsers(params);
      setUsers(data);
    } catch (e: any) {
      setError(e?.message || "Error cargando usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cargar datos cada vez que cambian los filtros (incluye primer render)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    load();
  }, [filters]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const addFilterFromInput = () => {
    const value = searchText.trim();
    if (!value) return;
    setFilters((prev) => {
      const withoutSelected = prev.filter((f) => f.key !== selectedFilter);
      return [...withoutSelected, { key: selectedFilter, value }];
    });
    setSearchText("");
  };

  const removeFilter = (key: FilterKey) => {
    setFilters((prev) => prev.filter((f) => f.key !== key));
  };

  const AUSTRAL_DOMAIN = "austral.edu.ar";
  const isAustralEmail = (email: string) => email.toLowerCase().endsWith(`@${AUSTRAL_DOMAIN}`);

  const CreateUserModal: React.FC<{ onClose: () => void; onCreated: () => void }> = ({ onClose, onCreated }) => {
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

  const EditUserModal: React.FC<{ id: string; onClose: () => void; onUpdated: () => void }> = ({ id, onClose, onUpdated }) => {
    const [rolDirector, setRolDirector] = useState(false);
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
      Promise.all([fetchFacultades(), fetchUserDetail(id)])
        .then(([facus, detail]) => {
          if (cancelled) return;
          setFacultadesDisponibles(facus);
          setNombre(detail.nombre || "");
          setApellido(detail.apellido || "");
          setEmail(detail.email || "");
          const isDirector = detail.rol === "DIRECTOR";
          setRolDirector(isDirector);
          setRolAdmin(!isDirector);
          const fid = Array.isArray(detail.facultad_ids) && detail.facultad_ids.length > 0 ? detail.facultad_ids[0] : null;
          setFacultadId(fid);
          setEsDecano((detail.scope as DirectorScope) === "SELF_AND_DESCENDANTS");
          setSubareaIds(Array.isArray(detail.subarea_ids) ? detail.subarea_ids : []);
        })
        .catch((e) => {
          console.error(e);
          if (!cancelled) setFormError(e?.message || "Error cargando datos del usuario");
        });
      return () => {
        cancelled = true;
      };
    }, [id]);

    const currentSubareas = useMemo(() => {
      const f = facultadesDisponibles.find(x => x.id === facultadId);
      return f ? (f.subareas || []) : [];
    }, [facultadesDisponibles, facultadId]);

    const canSubmit = () => {
      if (!rolDirector && !rolAdmin) return false;
      if (!nombre.trim() || !apellido.trim() || !email.trim()) return false;
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
      try {
        setSubmitting(true);
        if (rolDirector) {
          const scope: DirectorScope = esDecano ? "SELF_AND_DESCENDANTS" : "SELF_ONLY";
          await updateUser({
            id,
            rol: "DIRECTOR",
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            email: email.trim(),
            facultad_ids: facultadId ? [facultadId] : [],
            subarea_ids: subareaIds,
            scope,
          });
        } else {
          await updateUser({ id, rol: "ADMINISTRADOR", nombre: nombre.trim(), apellido: apellido.trim(), email: email.trim() });
        }
        toast.success("Usuario actualizado exitosamente");
        onUpdated();
        onClose();
      } catch (err: any) {
        const msg = err?.message || "Error actualizando usuario";
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
            <h2 className="text-base font-semibold text-gray-900">Editar usuario</h2>
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
              <input type="email" className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500" value={email} disabled readOnly />
              <p className="mt-1 text-[11px] text-gray-600">El email no puede modificarse.</p>
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
                            }}
                            disabled={submitting}
                          >
                            {f.nombre}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="mt-1 text:[11px] text-gray-600">Seleccione una facultad.</p>
                </div>

                {facultadId && (
                  <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                    <input
                      type="checkbox"
                      checked={esDecano}
                      onChange={(e) => setEsDecano(e.target.checked)}
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
                    <p className="mt-1 text-[11px] text-gray-600">Seleccione una o varias sub-áreas de la facultad (opcional si es decano).</p>
                  </div>
                )}
              </div>
            )}

            {formError && (
              <div className="rounded-md bg-red-50 p-2 text-sm text-red-700 border border-red-200">{formError}</div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button type="button" onClick={onClose} disabled={submitting} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={submitting || !canSubmit()} className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                {submitting ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Usuarios</h1>
          <p className="mt-1 text-sm text-gray-600">Administra usuarios, roles y permisos.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          onClick={() => setIsCreateOpen(true)}
        >
          Crear usuario
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 flex-wrap" ref={dropdownRef}>
          <div className="relative flex-1 min-w-[240px]">
            <Input
              placeholder={`Buscar por ${filterLabels[selectedFilter]}...`}
              value={searchText}
              onChange={(e) => setSearchText((e.target as HTMLInputElement).value)}
              className="pr-9"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((v) => !v)}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2 text-gray-600" /> Filtros
            </button>
            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-56 rounded-md border border-gray-200 bg-white shadow-lg">
                <div className="py-1">
                  {(Object.keys(filterLabels) as FilterKey[]).map((key) => (
                    <button
                      key={key}
                      className={`w-full text-left px-3 py-2 text-sm ${
                        selectedFilter === key ? "bg-gray-100 text-gray-900" : "text-gray-800 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setSelectedFilter(key);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {filterLabels[key]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={addFilterFromInput}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>

          {/* Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 border border-gray-300 px-2.5 py-1 text-xs text-gray-800"
                title={`${filterLabels[f.key]}: ${f.value}`}
              >
                <span className="font-medium text-gray-900">{filterLabels[f.key]}:</span>
                <span className="text-gray-800">{f.value}</span>
                <button
                  onClick={() => removeFilter(f.key)}
                  className="ml-1 rounded-full p-0.5 hover:bg-gray-200 text-gray-600"
                  aria-label={`Quitar filtro ${filterLabels[f.key]}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        {error && (
          <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}
        <Table<UserDto>
          columns={columns}
          data={users}
          emptyMessage={loading ? "Cargando..." : "No se encontraron usuarios"}
          rowKey={(u) => String(u.id)}
        />
      </div>
      {isCreateOpen && (
        <CreateUserModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={load}
        />
      )}
      {isEditOpen && editingUserId && (
        <EditUserModal
          id={editingUserId}
          onClose={() => { setIsEditOpen(false); setEditingUserId(null); }}
          onUpdated={load}
        />
      )}
    </div>
  );
}
