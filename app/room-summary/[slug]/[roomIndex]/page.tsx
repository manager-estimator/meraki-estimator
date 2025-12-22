"use client";

import { useParams } from "next/navigation";
import RoomSummaryForm from "../../../components/RoomSummaryForm";
import AuthLayout from "../../../components/AuthLayout";


export default function RoomSummaryPage() {
  const params = useParams() as { slug?: string; roomIndex?: string } | null;

  const slug = params?.slug;
  const roomIndex = params?.roomIndex;

  if (!slug || !roomIndex) return null;

  const body = <RoomSummaryForm slug={slug} roomIndex={roomIndex} />;

  return <AuthLayout>{body}</AuthLayout>;
}
