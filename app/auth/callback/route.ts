import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNext(raw: string | null): string {
  const v = (raw || "").trim();
  // Solo permitimos rutas internas tipo "/algo" (evita http(s)://, //evil.com, etc.)
  if (!v.startsWith("/") || v.startsWith("//")) return "/dashboard";
  // Evita bucles
  if (v === "/create-profile") return "/dashboard";
  return v;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  const next = safeNext(url.searchParams.get("next") || "/dashboard");

  const supabase = await createClient();

  // PKCE flow: si viene code, intercambiamos por sesión (set-cookie)
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Regla: si hay usuario pero NO hay profile -> obligamos create-profile (conservando next)
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
      dest.searchParams.set("next", next);
      return NextResponse.redirect(dest);
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
