"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect("/?mode=signup&error=" + encodeURIComponent(error.message));
  }

  // Si tu proyecto exige verificación por email, esto te llevará a una pantalla “check email” luego.
  redirect("/check-email?email=" + encodeURIComponent(email));
}

export async function resendVerificationAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();

  if (!email) {
    redirect("/check-email?error=" + encodeURIComponent("Missing email"));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });

  if (error) {
    redirect(
      "/check-email?email=" +
        encodeURIComponent(email) +
        "&error=" +
        encodeURIComponent(error.message)
    );
  }

  redirect("/check-email?email=" + encodeURIComponent(email) + "&resent=1");
}


export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/?mode=login&error=" + encodeURIComponent(error.message));
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
