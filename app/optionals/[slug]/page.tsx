import AuthLayout from "@/app/components/AuthLayout";
import OptionalsForm from "@/app/components/OptionalsForm";

export default async function OptionalsPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const p: any = await Promise.resolve(params as any);
  const slug: string = p?.slug ?? "";
  return (
    <AuthLayout>
      <OptionalsForm slug={slug} />
    </AuthLayout>
  );
}
