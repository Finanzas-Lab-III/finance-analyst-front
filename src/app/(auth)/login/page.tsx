"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InteractionStatus, RedirectRequest } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/lib/msal";
import { getProfile } from "@/lib/user-api";

function LoginInner() {
  const router = useRouter();
  const { instance, inProgress, accounts } = useMsal();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const startedLoginRef = useRef(false);

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

    // If the URL contains an auth hash (e.g., after redirect), let MSAL handle it first
    if (typeof window !== "undefined" && window.location.hash) {
      return;
    }

    if (accounts.length > 0 && inProgress === InteractionStatus.None) {
      const account = accounts[0];
      // Acquire Azure access token and persist it server-side as HttpOnly cookie
      (async () => {
        try {
          // 1. Get Azure token and set session
          const result = await instance.acquireTokenSilent({ ...loginRequest, account });
          const accessToken = result.accessToken;
          const expiresIn = result.expiresOn ? Math.max(1, Math.floor((result.expiresOn.getTime() - Date.now()) / 1000)) : 3600;
          
          const sessionResponse = await fetch("/api/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: accessToken, expires_in: expiresIn }),
            credentials: "include",
          });

          if (!sessionResponse.ok) {
            setError("No se pudo establecer la sesión");
            return;
          }

          // 2. Check if user exists in backend
          setIsCheckingUser(true);
          try {
            const profileData = await getProfile();
            if (!profileData) {
              // User authenticated with Azure but doesn't exist in app
              setError("No account found");
              return;
            }
          } catch (profileError: any) {
            // Check if it's specifically a "user not found" error (including 500 from backend)
            if (profileError?.message === "USER_NOT_FOUND" || profileError?.response?.status === 404 || profileError?.response?.status === 403 || profileError?.response?.status === 500) {
              setError("No account found");
              return;
            }
            // Re-throw other errors
            throw profileError;
          } finally {
            setIsCheckingUser(false);
          }

          // 3. If we get here, user exists - proceed to app
          const next = params.get("state") || "/backoffice/archive";
          router.replace(next);
        } catch (e: any) {
          setIsCheckingUser(false);
          // Best-effort: if we cannot acquire token, surface error and avoid looping
          setError(e?.message || "No se pudo obtener el token de Azure");
          return;
        }
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
    if (inProgress === InteractionStatus.None && accounts.length === 0 && !startedLoginRef.current) {
      startedLoginRef.current = true;
      doLogin();
    }
  }, [accounts, inProgress, router, doLogin, doLogout, hashInfo.hasError, hashInfo.error, params]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="space-y-4 text-center max-w-md mx-auto p-6">
        {/* Show different messages based on state */}
        {!error && (
          <>
            <h1 className="text-2xl font-semibold text-white">Conectando con Microsoft...</h1>
            {inProgress === InteractionStatus.HandleRedirect && (
              <p className="text-gray-400">Procesando respuesta de autenticación…</p>
            )}
            {isCheckingUser && (
              <p className="text-gray-400">Verificando cuenta...</p>
            )}
          </>
        )}
        
        {/* Error messages */}
        {error && error !== "No account found" && (
          <p className="text-red-400">{error}</p>
        )}
        
        {/* Specific error screen for no account */}
        {error === "No account found" && (
          <div className="mt-6 p-6 bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Cuenta no creada
              </h3>
              <p className="text-gray-600 mb-2">
                Una cuenta con tu email aún no ha sido creada en esta aplicación.
              </p>
              <p className="text-sm text-gray-500">
                Por favor, contacta al administrador del sistema para que cree tu cuenta.
              </p>
            </div>
            <button
              onClick={() => {
                fetch("/api/session", { method: "DELETE", credentials: "include" });
                instance.logoutRedirect();
              }}
              className="mt-4 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        )}
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


