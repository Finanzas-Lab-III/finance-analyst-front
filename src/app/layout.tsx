import React from "react";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import MsalProviderWrapper from "@/components/MsalProviderWrapper";
import ToastProvider from "@/components/ToastProvider";
import { FileProvider } from "@/components/FileContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased bg-gray-900`}
      >
        <MsalProviderWrapper>
          <AuthProvider>
            <FileProvider>
              {children}
              <ToastProvider />
            </FileProvider>
          </AuthProvider>
        </MsalProviderWrapper>
      </body>
    </html>
  );
}
