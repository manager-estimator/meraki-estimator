"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";
import q from "./QuantityForm.module.css";
import { getAreaRooms, getSelectedAreaLabel, setAreaRooms, type DraftRoom } from "@/lib/estimateDraft";
import { useFinalizedGuard } from "./useFinalizedGuard";

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

function safeDecode(input: string) {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

function titleFromSlug(slug: string) {
  const s = (slug || "").trim();
  if (!s) return "Area";
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function QuantityForm({ slug }: { slug: string }) {
  const router = useRouter();
  useFinalizedGuard();
const safeSlug = useMemo(() => {
    const raw = (slug ?? "").trim();
    const decoded = safeDecode(raw);
    return decoded.replace(/:$/, "").trim();
  }, [slug]);

  const content = useMemo<AreaContent>(() => {
    const fallbackTitle = titleFromSlug(safeSlug);
    return (
      AREAS[safeSlug] ?? {
        title: fallbackTitle,
        description: "",
        scope: "",
      }
    );
  }, [safeSlug]);

  // IMPORTANT: evitar hydration mismatch (SSR vs client) no leyendo storage durante el render.
  // Estado inicial: leemos storage en el initializer (evita setState en useEffect y pasa lint).
  const initialQty = (() => {
    if (!safeSlug) return 1;
    const stored = getAreaRooms(safeSlug);
    return Math.max(1, stored?.length ?? 0);
  })();

  const [qty, setQty] = useState<number>(initialQty);
const handleBack = () => {
    router.push("/select-areas");
  };

  const handleContinue = () => {
    if (!safeSlug) return;

    const label = getSelectedAreaLabel(safeSlug) ?? content.title;
    const displayTitle = label || content.title || titleFromSlug(safeSlug);

    const targetQty = Math.max(1, qty);
    const existing = getAreaRooms(safeSlug);

    const nextRooms: DraftRoom[] = existing.slice(0, targetQty).map((r, i) => ({
      name: r?.name?.trim() ? r.name : `${displayTitle} ${i + 1}`,
      area: typeof r?.area === "number" && r.area > 0 ? r.area : 1,
    }));

    for (let i = nextRooms.length; i < targetQty; i++) {
      nextRooms.push({ name: `${displayTitle} ${i + 1}`, area: 1, optionals: [] });
    }

    setAreaRooms(safeSlug, displayTitle, nextRooms);
    router.push(`/area/${encodeURIComponent(safeSlug)}`);
  };

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
        <button type="button" className={q.actionButton} onClick={handleBack}>
          Back
        </button>

        <button type="button" className={q.actionButton} onClick={handleContinue}>
          Continue
        </button>
      </div>
    </form>
  );
}
