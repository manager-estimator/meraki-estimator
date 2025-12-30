"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function asStr(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v : "";
}

function isSafeRelativePath(v: string): boolean {
  const s = (v || "").trim();
  if (!s) return false;
  if (!s.startsWith("/")) return false;
  if (s.startsWith("//")) return false;
  if (s.includes("://")) return false;
  if (s.includes("\n") || s.includes("\r")) return false;
  return true;
}

// Destino POST-profile
function safeAfterProfile(raw: string): string {
  const s = (raw || "").trim();
  if (!isSafeRelativePath(s)) return "/dashboard";
  if (s === "/create-profile" || s.startsWith("/create-profile?")) return "/dashboard";
  return s;
}

export async function createProfileAction(formData: FormData) {
  const fullName = asStr(formData.get("fullName")).trim();
  const phone = asStr(formData.get("phone")).trim();
  const city = asStr(formData.get("city")).trim();
  const language = asStr(formData.get("language")).trim();

  const nextRaw = asStr(formData.get("next")).trim();
  const next = safeAfterProfile(nextRaw);

  const backQs = (msg: string) => {
    const qs = new URLSearchParams();
    qs.set("error", msg);
    // preserva next si es ruta segura (aunque luego lo normalicemos al usarlo)
    if (isSafeRelativePath(nextRaw)) qs.set("next", nextRaw);
    return "/create-profile?" + qs.toString();
  };

  if (!fullName || !city) {
    redirect(backQs("Missing required fields"));
  }
  if (language !== "en" && language !== "es") {
    redirect(backQs("Invalid language"));
  }

  const supabase = await createClient();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();

  if (userErr || !userRes?.user) {
    redirect("/?mode=login&error=" + encodeURIComponent("Please sign in"));
  }

  const user = userRes.user;

  const payload = {
    id: user.id,
    email: user.email ?? null,
    full_name: fullName,
    phone: phone || null,
    city,
    language,
  };

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });

  if (error) {
    redirect(backQs(error.message));
  }

  redirect(next);
}
