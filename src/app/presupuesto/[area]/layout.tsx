import React from "react";
import { FileProvider } from "@/components/FileContext";

export default function PresupuestoAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FileProvider>
      {children}
    </FileProvider>
  );
} 