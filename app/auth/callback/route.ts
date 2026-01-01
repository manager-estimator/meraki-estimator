import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function withNoStore(r: NextResponse) {
  r.headers.set("cache-control", "private, no-store, max-age=0, must-revalidate");
  r.headers.set("x-middleware-cache", "no-cache");
  return r;
}

function isSafeRelativePath(v: string | null): v is string {
  if (!v) return false;
  const s = v.trim();
  if (!s) return false;
  if (!s.startsWith("/")) return false;
  if (s.startsWith("//")) return false;
  if (s.includes("://")) return false;
  if (s.includes("\n") || s.includes("\r")) return false;
  return true;
}

// Destino inmediato tras /auth/callback (si ya hay profile)
function safeRequestedNext(raw: string | null): string {
  if (!isSafeRelativePath(raw)) return "/dashboard";
  const s = raw.trim();

  // Nunca aceptamos /create-profile como destino "normal".
  // /create-profile SOLO se alcanza si el callback detecta que falta profile.
  if (s === "/create-profile" || s.startsWith("/create-profile?")) return "/dashboard";

  return s;
}

// Destino POST-profile (si tuvimos que forzar /create-profile)
function safeAfterProfile(raw: string | null): string {
  if (!isSafeRelativePath(raw)) return "/dashboard";
  const s = raw.trim();
  // Si el "next" era create-profile (signup flow), después del profile debe ir a dashboard.
  if (s === "/create-profile" || s.startsWith("/create-profile?")) return "/dashboard";
  return s;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextRaw = url.searchParams.get("next");
  const type = url.searchParams.get("type");

  const requestedNext = safeRequestedNext(nextRaw);
  const afterProfile = safeAfterProfile(nextRaw);

  const supabase = await createClient();

  // PKCE flow: si viene code, intercambiamos por sesión (set-cookie)
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }


  // Recovery flow: NO obligar create-profile. Debe ir directo a reset-password.
  const isRecovery = type === "recovery";
  const wantsReset =
    requestedNext === "/reset-password" || requestedNext.startsWith("/reset-password?");

  if (isRecovery || wantsReset) {
    const dest = wantsReset ? requestedNext : "/reset-password";
    return withNoStore(NextResponse.redirect(new URL(dest, url.origin)));
  }


  // Regla: si hay usuario pero NO hay profile -> obligamos create-profile (preservando destino post-profile)
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;

  if (user?.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, city, language")
      .eq("id", user.id)
      .maybeSingle();

    const complete =
      !!profile?.id &&
      !!profile.full_name &&
      !!profile.city &&
      (profile.language === "en" || profile.language === "es");

    if (!complete) {
      const dest = new URL("/create-profile", url.origin);
      // Guardamos "a dónde ir después de crear profile"
      dest.searchParams.set("next", afterProfile);
      return withNoStore(NextResponse.redirect(dest));
    }
  }

  // Si ya tiene profile, respeta el "next" pedido.
  return withNoStore(NextResponse.redirect(new URL(requestedNext, url.origin)));
}
