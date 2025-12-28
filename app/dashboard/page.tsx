"use client";

import AuthLayout from "../components/AuthLayout";
import styles from "./dashboard.module.css";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { createEstimate, listEstimates, setActiveEstimateId, ESTIMATES_EVENT, type EstimateMeta } from "@/lib/estimateDraft";

function formatUpdatedAt(iso: string): string {
  const d = new Date(iso);
  const now = new Date();

  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (sameDay) return "Today";

  const y = new Date(now);
  y.setDate(now.getDate() - 1);

  const yesterday =
    d.getFullYear() === y.getFullYear() && d.getMonth() === y.getMonth() && d.getDate() === y.getDate();

  if (yesterday) return "Yesterday";

  return d.toLocaleDateString();
}

// ✅ Server snapshot estable (misma referencia siempre)
const EMPTY: EstimateMeta[] = [];

// ✅ Cache para que getSnapshot devuelva MISMA referencia si no hay cambios
let cachedSig = "";
let cachedValue: EstimateMeta[] = EMPTY;

function getCachedSnapshot(): EstimateMeta[] {
  const next = listEstimates();
  const sig = JSON.stringify(next);
  if (sig == cachedSig) return cachedValue;
  cachedSig = sig;
  cachedValue = next;
  return next;
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

export default function DashboardPage() {
  const router = useRouter();

  const estimates = useSyncExternalStore(subscribe, getCachedSnapshot, () => EMPTY);

  const inProgress = estimates.filter((e) => e.status === "draft");
  const finalized = estimates.filter((e) => e.status === "finalized");

  function onNewEstimate() {
    const meta = createEstimate();
    setActiveEstimateId(meta.id);
    router.push("/select-areas");
  }

  function onContinue(e: EstimateMeta) {
    setActiveEstimateId(e.id);
    router.push(e.resumeHref || "/select-areas");
  }

  function onView(e: EstimateMeta) {
    setActiveEstimateId(e.id);
    router.push("/project-summary");
  }

  return (
    <AuthLayout>
      <div className={styles.shell}>
        <div className={styles.grid}>
          <main className={styles.main}>
            <div className={styles.content}>
              <div className={styles.headerRow}>
              <h1 className={styles.title}>Welcome</h1>
              <button type="button" className={styles.cta} onClick={onNewEstimate}>
                New estimate
              </button>
            </div>

            <div className={styles.cardsRow}>
              {/* IN PROGRESS */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.cardKicker}>In progress</div>
                    <div className={styles.cardTitle}>Continue where you left off</div>
                  </div>
                </div>

                <div className={styles.scrollList} role="list">
                  {inProgress.length === 0 ? (
                    <div className={styles.cardHint}>No drafts yet — create your first estimate.</div>
                  ) : (
                    inProgress.map((item) => (
                      <div className={styles.listItem} role="listitem" key={item.id}>
                        <div className={styles.itemLeft}>
                          <div className={styles.itemTitle}>{item.title}</div>
                          <div className={styles.itemMeta}>Updated: {formatUpdatedAt(item.updatedAt)}</div>
                        </div>

                        <button type="button" className={styles.itemBtn} onClick={() => onContinue(item)}>
                          Continue
                        </button>
                      </div>
                    ))
                  )}
                </div>
</section>

              {/* FINALIZED */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.cardKicker}>Saved</div>
                    <div className={styles.cardTitle}>Finalized projects (view-only)</div>
                  </div>
                </div>

                <div className={styles.scrollList} role="list">
                  {finalized.length === 0 ? (
                    <div className={styles.cardHint}>No finalized projects yet.</div>
                  ) : (
                    finalized.map((item) => (
                      <div className={styles.listItem} role="listitem" key={item.id}>
                        <div className={styles.itemLeft}>
                          <div className={styles.itemTitle}>{item.title}</div>
                          <div className={styles.itemMeta}>
                            Finalized: {item.finalizedAt ? formatUpdatedAt(item.finalizedAt) : "—"} · Total:{" "}
                            {item.total ?? "—"}
                          </div>
                        </div>

                        <button type="button" className={styles.itemBtnSecondary} onClick={() => onView(item)}>
                          View
                        </button>
                      </div>
                    ))
                  )}
                </div>
</section>
            </div>
            </div>
          </main>
        </div>
      </div>
    </AuthLayout>
  );
}
