"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { UserDto } from "@/api/userService";

interface RowActionsProps {
  user: UserDto;
  onEdit: (user: UserDto) => void;
  onDelete: (user: UserDto) => void;
}

const RowActions: React.FC<RowActionsProps> = ({ user, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const MENU_WIDTH_PX = 160; // matches w-40
  const MENU_MARGIN_PX = 4;

  const computePosition = () => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuHeight = menuRef.current?.offsetHeight ?? 0;

    let left = rect.right - MENU_WIDTH_PX;
    left = Math.max(8, Math.min(left, viewportWidth - MENU_WIDTH_PX - 8));

    let top = rect.bottom + MENU_MARGIN_PX;
    if (menuHeight && top + menuHeight > viewportHeight) {
      top = Math.max(8, rect.top - menuHeight - MENU_MARGIN_PX);
    }
    setMenuPosition({ top, left });
  };

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      const clickedInsideMenu = menuRef.current?.contains(target);
      const clickedButton = buttonRef.current?.contains(target);
      if (!clickedInsideMenu && !clickedButton) {
        setOpen(false);
      }
    }
    function onScrollOrResize() {
      if (open) computePosition();
    }
    if (open) {
      document.addEventListener("mousedown", onDocClick);
      window.addEventListener("scroll", onScrollOrResize, true);
      window.addEventListener("resize", onScrollOrResize);
    }
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (open) {
      // allow next paint so menuRef has dimensions
      requestAnimationFrame(computePosition);
    }
  }, [open]);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center rounded-md border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Acciones para ${user.nombre} ${user.apellido}`}
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", top: menuPosition.top, left: menuPosition.left, width: MENU_WIDTH_PX }}
          className="z-50 mt-1 origin-top-right rounded-md border border-gray-200 bg-white shadow-lg"
        >
          <div className="py-1">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
              onClick={() => {
                setOpen(false);
                onEdit(user);
              }}
            >
              <Pencil className="w-4 h-4 text-gray-600" />
              Editar usuario
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
              onClick={() => {
                setOpen(false);
                onDelete(user);
              }}
            >
              <Trash2 className="w-4 h-4" />
              Eliminar usuario
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default RowActions;


