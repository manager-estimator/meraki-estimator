import { supabase } from "@/lib/supabaseClient";

export default async function SupabaseTestPage() {
  const { data, error } = await supabase.from("packs").select("*").limit(1);

  return (
    <main style={{ padding: 24 }}>
      <h1>Supabase test</h1>
      <pre>{JSON.stringify({ ok: !error, data, error }, null, 2)}</pre>
    </main>
  );
}
