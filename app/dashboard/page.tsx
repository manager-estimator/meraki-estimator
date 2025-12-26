"use client";

import AuthLayout from "../components/AuthLayout";
import styles from "./dashboard.module.css";
import { useRouter } from "next/navigation";

type DraftItem = {
  id: string;
  title: string;
  updatedAt: string;
  resumeHref: string; // aquí luego pondremos la ruta real para reanudar
};

type FinalItem = {
  id: string;
  title: string;
  finalizedAt: string;
  total: string;
  viewHref: string; // luego: /projects/[id]
};

export default function DashboardPage() {
  const router = useRouter();

  // ✅ Placeholder (luego vendrá de Supabase o storage)
  const inProgress: DraftItem[] = [
    {
      id: "draft_1",
      title: "Project 1 (in progress)",
      updatedAt: "Today",
      resumeHref: "/select-areas",
    },
    {
      id: "draft_2",
      title: "Kitchen refresh (in progress)",
      updatedAt: "Yesterday",
      resumeHref: "/select-areas",
    },
  ];

  const finalized: FinalItem[] = [
    {
      id: "final_1",
      title: "Entrance + Kitchen + Bathrooms",
      finalizedAt: "Dec 22",
      total: "€ 12,450",
      viewHref: "/project-summary",
    },
    {
      id: "final_2",
      title: "Bathrooms only",
      finalizedAt: "Dec 10",
      total: "€ 4,980",
      viewHref: "/project-summary",
    },
  ];

  return (
    <AuthLayout>
      <div className={styles.shell}>
        <div className={styles.grid}>
          {/* LEFT QUADRANT */}
{/* RIGHT PANEL */}
          <main className={styles.main}>
            <div className={styles.headerRow}>
              <h1 className={styles.title}>Welcome</h1>
              <button
                type="button"
                className={styles.cta}
                onClick={() => router.push("/select-areas")}
              >
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
                  {inProgress.map((item) => (
                    <div className={styles.listItem} role="listitem" key={item.id}>
                      <div className={styles.itemLeft}>
                        <div className={styles.itemTitle}>{item.title}</div>
                        <div className={styles.itemMeta}>Updated: {item.updatedAt}</div>
                      </div>

                      <button
                        type="button"
                        className={styles.itemBtn}
                        onClick={() => router.push(item.resumeHref)}
                      >
                        Continue
                      </button>
                    </div>
                  ))}
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.cardHint}>
                    Next: we’ll store “resumeHref” per draft so you continue at the exact step.
                  </div>
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
                  {finalized.map((item) => (
                    <div className={styles.listItem} role="listitem" key={item.id}>
                      <div className={styles.itemLeft}>
                        <div className={styles.itemTitle}>{item.title}</div>
                        <div className={styles.itemMeta}>
                          Finalized: {item.finalizedAt} · Total: {item.total}
                        </div>
                      </div>

                      <button
                        type="button"
                        className={styles.itemBtnSecondary}
                        onClick={() => router.push(item.viewHref)}
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.cardHint}>
                    Finalized items must not be editable (UI + permissions).
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </AuthLayout>
  );
}
