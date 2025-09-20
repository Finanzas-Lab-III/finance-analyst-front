import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DirectorsHomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute requiredRole="DIRECTOR">
      {children}
    </ProtectedRoute>
  );
}
