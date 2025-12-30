import { redirect } from "next/navigation";

export default async function LoginRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const err = sp?.error ? `&error=${encodeURIComponent(sp.error)}` : "";
  redirect(`/?mode=login${err}`);
}
