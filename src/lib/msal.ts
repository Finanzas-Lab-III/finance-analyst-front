"use client";

import { Configuration, LogLevel, PublicClientApplication } from "@azure/msal-browser";

// Expect these variables to be defined in .env (NEXT_PUBLIC_) for client usage
const clientId = process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID as string;
const envAuthority = process.env.NEXT_PUBLIC_AZURE_AD_AUTHORITY as string | undefined; // e.g. https://login.microsoftonline.com/<tenantId>
const tenantId = process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID as string | undefined; // alternative to authority
const redirectUri = process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI as string | undefined; // e.g. https://localhost:3000/login

if (!clientId) {
  // Fail fast in development to surface missing configuration
  // In production, MSAL will also fail without a clientId
  console.warn("Missing NEXT_PUBLIC_AZURE_AD_CLIENT_ID; Azure login will not work.");
}

export const msalConfig: Configuration = {
  auth: {
    clientId: clientId || "",
    authority: envAuthority || (tenantId ? `https://login.microsoftonline.com/${tenantId}` : "https://login.microsoftonline.com/common"),
    redirectUri: redirectUri || (typeof window !== "undefined" ? `${window.location.origin}/login` : undefined),
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            // console.debug(message);
            return;
        }
      },
      logLevel: LogLevel.Warning,
    },
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"],
};

export const msalInstance = new PublicClientApplication(msalConfig);


