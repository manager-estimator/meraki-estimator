"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./RoomSummaryForm.module.css";

type Line = {
  id: string;
  label: string;
  price: number;
};

function titleFromSlug(slug: string) {
  if (!slug) return "";
  if (slug === "entrance-circulation") return "Entrance & Circulation";
  const s = slug.replace(/-/g, " ").trim();
  return s.replace(/\b\w/g, (m) => m.toUpperCase());
}

function euro(n: number) {
  return n.toLocaleString("es-ES") + " €";
}

export default function RoomSummaryForm({
  slug,
  roomIndex,
}: {
  slug: string;
  roomIndex: string;
}) {
  const router = useRouter();
  const title = useMemo(() => titleFromSlug(slug), [slug]);

  // Mock (luego lo conectamos a estado real)
  const base = 16000;
  const chosen: Line[] = useMemo(
    () => [
      { id: "l1", label: "Floorings · Porcelanic", price: 1000 },
      { id: "l2", label: "Walls · Microcement", price: 1100 },
    ],
    []
  );

  const optionals = chosen.reduce((acc, x) => acc + x.price, 0);
  const total = base + optionals;

  // Mock reuse pills (luego lo conectamos a "rooms vacías")
  const reuseTargets = useMemo(() => ["2", "3"], []);
  const [reuse, setReuse] = useState<Record<string, boolean>>({});

  const toggleReuse = (k: string) =>
    setReuse((prev) => ({ ...prev, [k]: !prev[k] }));

  const nextRoomIndex = String((parseInt(roomIndex, 10) || 1) + 1);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        <div className={styles.subtitle}>Summary · Room {roomIndex}</div>
      </div>

      <div className={styles.main}>
        <div className={styles.bigBox}>
          <div className={styles.bigBoxTitle}>Selected optionals</div>

          <div className={styles.list} role="list">
            {chosen.map((x) => (
              <div key={x.id} className={styles.row} role="listitem">
                <div className={styles.rowLabel}>{x.label}</div>
                <div className={styles.rowPrice}>{euro(x.price)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.side}>
          <div className={styles.summary}>
            <div className={styles.summaryLeft}>
              <div>Base</div>
              <div>Optionals</div>
              <div>Total of project</div>
            </div>
            <div className={styles.summaryRight}>
              <div>{euro(base)}</div>
              <div>{euro(optionals)}</div>
              <div>{euro(total)}</div>
            </div>
          </div>

          <div className={styles.reuse}>
            <div className={styles.reuseTitle}>Reuse this setup?</div>
            <div className={styles.reuseHelp}>
              Apply to other empty rooms in this category.
            </div>

            <div className={styles.pills}>
              {reuseTargets.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`${styles.pill} ${reuse[k] ? styles.pillOn : ""}`}
                  onClick={() => toggleReuse(k)}
                >
                  {title} {k}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => router.push(`/optionals/${slug}?roomIndex=${roomIndex}`)}
        >
          Back
        </button>

        <button type="button" className={styles.skipBtn}>
          Skip
        </button>

        <button
          type="button"
          className={styles.continueBtn}
          onClick={() => router.push(`/optionals/${slug}?roomIndex=${nextRoomIndex}`)}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
