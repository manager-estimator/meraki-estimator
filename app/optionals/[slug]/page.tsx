import { redirect } from "next/navigation";

export default function OptionalsPage({ params }: { params: { slug: string } }) {
  redirect(`/optionals/${params.slug}/1`);
}
