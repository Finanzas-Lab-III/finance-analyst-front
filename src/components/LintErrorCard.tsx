import React, { useRef, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

interface LintErrorCardProps {
  id: number;
  message: string;
  line: number;
  columns: number[];
  rule: string;
  checked: boolean;
  onCheck: (id: number) => void;
}

const LintErrorCard: React.FC<LintErrorCardProps> = ({ id, message, line, columns, checked, onCheck }) => {
  const [minimized, setMinimized] = useState(checked);
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (checked) {
      setTimeout(() => setMinimized(true), 200);
    } else {
      setMinimized(false);
    }
  }, [checked]);

  return (
    <div
      className={`relative rounded-lg shadow mb-4 flex flex-col transition-colors duration-200 group ${
        checked ? "bg-green-50" : "bg-white"
      } ${checked ? "shadow-green-200" : ""}`}
      style={{ minHeight: 56, paddingLeft: '0.75rem' }}
    >
      {/* Línea vertical absolutamente posicionada */}
      <div
        className={`absolute left-0 top-0 h-full z-10 rounded-l-lg transition-colors duration-200 ${checked ? "bg-green-500" : "bg-red-500"}`}
        style={{ width: 8 }}
      />
      {/* Contenido principal */}
      <div className="flex-1 flex items-center px-4 py-3 w-full">
        <div className="flex-1">
          <div className={`font-semibold mb-1 transition-colors duration-200 ${checked ? "text-green-700 line-through" : "text-gray-800"}`}>{message}</div>
          <div
            ref={contentRef}
            className={`transition-all duration-300 ease-in-out overflow-hidden ${checked ? "max-h-0 opacity-0" : "max-h-20 opacity-100"}`}
            style={{ minHeight: 0 }}
          >
            {!minimized && (
              <div className="text-sm text-gray-500 mb-1">
                <span>Línea: {line}</span>
                {columns.length > 0 && (
                  <span> | Columnas: {columns.join(", ")}</span>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Checkbox a la derecha, más grande */}
        <input
          type="checkbox"
          className="ml-4 accent-blue-600 cursor-pointer"
          style={{ width: 28, height: 28 }}
          checked={checked}
          onChange={() => onCheck(id)}
        />
      </div>
      {/* Descripción expandible y chevron siempre abajo */}
      {!checked && (
        <div className="flex flex-col items-center w-full">
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${expanded ? "max-h-32 opacity-100" : "max-h-0 opacity-0"}`}
            style={{ minHeight: 0, width: '100%' }}
          >
            <div className="text-xs text-gray-600 py-2 px-4 text-center">
              Esta es una descripción adicional del error. Aquí puedes poner detalles, sugerencias o links de ayuda.
            </div>
          </div>
          <button
            className={`flex items-center justify-center rounded hover:bg-gray-100 transition-colors duration-150 mt-1 mb-1 ${expanded ? "rotate-180" : ""}`}
            style={{ width: 28, height: 24 }}
            onClick={() => setExpanded((prev) => !prev)}
            tabIndex={0}
            aria-label={expanded ? "Cerrar descripción" : "Ver descripción"}
            type="button"
          >
            <ChevronDown size={16} className="text-gray-500" />
          </button>
        </div>
      )}
    </div>
  );
};

export default LintErrorCard; 