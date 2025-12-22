"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./OptionalsForm.module.css";

type Opt = {
  id: string;
  label: string;
  price: number;
  image: string; // /images/x.jpg
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

export default function OptionalsForm({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomIndex = searchParams.get("roomIndex") ?? "1";
  const title = useMemo(() => titleFromSlug(slug), [slug]);

  const options: Opt[] = useMemo(
    () => [
      { id: "resin", label: "Resin", price: 800, image: "/images/1.jpg" },
      { id: "stone", label: "Stone", price: 1200, image: "/images/2.jpg" },
      { id: "porcelanic", label: "Porcelanic", price: 1000, image: "/images/3.jpg" },
      { id: "microcement", label: "Microcement", price: 1100, image: "/images/4.jpg" },
      { id: "parquet", label: "Parquet", price: 900, image: "/images/5.jpg" },
      { id: "solid-surface", label: "Solid Surface", price: 2200, image: "/images/6.jpg" },
    ],
    []
  );

  const [selected, setSelected] = useState<string | null>(null);

  // Placeholder (luego lo conectamos con el total real)
  const base = 16000;
  const optionals = selected ? (options.find((o) => o.id === selected)?.price ?? 0) : 0;
  const total = base + optionals;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.title}>{title} (Optionals)</div>
        <div className={styles.subtitle}>Floorings</div>
      </div>

      <div className={styles.grid}>
        {options.map((opt) => {
          const isSel = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              className={`${styles.card} ${isSel ? styles.cardSelected : ""}`}
              onClick={() => setSelected(isSel ? null : opt.id)}
            >
              <div
                className={styles.cardImage}
                style={{ backgroundImage: `url(${opt.image})` }}
                aria-hidden="true"
              />
              {isSel ? <div className={styles.check}>✓</div> : null}
              <div className={styles.cardBottom}>
                <div className={styles.cardPrice}>{euro(opt.price)}</div>
                <div className={styles.cardLabel}>{opt.label}</div>
              </div>
            </button>
          );
        })}
      </div>

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

      <div className={styles.actions}>
        <button type="button" className={styles.backBtn} onClick={() => router.push(`/area/${slug}`)}>
          Back
        </button>

        <button type="button" className={styles.skipBtn}>
          Skip
        </button>

        <button type="button" className={styles.continueBtn} onClick={() => router.push(`/room-summary/${slug}/${roomIndex}`)}>
          Continue
        </button>
      </div>
    </div>
  );
}
