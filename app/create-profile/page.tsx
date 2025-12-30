import { redirect } from "next/navigation";
import AuthLayout from "../components/AuthLayout";
import CreateProfileForm from "../components/CreateProfileForm";
import { createClient } from "@/lib/supabase/server";

export default async function CreateProfilePage() {
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
    redirect("/dashboard");
  }

  return (
    <AuthLayout>
      <CreateProfileForm />
    </AuthLayout>
  );
}
