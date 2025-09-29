import { NextResponse, NextRequest } from "next/server";

// Paths that do not require auth
const PUBLIC_PATHS: RegExp[] = [
  /^\/login(\/)?$/,
  /^\/api\/session(\/)?$/,
  /^\/_next\//,
  /^\/public\//,
  /^\/favicon\.ico$/,
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((r) => r.test(pathname));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Protect only backoffice (which maps to route group (with_auth))
  const isProtected = pathname.startsWith('/backoffice');
  if (!isProtected) {
    return NextResponse.next();
  }

  const hasToken = Boolean(req.cookies.get("token")?.value);

  if (!hasToken) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    // Preserve original destination to continue after login
    loginUrl.searchParams.set("state", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/backoffice/:path*", "/((?!_next|api/session|login|favicon.ico|robots.txt|sitemap.xml|public).*)"],
};


