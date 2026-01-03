"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, Fragment } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import MerakiLogo from "../components/MerakiLogo";

import {
  ESTIMATES_EVENT,
  finalizeActiveEstimate,
  duplicateEstimate,
  getActiveDraftSnapshot,
  getActiveEstimateId,
  isActiveEstimateFinalized,
  listEstimates,
  type EstimateDraft,
  type EstimateMeta,
} from "@/lib/estimateDraft";
import { unitPriceForSlug } from "@/lib/pricing";

function euro(n: number) {
  return n.toLocaleString("es-ES", { maximumFractionDigits: 0 }) + " €";
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-ES");
}

type OptionalLine = { category: string; label: string; price: number; editHref: string };

type RoomLine = {
  roomIndex: number;
  name: string;
  m2: number;
  base: number;
  optionals: number;
  subtotal: number;
  optionalsCount: number;
  optionalsList: OptionalLine[];
  editHref: string;
  isMissingM2: boolean;
};

type AreaBlock = {
  slug: string;
  label: string;
  rooms: RoomLine[];
  base: number;
  optionals: number;
  subtotal: number;
};

type Snapshot = {
  meta: EstimateMeta | null;
  resumeHref: string;
  alreadyFinalized: boolean;
  totals: {
    areas: number;
    rooms: number;
    m2: number;
    optionalsCount: number;
    base: number;
    optionals: number;
    total: number;
  };
  alerts: string[];
  areas: AreaBlock[];
};

const EMPTY: Snapshot = {
  meta: null,
  resumeHref: "/select-areas",
  alreadyFinalized: false,
  totals: { areas: 0, rooms: 0, m2: 0, optionalsCount: 0, base: 0, optionals: 0, total: 0 },
  alerts: [],
  areas: [],
};

// Cache: important for useSyncExternalStore (must return same reference if unchanged)
let cachedSig = "";
let cachedSnap: Snapshot = EMPTY;

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

function buildSnapshot(draft: EstimateDraft): Snapshot {
  const index = listEstimates();
  const activeId = getActiveEstimateId() || index[0]?.id || null;
  const meta = activeId ? index.find((x) => x.id === activeId) || null : null;

  const resumeHref = meta?.resumeHref || "/select-areas";
  const alreadyFinalized = typeof window !== "undefined" ? isActiveEstimateFinalized() : false;

  const alerts: string[] = [];
  const areas: AreaBlock[] = [];

  let rooms = 0;
  let m2 = 0;
  let base = 0;
  let optionals = 0;
  let optionalsCount = 0;

  // Keep ordering stable using selectedAreas, and fallback to any areas present
  const selected = Array.isArray(draft.selectedAreas) ? draft.selectedAreas : [];
  const orderedSlugs = selected.map((a) => a.slug);

  const extraSlugs = Object.keys(draft.areas || {}).filter((s) => !orderedSlugs.includes(s));
  const slugs = [...orderedSlugs, ...extraSlugs];

  for (const slug of slugs) {
    const area = (draft.areas || {})[slug];
    const areaLabel = area?.label || selected.find((x) => x.slug === slug)?.label || slug;

    const roomLines: RoomLine[] = [];
    let areaBase = 0;
    let areaOptionals = 0;

    const roomList = Array.isArray(area?.rooms) ? area!.rooms : [];

    roomList.forEach((r, idx) => {
      rooms += 1;

      const m2raw = typeof r?.area === "number" && Number.isFinite(r.area) ? r.area : 0;
      const m2safe = m2raw > 0 ? m2raw : 0;
      const isMissingM2 = !(m2raw > 0);

      if (isMissingM2) {
        alerts.push(`⚠️ "${areaLabel}" → room #${idx + 1} (${r?.name || "Unnamed"}) tiene m² = 0.`);
      }

      const roomBase = m2safe * unitPriceForSlug(slug);

      const opts = Array.isArray(r?.optionals) ? r.optionals : [];
      const roomOpts = opts.reduce((acc, o) => acc + (typeof o?.price === "number" ? o.price : 0), 0);
      const roomOptsCount = opts.length;

      const optionalsList: OptionalLine[] = opts
        .map((o) => {
          const label = typeof o?.label === "string" && o.label.trim() ? o.label : "Optional";
          const price = typeof o?.price === "number" && Number.isFinite(o.price) ? o.price : 0;
          const category = typeof o?.category === "string" && o.category.trim() ? o.category : "floorings";
          const editHref = `/optionals/${encodeURIComponent(slug)}/${idx + 1}?from=edit&returnTo=%2Fproject-summary&cat=${encodeURIComponent(category)}`;
          return { category, label, price, editHref };
        })
        .filter((x) => x.label !== "Optional" || x.price !== 0);

      optionalsCount += roomOptsCount;

      const roomSubtotal = roomBase + roomOpts;

      m2 += m2safe;
      base += roomBase;
      optionals += roomOpts;

      areaBase += roomBase;
      areaOptionals += roomOpts;

      roomLines.push({
        roomIndex: idx + 1,
        name: r?.name || `Room ${idx + 1}`,
        m2: m2safe,
        base: roomBase,
        optionals: roomOpts,
        subtotal: roomSubtotal,
        optionalsCount: roomOptsCount,
        optionalsList,
        editHref: `/optionals/${encodeURIComponent(slug)}/${idx + 1}?from=edit&returnTo=%2Fproject-summary&cat=${encodeURIComponent(optionalsList[0]?.category || "floorings")}`,
        isMissingM2,
      });
    });

    const areaSubtotal = areaBase + areaOptionals;

    // Only push if it exists in selected or has rooms (keeps it clean)
    if (selected.length === 0 ? roomLines.length > 0 : orderedSlugs.includes(slug)) {
      areas.push({
        slug,
        label: areaLabel,
        rooms: roomLines,
        base: areaBase,
        optionals: areaOptionals,
        subtotal: areaSubtotal,
      });
    }
  }

  const total = base + optionals;

  return {
    meta,
    resumeHref,
    alreadyFinalized,
    totals: {
      areas: selected.length || areas.length,
      rooms,
      m2,
      optionalsCount,
      base,
      optionals,
      total,
    },
    alerts,
    areas,
  };
}

