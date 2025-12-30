import AuthLayout from "../../components/AuthLayout";
import AreaDetailsForm from "../../components/AreaDetailsForm";

export default async function AreaPage({
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

  // por si llega "entrance-circulation:" tras decode de %3A
  const cleanSlug = decoded.replace(/:$/, "");

  return (
    <AuthLayout>
      <AreaDetailsForm slug={cleanSlug} />
    </AuthLayout>
  );
}
