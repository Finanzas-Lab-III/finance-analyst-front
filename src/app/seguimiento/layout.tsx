import React from "react";
import { FileProvider } from "@/components/FileContext";
import AppLayout from "@/components/AppLayout";

export default function SeguimientoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FileProvider>
      <AppLayout>{children}</AppLayout>
    </FileProvider>
  );
}
