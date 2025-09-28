import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function base64UrlEncode(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function signHmacSha256(data: string, secret: string): string {
  const h = crypto.createHmac("sha256", secret);
  h.update(data);
  return base64UrlEncode(h.digest());
}

function createJwt(payload: Record<string, any>, secret: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const toSign = `${encodedHeader}.${encodedPayload}`;
  const signature = signHmacSha256(toSign, secret);
  return `${toSign}.${signature}`;
}

function getCookieOptions(maxAgeSeconds: number) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    name: "session",
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "body required" }, { status: 400 });
  }

  // If Azure access token is provided, set it directly as HttpOnly cookie `token`
  if (body.access_token) {
    const rawToken = String(body.access_token);
    const rawExpires = Number(body.expires_in) || 3600; // seconds
    const maxAge = Math.max(1, Math.min(rawExpires, 60 * 60 * 24 * 7)); // cap at 7 days
    const res = NextResponse.json({ ok: true });
    res.cookies.set({ ...getCookieOptions(maxAge), name: "token", value: rawToken });
    return res;
  }

  // Fallback: create internal session token if explicit user data provided (legacy)
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Missing SESSION_SECRET" }, { status: 500 });
  }
  if (!body.userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const userId = String(body.userId);
  const role = body.role ? String(body.role) : undefined;
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 60 * 60 * 24 * 7; // 7 days
  const payload = { sub: userId, role, iat: now, exp: now + expiresIn };
  const internal = createJwt(payload, secret);

  const res = NextResponse.json({ ok: true });
  res.cookies.set({ ...getCookieOptions(expiresIn), name: "session", value: internal });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ ...getCookieOptions(0), name: "token", value: "" });
  res.cookies.set({ ...getCookieOptions(0), name: "session", value: "" });
  return res;
}


