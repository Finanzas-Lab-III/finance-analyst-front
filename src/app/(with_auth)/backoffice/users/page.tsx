"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Table, { TableColumn } from "@/components/Table";
import Input from "@/components/Input";
import { deleteUser, fetchUsers, UserDto } from "@/api/userService";
import { toast } from "react-toastify";
import { Search, Filter, X } from "lucide-react";
import RowActions from "@/app/backoffice/users/components/RowActions";
import CreateUserModal from "@/app/backoffice/users/components/CreateUserModal";
import EditUserModal from "@/app/backoffice/users/components/EditUserModal";

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

  // Row actions extracted to component

  const columns: TableColumn<UserDto>[] = useMemo(
    () => [
      { key: "nombre", header: "Nombre" },
      { key: "apellido", header: "Apellido" },
      { key: "facultad", header: "Facultad" },
      { key: "areas", header: "Áreas" },
      { key: "mail", header: "Mail" },
      {
        key: "actions",
        header: "Acciones",
        className: "text-right w-0",
        render: (u) => (
          <div className="flex justify-end">
            <RowActions user={u} onEdit={handleEditUser} onDelete={handleDeleteUser} />
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

  // inline CreateUserModal removed; using extracted component

  // inline EditUserModal removed; using extracted component

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
