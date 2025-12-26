"use client";

import { useMemo, useState } from "react";
import styles from "../page.module.css";
import q from "./QuantityForm.module.css";

type AreaContent = {
  title: string;
  description: string;
  scope: string;
};

const AREAS: Record<string, AreaContent> = {
  "entrance-circulation": {
    title: "Entrance & Circulation",
    description:
      "First impressions and flow: entry, hallway routes, stairs and vertical connections that shape daily comfort.",
    scope:
      "Entry and circulation ready and safe: protections, small removals, basic wall/ceiling repairs and leveling, functional lighting and standard switches, base painting and sealants. Minor door/trim adjustments and railing check if needed. Final cleaning and waste handling.",
  },
};

export default function QuantityForm({ slug }: { slug: string }) {
  const content = useMemo<AreaContent>(() => {
    return (
      AREAS[slug] ?? {
        title: slug.replace(/-/g, " "),
        description: "",
        scope: "",
      }
    );
  }, [slug]);

  const [qty, setQty] = useState(1);

  return (
    <form className={styles.authCard}>
      <h1 className={styles.title}>{content.title}</h1>

      <p className={q.description}>{content.description}</p>

      <div className={q.qtyRow}>
        <span className={q.qtyLabel}>Quantity of this room/area</span>

        <div className={q.qtyControls}>
          <button
            type="button"
            className={q.qtyBtn}
            aria-label="Decrease quantity"
            onClick={() => setQty((v) => Math.max(1, v - 1))}
          >
            –
          </button>

          <div className={q.qtyPill} aria-label="Quantity">
            <span className={q.qtyValue}>{qty}</span>
          </div>

          <button
            type="button"
            className={q.qtyBtn}
            aria-label="Increase quantity"
            onClick={() => setQty((v) => v + 1)}
          >
            +
          </button>
        </div>
      </div>

      <div className={q.scopeBlock}>
        <div className={q.scopeLabel}>Scope:</div>
        <p className={q.scopeText}>{content.scope}</p>
      </div>

      <div className={q.actionsRow}>
        <button type="button" className={q.actionButton}>
          Back
        </button>

        <button type="button" className={q.actionButton}>
          Continue
        </button>
      </div>
    </form>
  );
}
