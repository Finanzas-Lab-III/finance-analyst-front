import { NextRequest } from "next/server";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_SERVICE_URL;

if (!BACKEND_BASE_URL) {
  // Note: Next will evaluate this at build time on the server
  console.warn("Missing NEXT_PUBLIC_SERVICE_URL; proxy route will not work without it.");
}

async function forward(req: NextRequest, { params }: { params: { path: string[] } }) {
  if (!BACKEND_BASE_URL) {
    return new Response(JSON.stringify({ message: "Backend base URL not configured" }), { status: 500 });
  }

  const path = Array.isArray(params.path) ? params.path.join("/") : String(params.path ?? "");

  // Build target URL, preserving query string
  const targetUrl = new URL(`/api/${path}`, BACKEND_BASE_URL);
  const incomingUrl = new URL(req.url);
  for (const [k, v] of incomingUrl.searchParams.entries()) {
    targetUrl.searchParams.append(k, v);
  }

  // Clone headers, forward cookies and add ngrok header
  const headers = new Headers(req.headers);
  headers.set("ngrok-skip-browser-warning", "1");

  // Some hop-by-hop headers should not be forwarded
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  // Prepare body for non-GET/HEAD
  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  const body = hasBody ? req.body : undefined;

  const response = await fetch(targetUrl.toString(), {
    method,
    headers,
    body: body as any,
    // Include credentials via cookie header (same-origin cookie automatically present)
    redirect: "manual",
  });

  // Stream back response with headers and status
  const resHeaders = new Headers(response.headers);
  // Avoid setting hop-by-hop headers
  resHeaders.delete("connection");
  resHeaders.delete("transfer-encoding");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: resHeaders,
  });
}

export { forward as GET, forward as POST, forward as PUT, forward as DELETE, forward as PATCH, forward as OPTIONS };


