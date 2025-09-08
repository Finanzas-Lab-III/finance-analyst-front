import React, { Suspense } from "react";
import { FileProvider } from "@/components/FileContext";

export default function ArmadoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FileProvider>
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </FileProvider>
  );
} 