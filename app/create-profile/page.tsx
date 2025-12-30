import { redirect } from "next/navigation";
import AuthLayout from "../components/AuthLayout";
import CreateProfileForm from "../components/CreateProfileForm";
import { createClient } from "@/lib/supabase/server";

function safeNext(raw: unknown): string {
  const v = typeof raw === "string" ? raw.trim() : "";
  if (!v.startsWith("/") || v.startsWith("//")) return "/dashboard";
  if (v === "/create-profile") return "/dashboard";
  return v;
}

export default async function CreateProfilePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;

  if (!user) {
    redirect("/?mode=login");
  }

  const next = safeNext(searchParams?.next);

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
