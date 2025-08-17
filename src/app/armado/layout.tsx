import React from "react";
import { FileProvider } from "@/components/FileContext";

export default function ArmadoLayout({
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