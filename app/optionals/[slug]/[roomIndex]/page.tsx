"use client";

import { useParams } from "next/navigation";
import AuthLayout from "../../../components/AuthLayout";
import OptionalsForm from "../../../components/OptionalsForm";

export default function OptionalsRoomPage() {
  const params = useParams() as { slug?: string; roomIndex?: string } | null;

  const slug = params?.slug;
  const roomIndex = params?.roomIndex;

  if (!slug || !roomIndex) return null;

  return (
    <AuthLayout>
      <OptionalsForm slug={slug} roomIndex={roomIndex} />
    </AuthLayout>
  );
}
