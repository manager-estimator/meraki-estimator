"use client";

import { useEffect, useMemo, useState } from "react";
import { ESTIMATES_EVENT, getActiveEstimateId, isActiveEstimateFinalized, listEstimates } from "@/lib/estimateDraft";

type Snap = {
  at: string;
  activeId: string | null;
  activeIsFinalized: boolean;
  estimates: unknown[];
};

function readSnapshot(): Snap {
  return {
    at: new Date().toISOString(),
    activeId: getActiveEstimateId(),
    activeIsFinalized: isActiveEstimateFinalized(),
    estimates: listEstimates(),
  };
}

export default function DebugStoragePage() {
  const [snap, setSnap] = useState<Snap | null>(null);

  const refresh = useMemo(() => {
    return () => setSnap(readSnapshot());
  }, []);

  useEffect(() => {
    // Evita el warning del linter: setState NO se llama "sincrónicamente" dentro del body del effect
    const t = window.setTimeout(() => refresh(), 0);

    const onChange = () => refresh();
    window.addEventListener(ESTIMATES_EVENT, onChange);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener(ESTIMATES_EVENT, onChange);
    };
  }, [refresh]);

  if (!snap) {
    return (
      <main style={{ padding: 24 }}>
        <h1 style={{ fontSize: 18, marginBottom: 12 }}>/debug-storage</h1>
        <p>Cargando snapshot…</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 18, marginBottom: 12 }}>/debug-storage</h1>

      <p style={{ marginBottom: 12 }}>
        activeId: <b>{String(snap.activeId)}</b> — activeIsFinalized: <b>{String(snap.activeIsFinalized)}</b>
      </p>

      <p style={{ marginBottom: 12 }}>last read: {snap.at}</p>

      <button type="button" onClick={refresh} style={{ marginBottom: 12, padding: "8px 12px", borderRadius: 8 }}>
        Refresh
      </button>

      <pre style={{ background: "#111", color: "#eee", padding: 12, borderRadius: 8, overflow: "auto" }}>
        {JSON.stringify(snap.estimates, null, 2)}
      </pre>
    </main>
  );
}
