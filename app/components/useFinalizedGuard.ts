"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isActiveEstimateFinalized } from "@/lib/estimateDraft";

export function useFinalizedGuard() {
  const router = useRouter();

  useEffect(() => {
    if (isActiveEstimateFinalized()) {
      router.replace("/project-summary");
    }
  }, [router]);
}
