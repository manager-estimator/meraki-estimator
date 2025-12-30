import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  const supabase = await createClient();

  // PKCE flow: si viene code, intercambiamos por sesión (set-cookie)
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Regla de producto:
  // - si hay usuario y NO hay profile => create-profile
  // - si hay profile => dashboard
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

  return NextResponse.redirect(new URL("/dashboard", url.origin));
}
