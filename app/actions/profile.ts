"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function asStr(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v : "";
}

function safeNext(raw: FormDataEntryValue | null): string {
  const v = asStr(raw).trim();
  if (!v) return "/dashboard";
  if (!v.startsWith("/") || v.startsWith("//")) return "/dashboard";
  if (v === "/create-profile") return "/dashboard";
  return v;
}

export async function createProfileAction(formData: FormData) {
  const fullName = asStr(formData.get("fullName")).trim();
  const phone = asStr(formData.get("phone")).trim();
  const city = asStr(formData.get("city")).trim();
  const language = asStr(formData.get("language")).trim();
  const next = safeNext(formData.get("next"));

  if (!fullName || !city) {
    redirect("/create-profile?error=" + encodeURIComponent("Missing required fields"));
  }
  if (language !== "en" && language !== "es") {
    redirect("/create-profile?error=" + encodeURIComponent("Invalid language"));
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
    redirect("/create-profile?error=" + encodeURIComponent(error.message));
  }

  redirect(next);
}
