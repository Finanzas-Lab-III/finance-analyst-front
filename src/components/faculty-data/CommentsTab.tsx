"use client"
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { User, Send, FileText } from "lucide-react";
import { BudgetComment } from "./types";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/lib/msal";
import { useAuth } from "@/components/AuthContext";
import { statusColor, statusLabelEs, type AreaYearStatus } from "@/lib/areaYearStatus";

interface CommentsTabProps {
  comments?: BudgetComment[]; // optional legacy prop; fetching is handled internally
  areaYearId: number;
  newComment: string;
  setNewComment: (s: string) => void;
  onSubmit?: () => void; // kept for backward compatibility
}

type ApiComment = {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  documentId: number;
  documentStatus: string;
  areaYearId: number;
  userName: string;
  documentTitle: string;
};

export default function CommentsTab({ areaYearId, newComment, setNewComment, onSubmit }: CommentsTabProps) {
  const { instance, accounts } = useMsal();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<ApiComment[]>([]);

  const apiBase = useMemo(() => (process.env.NEXT_PUBLIC_SERVICE_URL || "").replace(/\/+$/, ""), []);
  const currentUserId = useMemo(() => {
    const idNum = Number(user?.id);
    return Number.isFinite(idNum) ? idNum : null;
  }, [user]);

  const acquireBearerToken = useCallback(async (): Promise<string | null> => {
    if (!accounts || accounts.length === 0) return null;
    const account = accounts[0];
    try {
      const result = await instance.acquireTokenSilent({ ...loginRequest, account });
      return result.accessToken || null;
    } catch {
      return null;
    }
  }, [accounts, instance]);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await acquireBearerToken();
      const headers: Record<string, string> = {
        "ngrok-skip-browser-warning": "true",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${apiBase}/api/coments/?areaYearId=${encodeURIComponent(String(areaYearId))}`, {
        method: "GET",
        headers,
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Error ${res.status}`);
      }
      const data = await res.json();
      const list: ApiComment[] = Array.isArray(data) ? data : (data?.results || []);
      setComments(list);
    } catch (e: any) {
      setError(e?.message || "No se pudieron cargar los comentarios");
    } finally {
      setLoading(false);
    }
  }, [acquireBearerToken, apiBase, areaYearId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = useCallback(async () => {
    const content = newComment.trim();
    if (!content) return;

    setSubmitting(true);
    setError(null);
    try {
      const token = await acquireBearerToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBase}/api/coments/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          areaYearId,
          comentario: content,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Error ${res.status}`);
      }

      setNewComment("");
      onSubmit?.();
      // refresh list
      fetchComments();
    } catch (e: any) {
      setError(e?.message || "No se pudo enviar el comentario");
      console.error("Error posting comment:", e);
    } finally {
      setSubmitting(false);
    }
  }, [acquireBearerToken, apiBase, areaYearId, newComment, onSubmit, setNewComment, fetchComments]);

  const normalizeToAreaYearStatus = (raw: string): AreaYearStatus | null => {
    const s = (raw || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .toUpperCase();
    const allowed: AreaYearStatus[] = [
      "SIN_EMPEZAR",
      "NECESITA_CAMBIOS_IA",
      "REVISION_FINANZAS",
      "NECESITA_CAMBIOS_FINANZAS",
      "APROBADO",
    ];
    return (allowed as string[]).includes(s) ? (s as AreaYearStatus) : null;
  };

  const statusChipClasses = (raw: string) => {
    const st = normalizeToAreaYearStatus(raw);
    return st ? statusColor(st) : "bg-gray-100 text-gray-800";
  };

  const statusDotClasses = (raw: string) => {
    const st = normalizeToAreaYearStatus(raw);
    switch (st) {
      case "APROBADO":
        return "bg-green-500";
      case "NECESITA_CAMBIOS_IA":
      case "NECESITA_CAMBIOS_FINANZAS":
        return "bg-yellow-500";
      case "REVISION_FINANZAS":
        return "bg-purple-500";
      case "SIN_EMPEZAR":
      default:
        return "bg-gray-400";
    }
  };

  const statusLabel = (raw: string) => {
    const st = normalizeToAreaYearStatus(raw);
    return st ? statusLabelEs(st) : (raw || "Desconocido");
  };

  const renderContent = (text: string) => {
    const lines = (text || "").split("\n");
    if (lines.length === 0) {
      return null;
    }
    const title = lines[0]?.trim() || "";
    const rest = lines.slice(1);
    const bulletRegex = /^\s*([-*•])\s+/;
    const bulletItems = rest
      .filter(l => bulletRegex.test(l))
      .map(l => l.replace(bulletRegex, "").trim());
    const others = rest.filter(l => !bulletRegex.test(l));
    return (
      <div className="mb-2">
        {title && <div className="text-gray-900 font-medium mb-1">{title}</div>}
        {bulletItems.length > 0 && (
          <ul className="list-disc pl-6 text-gray-800 space-y-1">
            {bulletItems.map((bi, i) => (
              <li key={i}>{bi}</li>
            ))}
          </ul>
        )}
        {others.length > 0 && (
          <div className="text-gray-800 whitespace-pre-wrap mt-1">
            {others.join("\n")}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Comentarios</h3>
      {/* Comments list above input, max height with scroll */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {loading && (
          <div className="text-sm text-gray-500">Cargando comentarios…</div>
        )}
        {!loading && comments.length === 0 && (
          <div className="text-sm text-gray-500">No hay comentarios aún.</div>
        )}
        {!loading && comments.map((c) => {
          const mine = currentUserId != null && c.userId === currentUserId;
          return (
            <div key={c.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-lg p-3 ${mine ? "border-blue-200" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600"/>
                    </div>
                    <span className="font-semibold text-gray-900">{c.userName || "Usuario"}</span>
                  </div>
                  <span className={`inline-flex items-center gap-2 px-2 py-1 text-xs rounded-full ${statusChipClasses(c.documentStatus)}`}>
                    <span className={`w-2 h-2 rounded-full ${statusDotClasses(c.documentStatus)}`}></span>
                    {statusLabel(c.documentStatus)}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {new Date(c.createdAt).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {renderContent(c.content)}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                    <FileText className="w-3 h-3" />
                    {c.documentTitle || `Doc ${c.documentId}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input below the list */}
      <div className="space-y-3">
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !submitting && newComment.trim()) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Escribe tu comentario… Shift+Enter para salto de línea, Enter para enviar"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim() || submitting}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4"/>
            <span>{submitting ? "Enviando..." : "Enviar"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