function getSnapshot(): Snapshot {
  if (typeof window === "undefined") return EMPTY;
  try {
    const draft = getActiveDraftSnapshot();

    const sig = JSON.stringify(draft) + "::" + JSON.stringify(listEstimates());
    if (sig === cachedSig) return cachedSnap;

    cachedSig = sig;
    cachedSnap = buildSnapshot(draft);
    return cachedSnap;
  } catch {
    return EMPTY;
  }
}

export default function ProjectSummaryPage() {
  const router = useRouter();
  const snap = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);

  const [openOpts, setOpenOpts] = useState<Record<string, boolean>>({});

  const title = snap.meta?.title || "Estimate";
  const created = fmtDate(snap.meta?.createdAt);
  const updated = fmtDate(snap.meta?.updatedAt);

  const projectRate = snap.totals.m2 > 0 ? Math.round(snap.totals.total / snap.totals.m2) : null;

  function finalizeWithTotal() {
    if (snap.alreadyFinalized) return;
    finalizeActiveEstimate({ total: euro(snap.totals.total) });
  }

  function onExportPdf() {
    finalizeWithTotal();
    // Give the browser a tick so the UI is stable before printing
    setTimeout(() => window.print(), 0);
  }

  function onSaveAndGoDashboard() {
    finalizeWithTotal();
    router.push("/dashboard");
  }

  function onDuplicateAndEdit() {
    const id = snap.meta?.id;
    if (!id) return;
    const meta = duplicateEstimate(id);
    if (!meta) return;
    router.push("/project-summary?dup=" + encodeURIComponent(meta.id));
  }


  function toggleOptionals(key: string) {
    setOpenOpts((m) => ({ ...m, [key]: !m[key] }));
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Project summary</h1>
          <p className={styles.subtitle}>
            Review scope & totals before exporting. Estimated project price: <span className={styles.pill}>{projectRate ? `${projectRate} €/m²` : "—"}</span>
          </p>
        </div>

        <div className={styles.headerRight} aria-label="Meraki logo">
          <MerakiLogo className={styles.logoImg} />
        </div>
      </header>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Project</h2>
          <div className={styles.kvList}>
            <div className={styles.kvRow}>
              <div className={styles.kvLabel}>Title</div>
              <div className={styles.kvValue}>{title}</div>
            </div>
            <div className={styles.kvRow}>
              <div className={styles.kvLabel}>Created</div>
              <div className={styles.kvValue}>{created}</div>
            </div>
            <div className={styles.kvRow}>
              <div className={styles.kvLabel}>Updated</div>
              <div className={styles.kvValue}>{updated}</div>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Totals</h2>

          <div className={styles.totalBig}>{euro(snap.totals.total)}</div>
          <div className={styles.kpiRow}>
            <div className={styles.kpiPill}>{snap.totals.areas} areas</div>
            <div className={styles.kpiPill}>{snap.totals.rooms} rooms</div>
            <div className={styles.kpiPill}>{snap.totals.m2.toLocaleString("es-ES")} m²</div>
            <div className={styles.kpiPill}>{snap.totals.optionalsCount} optionals</div>
          </div>

          <div className={styles.kvList}>
            <div className={styles.kvRow}>
              <div className={styles.kvLabel}>Base (m² × area rates)</div>
              <div className={styles.kvValue}>{euro(snap.totals.base)}</div>
            </div>
            <div className={styles.kvRow}>
              <div className={styles.kvLabel}>Optionals</div>
              <div className={styles.kvValue}>{euro(snap.totals.optionals)}</div>
            </div>
          </div>
        </section>

        {snap.alerts.length > 0 ? (
          <section className={`${styles.card} ${styles.span2}`}>
            <h2 className={styles.cardTitle}>Checks</h2>
            <div className={styles.alertBox}>
              {snap.alerts.slice(0, 12).map((a, i) => (
                <div key={i} className={styles.alertItem}>
                  {a}
                </div>
              ))}
              {snap.alerts.length > 12 ? <div className={styles.muted}>+ {snap.alerts.length - 12} more…</div> : null}
            </div>
          </section>
        ) : null}

        <section className={`${styles.card} ${styles.span2}`}>
          <h2 className={styles.cardTitle}>Breakdown</h2>

          {snap.areas.length === 0 ? (
            <p className={styles.muted}>No rooms yet. Go back to scope to add areas and rooms.</p>
          ) : (
            snap.areas.map((a) => (
              <div key={a.slug} className={styles.areaBlock}>
                <div className={styles.areaHeader}>
                  <div>
                    <div className={styles.areaTitle}>{a.label}</div>
                    <div className={styles.areaSub}>
                      {a.rooms.length} rooms · base {euro(a.base)} · optionals {euro(a.optionals)}
                    </div>
                  </div>
                  <div className={styles.areaTotal}>{euro(a.subtotal)}</div>
                </div>

                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <colgroup>
                      <col className={styles.colRoom} />
                      <col className={styles.colM2} />
                      <col className={styles.colMoney} />
                      <col className={styles.colMoney} />
                      <col className={styles.colMoney} />
                      <col className={styles.colEdit} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th className={styles.th}>Room</th>
                        <th className={styles.thRight}>m²</th>
                        <th className={styles.thRight}>Base</th>
                        <th className={styles.thRight}>Optionals</th>
                        <th className={styles.thRight}>Subtotal</th>
                        <th className={styles.thRight}>Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a.rooms.map((r) => {
                        const key = `${a.slug}:${r.roomIndex}`;
                        const isOpen = !!openOpts[key];
                        const hasOpts = r.optionalsCount > 0;

                        return (
                          <Fragment key={key}>
                            <tr className={r.isMissingM2 ? styles.rowWarn : undefined}>
                              <td className={styles.td}>{r.name}</td>
                              <td className={styles.tdRight}>{r.m2 ? r.m2.toLocaleString("es-ES") : "—"}</td>
                              <td className={styles.tdRight}>{euro(r.base)}</td>

                              <td className={styles.tdRight}>
                                <span className={styles.optMeta}>
                                  {euro(r.optionals)} <span className={styles.muted}>({r.optionalsCount})</span>
                                </span>

                                {hasOpts ? (
                                  <button
                                    type="button"
                                    className={styles.expandBtn}
                                    onClick={() => toggleOptionals(key)}
                                    aria-expanded={isOpen}
                                    aria-label={isOpen ? "Hide optionals" : "Show optionals"}
                                  >
                                    {isOpen ? "−" : "+"}
                                  </button>
                                ) : null}
                              </td>

                              <td className={styles.tdRight}>{euro(r.subtotal)}</td>
                              <td className={styles.tdRight}>
                                {snap.alreadyFinalized ? (
                                  <span className={styles.muted}>—</span>
                                ) : (
                                  <Link className={styles.editLink} href={r.editHref}>
                                    Edit
                                  </Link>
                                )}
                              </td>
                            </tr>

                            {hasOpts ? (
                              <tr hidden={!isOpen} className={isOpen ? styles.optRowOpen : styles.optRowClosed}>
                                <td className={styles.optCell} colSpan={6}>
                                  <div className={styles.optBox} aria-label="Room optionals list">
                                    <div className={styles.optTitle}>Optionals</div>
                                    <ul className={styles.optList}>
                                      {r.optionalsList.map((o, i) => (
                                        <li key={i} className={styles.optItem}>
                                          <span className={styles.optLabel}>{o.category} · {o.label}</span>
                                          <span className={styles.optPrice}>{euro(o.price)}</span>{" "}{snap.alreadyFinalized ? (
                                          <span className={styles.muted}>—</span>
                                        ) : (
                                          <Link className={styles.editLink} href={o.editHref}>Edit</Link>
                                        )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </td>
                              </tr>
                            ) : null}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </section>

        <section className={`${styles.card} ${styles.span2}`}>
          <h2 className={styles.cardTitle}>Next</h2>
          <p className={styles.muted}>If everything looks good, export to PDF or save to dashboard.</p>

          <div className={styles.cardActions}>
            <Link className={styles.secondaryBtn} href={snap.resumeHref || "/select-areas"}>
              Back
            </Link>

            {snap.alreadyFinalized ? (
              <button type="button" className={styles.secondaryBtn} onClick={onDuplicateAndEdit}>
                Duplicate to edit
              </button>
            ) : (
              <Link className={styles.secondaryBtn} href="/select-areas">
                Edit scope
              </Link>
            )}

            <button type="button" className={styles.secondaryBtn} onClick={onExportPdf} aria-label="Export to PDF (Print)">
              Export to PDF
            </button>

            <button
              type="button"
              className={styles.primaryBtn}
              onClick={onSaveAndGoDashboard}
              aria-label="Finalize and go to dashboard"
            >
              {snap.alreadyFinalized ? "Go to dashboard" : "Save to dashboard"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
