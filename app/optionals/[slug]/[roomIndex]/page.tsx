"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import AuthLayout from "../../../components/AuthLayout";

const OptionalsForm = dynamic(() => import("../../../components/OptionalsForm"), { ssr: false });


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
