"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./OptionalsForm.module.css";
import { getAreaRooms, getSelectedAreaLabel, setAreaRooms, type DraftRoomOptional } from "../../lib/estimateDraft";
import { useFinalizedGuard } from "./useFinalizedGuard";

import { unitPriceForSlug } from "@/lib/pricing";
type Opt = {
  id: string;
  label: string;
  price: number;
  image: string;
};

function titleFromSlug(slug: string) {
  if (!slug) return "";
  if (slug === "entrance-circulation") return "Entrance & Circulation";
  const s = slug.replace(/-/g, " ").trim();
  return s.replace(/\b\w/g, (m) => m.toUpperCase());
}

function euro(n: number) {
  return n.toLocaleString("es-ES", { maximumFractionDigits: 0 }) + " €";
}

export default function OptionalsForm({
  slug,
  roomIndex = "1",
}: {
  slug: string;
  roomIndex?: string;
}) {
  const router = useRouter();
  useFinalizedGuard();

  
  

  const searchParams = useSearchParams();
  
  const catRaw = searchParams?.get("cat") || "floorings";
  const category = (catRaw || "floorings").trim();
const from = searchParams?.get("from");
  const isEdit = from === "edit";

  // En modo edit, SIEMPRE volver a Project Summary (estable durante todo el flujo)
  const returnTo = isEdit ? "/project-summary" : (searchParams?.get("returnTo") || "/project-summary");

  // Propagar también cat para que el flujo no pierda contexto al avanzar
  const qs = isEdit ? `?from=edit&returnTo=${encodeURIComponent(returnTo)}&cat=${encodeURIComponent(category)}` : "";
const safeSlug = (slug ?? "").trim().replace(/:$/, "");
const fallbackLabel = useMemo(() => titleFromSlug(slug), [slug]);
  const areaLabel = getSelectedAreaLabel(safeSlug) ?? fallbackLabel;

  const rooms = getAreaRooms(safeSlug);
  const idx = Math.max(0, (parseInt(roomIndex, 10) || 1) - 1);
  const room = rooms[idx];
  const roomName = room?.name ?? `${areaLabel} ${idx + 1}`;
  const roomArea = typeof room?.area === "number" && room.area > 0 ? room.area : 1;

  const options: Opt[] = useMemo(
    () => [
      { id: "resin", label: "Resin", price: 800, image: "/images/optionals/resin.jpg" },
      { id: "stone", label: "Stone", price: 1200, image: "/images/optionals/stone.jpg" },
      { id: "porcelanic", label: "Porcelanic", price: 1000, image: "/images/optionals/porcelanic.jpg" },
      { id: "microcement", label: "Microcement", price: 1100, image: "/images/optionals/microcement.jpg" },
      { id: "parquet", label: "Parquet", price: 900, image: "/images/optionals/parquet.jpg" },
      { id: "solid-surface", label: "Solid Surface", price: 2200, image: "/images/optionals/solid-surface.jpg" },
    ],
    []
  );

  // Leer selección guardada (category = "floorings")
  const saved = room?.optionals?.find((o) => o.category === category);
const [selected, setSelected] = useState<string | null>(saved?.id ?? null);

  const base = roomArea * unitPriceForSlug(safeSlug);
  const optionals = selected ? (options.find((o) => o.id === selected)?.price ?? 0) : 0;
  const total = base + optionals;

  function persist(nextSelected: string | null) {
    const curRooms = getAreaRooms(safeSlug);
    const nextRooms = curRooms.map((r, i) => {
      if (i !== idx) return r;

      const prevOpts = Array.isArray(r.optionals) ? r.optionals : [];
      const withoutThisCategory = prevOpts.filter((o) => o.category !== category);
if (!nextSelected) {
        return { ...r, optionals: withoutThisCategory };
      }

      const opt = options.find((o) => o.id === nextSelected);
      if (!opt) return { ...r, optionals: withoutThisCategory };

      const nextOpt: DraftRoomOptional = { category, id: opt.id, label: opt.label, price: opt.price };
      return { ...r, optionals: [...withoutThisCategory, nextOpt] };
    });

    setAreaRooms(safeSlug, areaLabel, nextRooms);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.title}>{roomName} (Optionals)</div>
        <div className={styles.subtitle}>{category}</div>
      </div>

      <div className={styles.grid}>
        {options.map((opt) => {
          const isSel = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              className={`${styles.card} ${isSel ? styles.cardSelected : ""}`}
              onClick={() => {
                const next = isSel ? null : opt.id;
                setSelected(next);
                persist(next);
              }}
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
          <div>Total of room</div>
        </div>
        <div className={styles.summaryRight}>
          <div>{euro(base)}</div>
          <div>{euro(optionals)}</div>
          <div>{euro(total)}</div>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.backBtn} onClick={() => router.push(isEdit ? returnTo : `/area/${encodeURIComponent(safeSlug)}`)}>
          {isEdit ? "Back to Project" : "Back"}
        </button>

        <button type="button" className={styles.continueBtn} onClick={() => router.push(`/room-summary/${encodeURIComponent(safeSlug)}/${roomIndex}${qs}`)}>
          Continue
        </button>
      </div>
    </div>
  );
}
