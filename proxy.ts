import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass defensivo (por si el matcher no excluye algo)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    /\.[a-zA-Z0-9]+$/.test(pathname) // assets tipo .css .js .png...
  ) {
    return NextResponse.next();
  }

  
const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-original-url", request.url);
  const response = NextResponse.next({ request: { headers: requestHeaders } });


  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Evita que Vercel cachee HTML afectado por sesión (muy importante con páginas protegidas)
  response.headers.set("x-middleware-cache", "no-cache");

  // Refresca sesión si existe
  const { data: { user } } = await supabase.auth.getUser();
  // Rutas públicas (sin login)
  const isPublic =
    pathname.startsWith("/auth") ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/check-email" ||
    pathname === "/forgot-password" ||
    pathname === "/invite";

  const isProtected = !isPublic;

  // En rutas protegidas, evita caching de HTML
  if (isProtected) {
    response.headers.set(
      "cache-control",
      "private, no-store, max-age=0, must-revalidate"
    );
  }
  // /create-profile NO debe ser accesible sin sesión (solo flujo post-signup verify)
  // Si alguien pega la URL a mano sin sesión, NO queremos que login lo devuelva aquí.
  if (!user && pathname === "/create-profile") {
    // URL limpio (no arrastra query params del request)
    const url = new URL("/", request.url);
    url.searchParams.set("mode", "login");
    url.searchParams.set("redirectTo", "/dashboard");

    const r = NextResponse.redirect(url, { status: 307 });
    r.headers.set("x-middleware-cache", "no-cache");
    r.headers.set("cache-control", "private, no-store, max-age=0, must-revalidate");
    return r;
  }

  // Si NO hay usuario y la ruta NO es pública -> manda a login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("mode", "login");

    // intenta preservar query de forma robusta
    const sp = request.nextUrl.searchParams.toString();
    const s1 = request.nextUrl.search || "";
    const s2 = (() => { try { return new URL(request.url).search || ""; } catch { return ""; } })();
    const search = sp ? ("?" + sp) : (s1 || s2 || "");

    url.searchParams.set("redirectTo", pathname + search);

    const r = NextResponse.redirect(url, { status: 307 });
    r.headers.set("x-middleware-cache", "no-cache");
    r.headers.set("cache-control", "private, no-store, max-age=0, must-revalidate");
    return r;
  }

  // Si ya hay usuario y está intentando login -> a dashboard
  const wantsLogin =
    pathname === "/login" ||
    (pathname === "/" && request.nextUrl.searchParams.get("mode") === "login");

  if (user && wantsLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.searchParams.delete("mode");
    const r = NextResponse.redirect(url, { status: 307 });
    r.headers.set("x-middleware-cache", "no-cache");
    r.headers.set("cache-control", "private, no-store, max-age=0, must-revalidate");
    return r;
  }

  return response;
}

export const config = {
  // Excluye TODO _next (incluye webpack-hmr), api, favicon y cualquier ruta con extensión
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
