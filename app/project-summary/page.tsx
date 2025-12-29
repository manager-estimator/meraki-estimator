"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import {
  ESTIMATES_EVENT,
  finalizeActiveEstimate,
  getActiveDraftSnapshot,
  isActiveEstimateFinalized,
  type EstimateDraft,
} from "@/lib/estimateDraft";

type SummaryRow = { label: string; value: string };

type Totals = {
  areas: number;
  rooms: number;
  base: number;
  optionals: number;
  total: number;
};

function euro(n: number) {
  return n.toLocaleString("es-ES", { maximumFractionDigits: 0 }) + " €";
}

const UNIT_PRICE = 800; // €/m² (por ahora fijo)

// SSR-safe stable reference
const EMPTY_TOTALS: Totals = { areas: 0, rooms: 0, base: 0, optionals: 0, total: 0 };

// Cache: important for useSyncExternalStore (must return same reference if unchanged)
let cachedSig = "";
let cachedTotals: Totals = EMPTY_TOTALS;

function computeTotals(draft: EstimateDraft): Totals {
  let rooms = 0;
  let base = 0;
  let optionals = 0;

  for (const area of Object.values(draft.areas || {})) {
    for (const r of area.rooms || []) {
      rooms += 1;
      const m2 = typeof r.area === "number" && r.area > 0 ? r.area : 0;
      base += m2 * UNIT_PRICE;

      const opts = Array.isArray(r.optionals) ? r.optionals : [];
      optionals += opts.reduce((acc, o) => acc + (typeof o.price === "number" ? o.price : 0), 0);
    }
  }

  const total = base + optionals;
  const areas = (draft.selectedAreas || []).length;

  return { areas, rooms, base, optionals, total };
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(ESTIMATES_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(ESTIMATES_EVENT, handler);
  };
}

function getSnapshot(): Totals {
  if (typeof window === "undefined") return EMPTY_TOTALS;
  try {
    const draft = getActiveDraftSnapshot();

    // If draft didn't change, return SAME object reference
    const sig = JSON.stringify(draft);
    if (sig === cachedSig) return cachedTotals;

    cachedSig = sig;
    cachedTotals = computeTotals(draft);
    return cachedTotals;
  } catch {
    return EMPTY_TOTALS;
  }
}

export default function ProjectSummaryPage() {
  const router = useRouter();

  // ✅ Stable snapshot (no infinite loop)
  const tot = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_TOTALS);

  const alreadyFinalized = typeof window !== "undefined" ? isActiveEstimateFinalized() : false;

  const project: SummaryRow[] = useMemo(
    () => [
      { label: "Project name", value: "Meraki Estimator Project" },
      { label: "Client", value: "—" },
      { label: "Created", value: new Date().toLocaleDateString() },
    ],
    []
  );

  const totals: SummaryRow[] = useMemo(
    () => [
      { label: "Areas", value: String(tot.areas) },
      { label: "Rooms", value: String(tot.rooms) },
      { label: "Base", value: euro(tot.base) },
      { label: "Optionals", value: euro(tot.optionals) },
      { label: "Estimated total", value: euro(tot.total) },
    ],
    [tot]
  );

  function finalizeWithTotal() {
    if (alreadyFinalized) return;
    finalizeActiveEstimate({ total: euro(tot.total) });
  }

  function onExportPdf() {
    finalizeWithTotal();
    window.print();
  }

  function onSaveAndGoDashboard() {
    finalizeWithTotal();
    router.push("/dashboard");
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Project summary</h1>
          <p className={styles.subtitle}>Review everything before exporting to PDF or going back to adjust scope.</p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={onExportPdf}
            aria-label="Export to PDF (Print)"
          >
            Export to PDF
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Project</h2>
          <div className={styles.kvList}>
            {project.map((r) => (
              <div key={r.label} className={styles.kvRow}>
                <div className={styles.kvLabel}>{r.label}</div>
                <div className={styles.kvValue}>{r.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Totals</h2>
          <div className={styles.kvList}>
            {totals.map((r) => (
              <div key={r.label} className={styles.kvRow}>
                <div className={styles.kvLabel}>{r.label}</div>
                <div className={styles.kvValue}>{r.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Next</h2>
          <p className={styles.muted}>If everything looks good, export to PDF or save to dashboard.</p>

          <div className={styles.cardActions}>
            <Link className={styles.secondaryBtn} href="/select-areas">
              Back to scope
            </Link>

            <button
              type="button"
              className={styles.primaryBtn}
              onClick={onSaveAndGoDashboard}
              aria-label="Finalize and go to dashboard"
            >
              {alreadyFinalized ? "Go to dashboard" : "Save to dashboard"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
