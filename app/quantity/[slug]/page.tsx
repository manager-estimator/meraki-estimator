import AuthLayout from "@/app/components/AuthLayout";
import QuantityForm from "@/app/components/QuantityForm";

export default async function QuantityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    // ignore
  }

  const cleanSlug = decoded.replace(/:$/, "");

  return (
    <AuthLayout>
      <QuantityForm key={cleanSlug} slug={cleanSlug} />
    </AuthLayout>
  );
}
