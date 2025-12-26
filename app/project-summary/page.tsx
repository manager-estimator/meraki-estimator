"use client";

import Link from "next/link";
import styles from "./page.module.css";

type SummaryRow = { label: string; value: string };

export default function ProjectSummaryPage() {
  // TODO: conectar esto con tu estado real (scope/areas/qty/optionals).
  const project: SummaryRow[] = [
    { label: "Project name", value: "Meraki Estimator Project" },
    { label: "Client", value: "—" },
    { label: "Created", value: new Date().toLocaleDateString() },
  ];

  const totals: SummaryRow[] = [
    { label: "Areas", value: "—" },
    { label: "Devices", value: "—" },
    { label: "Estimated total", value: "—" },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Project summary</h1>
          <p className={styles.subtitle}>
            Review everything before exporting to PDF or going back to adjust scope.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={() => window.print()}
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
          <p className={styles.muted} style={{ marginTop: 12 }}>
            We’ll wire these numbers to your selections next.
          </p>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Next</h2>
          <p className={styles.muted}>If everything looks good, export to PDF or go back to adjust scope.</p>
          <div className={styles.cardActions}>
            <Link className={styles.secondaryBtn} href="/optionals">
              Back to optionals
            </Link>
            <Link className={styles.primaryBtn} href="/dashboard">
              Go to dashboard
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
