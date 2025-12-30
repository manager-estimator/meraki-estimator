import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
  return raw.trim();
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

  const requestedNext = safeRequestedNext(nextRaw);
  const afterProfile = safeAfterProfile(nextRaw);

  const supabase = await createClient();

  // PKCE flow: si viene code, intercambiamos por sesión (set-cookie)
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Regla: si hay usuario pero NO hay profile -> obligamos create-profile (preservando destino post-profile)
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;

  if (user?.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.id) {
      const dest = new URL("/create-profile", url.origin);
      // Guardamos "a dónde ir después de crear profile"
      dest.searchParams.set("next", afterProfile);
      return NextResponse.redirect(dest);
    }
  }

  // Si ya tiene profile, respeta el "next" pedido.
  return NextResponse.redirect(new URL(requestedNext, url.origin));
}
