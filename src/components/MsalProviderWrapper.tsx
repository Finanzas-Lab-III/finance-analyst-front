"use client";

import React, { useEffect } from "react";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "@/lib/msal";

export default function MsalProviderWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    msalInstance.handleRedirectPromise().catch(() => {});
  }, []);

  return (
    <MsalProvider instance={msalInstance}>
      {children}
    </MsalProvider>
  );
}


