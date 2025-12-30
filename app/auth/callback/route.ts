import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";

  const supabase = await createClient();

  // PKCE flow: si viene code, intercambiamos por sesión (set-cookie)
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Regla: si hay usuario pero NO hay profile -> obligamos create-profile
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;

  if (user?.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.id) {
      return NextResponse.redirect(new URL("/create-profile", url.origin));
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
