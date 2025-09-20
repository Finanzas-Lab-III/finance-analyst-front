import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import BackofficeHeader from "@/components/backoffice/BackofficeHeader";
import ProtectedRoute from "@/components/ProtectedRoute";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function BackofficeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute requiredRole="ADMINISTRADOR">
      <div className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}>
        <BackofficeHeader />
        <main className="p-6">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
