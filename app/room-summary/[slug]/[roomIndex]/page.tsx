"use client";

import dynamic from "next/dynamic";

import { useParams } from "next/navigation";

import AuthLayout from "../../../components/AuthLayout";

const RoomSummaryForm = dynamic(() => import("../../../components/RoomSummaryForm"), { ssr: false });



export default function RoomSummaryPage() {
  const params = useParams() as { slug?: string; roomIndex?: string } | null;

  const slug = params?.slug;
  const roomIndex = params?.roomIndex;

  if (!slug || !roomIndex) return null;

  const body = <RoomSummaryForm slug={slug} roomIndex={roomIndex} />;

  return <AuthLayout>{body}</AuthLayout>;
}
