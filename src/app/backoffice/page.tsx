"use client"
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function BackofficePage() {
  const router = useRouter();

  useEffect(() => {
    // Redireccionar automáticamente a presupuestos
    router.push('/backoffice/budgets');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Redirigiendo a presupuestos...</p>
      </div>
    </div>
  );
}
