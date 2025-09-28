"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InteractionStatus, RedirectRequest } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/lib/msal";

function LoginInner() {
  const router = useRouter();
  const { instance, inProgress, accounts } = useMsal();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const hashInfo = useMemo(() => {
    if (typeof window === "undefined") return { hasError: false, error: null as string | null };
    const hash = window.location.hash || "";
    const urlParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const err = urlParams.get("error");
    const errDesc = urlParams.get("error_description");
    return {
      hasError: Boolean(err),
      error: errDesc ? decodeURIComponent(errDesc) : err,
    };
  }, []);

  const doLogin = useMemo(() => {
    const state = params.get("state") || undefined;
    const loginReq: RedirectRequest = {
      ...loginRequest,
      state,
    };
    return () => instance.loginRedirect(loginReq).catch((e) => setError(e.message || "Login error"));
  }, [instance, params]);

  const doLogout = useMemo(() => {
    return () => instance.logoutRedirect({ onRedirectNavigate: () => true }).catch(() => {});
  }, [instance]);

  useEffect(() => {
    // If AAD returned an error in the hash, display it and avoid re-triggering login to prevent loops
    if (hashInfo.hasError) {
      if (hashInfo.error) setError(hashInfo.error);
      try {
        // Clean the hash so a refresh does not keep the error fragment
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      } catch {}
      return;
    }

    if (accounts.length > 0 && inProgress === InteractionStatus.None) {
      const account = accounts[0];
      // Acquire Azure access token and persist it server-side as HttpOnly cookie
      (async () => {
        try {
          const result = await instance.acquireTokenSilent({ ...loginRequest, account });
          const accessToken = result.accessToken;
          const expiresIn = result.expiresOn ? Math.max(1, Math.floor((result.expiresOn.getTime() - Date.now()) / 1000)) : 3600;
          await fetch("/api/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: accessToken, expires_in: expiresIn }),
            credentials: "include",
          });
        } catch (e: any) {
          // Best-effort: if we cannot acquire token, surface error and avoid looping
          setError(e?.message || "No se pudo obtener el token de Azure");
          return;
        }

        const next = params.get("state") || "/backoffice/archive";
        router.replace(next);
      })();
      return;
    }
    const wantsLogout = params.get("logout") === "1";
    if (wantsLogout && inProgress === InteractionStatus.None) {
      // Clear local app cookies before redirecting to AAD logout
      // Clear server session too
      fetch("/api/session", { method: "DELETE", credentials: "include" }).catch(() => {});
      doLogout();
      return;
    }
    if (inProgress === InteractionStatus.None && accounts.length === 0) {
      doLogin();
    }
  }, [accounts, inProgress, router, doLogin, doLogout, hashInfo.hasError, hashInfo.error, params]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Conectando con Microsoft...</h1>
        {inProgress === InteractionStatus.HandleRedirect && <p>Procesando respuesta de autenticación…</p>}
        {error && <p className="text-red-400">{error}</p>}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Cargando…</div>}>
      <LoginInner />
    </Suspense>
  );
}


