"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";
import ad from "./AreaDetailsForm.module.css";
import { DraftRoom, getAreaRooms, getSelectedAreaLabel, setAreaRooms } from "../../lib/estimateDraft";
import { useFinalizedGuard } from "./useFinalizedGuard";

import { unitPriceForSlug } from "@/lib/pricing";
type Room = DraftRoom;

function titleFromSlug(slug: string) {
  const s = (slug || "").trim();
  if (!s) return "Area";
  return s
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function euro(n: number) {
  return n.toLocaleString("es-ES", { maximumFractionDigits: 0 }) + " €";
}

function safeDecode(input: string) {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

export default function AreaDetailsForm({ slug }: { slug?: string }) {
  const router = useRouter();
  useFinalizedGuard();
const safeSlug = (() => {
    const raw = (slug ?? "").trim();
    const decoded = safeDecode(raw);
    return decoded.replace(/:$/, "").trim();
  })();

const baseTitle = titleFromSlug(safeSlug);
const displayTitle = safeSlug === "entrance-circulation" ? "Entrance & Circulation" : baseTitle;
  const unitPrice = unitPriceForSlug(safeSlug); // €/m² (por estancia)
  // Init (client): leemos storage en el initializer para arrancar con rooms reales
  // y evitar setState dentro de useEffect (pasa lint y evita pisar qty).
  const [rooms, setRooms] = useState<Room[]>(() => {
    if (!safeSlug) return [];
    const stored = getAreaRooms(safeSlug);
    if (stored && stored.length > 0) return stored;
    return [{ name: `${displayTitle} 1`, area: 1, optionals: [] }];
  });
// Guardar automáticamente cuando cambian rooms (para no perder datos)
  useEffect(() => {
    if (!safeSlug) return;
    if (!rooms || rooms.length === 0) return;

    const label = getSelectedAreaLabel(safeSlug) ?? displayTitle;
    setAreaRooms(safeSlug, label, rooms);
  }, [safeSlug, displayTitle, rooms]);

  const totalArea = useMemo(() => rooms.reduce((acc, r) => acc + r.area, 0), [rooms]);
  const base = totalArea * unitPrice;

  // placeholders (luego conectamos optionals reales)
  const optionals = 0;
  const total = base + optionals;

  const setRoomName = (idx: number, name: string) => {
    setRooms((prev) => prev.map((r, i) => (i === idx ? { ...r, name } : r)));
  };

  const incArea = (idx: number) => {
    setRooms((prev) => prev.map((r, i) => (i === idx ? { ...r, area: r.area + 1 } : r)));
  };

  const decArea = (idx: number) => {
    setRooms((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, area: Math.max(1, r.area - 1) } : r))
    );
  };

  const lessRooms = () => {
    setRooms((prev) => (prev.length <= 1 ? prev : prev.slice(0, -1)));
  };

  const moreRooms = () => {
    setRooms((prev) => {
      const nextIndex = prev.length + 1;
      return [...prev, { name: `${displayTitle} ${nextIndex}`, area: 1, optionals: [] }];
    });
  };

  const handleContinue = () => {
    if (!safeSlug) return;
    // Ya se guarda en el useEffect, pero por claridad lo dejamos “fluido”
    router.push(`/optionals/${encodeURIComponent(safeSlug)}/1`);
  };

  return (
    <form className={ad.form}>
      <div className={ad.headerRow}>
        <h1 className={styles.title}>{displayTitle}</h1>
        <div className={ad.price}>{unitPrice} € / m²</div>
      </div>

      {/* Scroll SOLO aquí (la lista). El resto queda fijo */}
      <div className={ad.roomsScroll} aria-label="Rooms list">
        {rooms.map((room, idx) => (
          <div className={ad.roomBlock} key={`${idx}`}>
            <div className={ad.label}>Name</div>

            <input
              className={ad.nameInput}
              value={room.name}
              placeholder={`${displayTitle} ${idx + 1}`}
              onChange={(e) => setRoomName(idx, e.target.value)}
            />

            <div className={ad.areaRow}>
              <div className={ad.areaLabel}>Approximate floor area (m²)</div>

              <div className={ad.qtyControls} aria-label="Area controls">
                <button
                  type="button"
                  className={ad.qtyBtn}
                  aria-label="Decrease area"
                  onClick={() => decArea(idx)}
                >
                  –
                </button>

                <div className={ad.qtyPill} aria-label="Area value">
                  <span className={ad.qtyValue}>{room.area}</span>
                </div>

                <button
                  type="button"
                  className={ad.qtyBtn}
                  aria-label="Increase area"
                  onClick={() => incArea(idx)}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={ad.moreLessRow}>
        <button
          type="button"
          className={ad.moreLessBtn}
          onClick={lessRooms}
          disabled={rooms.length <= 1}
        >
          Less
        </button>

        <button type="button" className={ad.moreLessBtn} onClick={moreRooms}>
          More
        </button>
      </div>

      <p className={ad.note}>
        Next, you&apos;ll select your options—and you can reuse the same setup for other rooms.
        In the final summary, you can edit, add, or remove rooms.
      </p>

      <div className={ad.summary}>
        <div className={ad.summaryLeft}>
          <div>Base</div>
          <div>Optionals</div>
          <div>Total of project</div>
        </div>

        <div className={ad.summaryRight}>
          <div>{euro(base)}</div>
          <div>{euro(optionals)}</div>
          <div>{euro(total)}</div>
        </div>
      </div>

      <div className={ad.actionsRow}>
        <Link className={ad.actionButton} href={`/quantity/${encodeURIComponent(safeSlug || "")}`}>
          Back
        </Link>

        <button type="button" className={ad.actionButton} onClick={handleContinue}>
          Continue
        </button>
      </div>
    </form>
  );
}
