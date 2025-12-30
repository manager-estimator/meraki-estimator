import { redirect } from "next/navigation";
import AuthLayout from "../components/AuthLayout";
import CreateProfileForm from "../components/CreateProfileForm";
import { createClient } from "@/lib/supabase/server";

type SP = Record<string, string | string[] | undefined>;

function getParam(sp: SP | undefined, key: string): string {
  const v = sp?.[key];
  if (Array.isArray(v)) return v[0] ?? "";
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

function safeAfterProfile(raw: string): string {
  const s = (raw || "").trim();
  if (!isSafeRelativePath(s)) return "/dashboard";
  if (s === "/create-profile" || s.startsWith("/create-profile?")) return "/dashboard";
  return s;
}

export default async function CreateProfilePage({
  searchParams,
}: {
  searchParams?: SP;
}) {
  const nextRaw = getParam(searchParams, "next");
  const next = safeAfterProfile(nextRaw);

  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;

  if (!user) {
    redirect("/?mode=login");
  }

  // Si ya existe profile, no volvemos a pedirlo.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.id) {
    redirect(next);
  }

  return (
    <AuthLayout>
      <CreateProfileForm />
    </AuthLayout>
  );
}
