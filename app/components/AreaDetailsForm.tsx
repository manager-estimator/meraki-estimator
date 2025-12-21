"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "../page.module.css";
import ad from "./AreaDetailsForm.module.css";

type Room = {
  name: string;
  area: number; // m²
};

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

export default function AreaDetailsForm({ slug }: { slug?: string }) {
  const [nameOverrides, setNameOverrides] = useState<Record<number, string>>({});
  const safeSlug = (() => {
    const raw = (slug ?? "").trim();
    let decoded = raw;
    try {
      decoded = decodeURIComponent(raw);
    } catch {
      // ignore
    }
    return decoded.replace(/:$/, "");
  })();
const title = useMemo(() => titleFromSlug(safeSlug), [safeSlug]);

  // (por ahora fijo como en la maqueta)
  const unitPrice = 800; // €/m²

  const [rooms, setRooms] = useState<Room[]>(() => [
    { name: `${title} 1`, area: 1 },
    { name: `${title} 2`, area: 1 },
    { name: `${title} 3`, area: 1 },
  ]);

  // Si cambias de /area/[slug], resetea defaults con el nuevo título
  useEffect(() => {
    setRooms([
      { name: `${title} 1`, area: 1 },
      { name: `${title} 2`, area: 1 },
      { name: `${title} 3`, area: 1 },
    ]);
  }, [title]);

  const totalArea = useMemo(
    () => rooms.reduce((acc, r) => acc + r.area, 0),
    [rooms]
  );

  const base = totalArea * unitPrice;
  const optionals = 0;
  const total = base + optionals;

  const setRoomName = (idx: number, name: string) => {
    setRooms((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, name } : r))
    );
  };

  const incArea = (idx: number) => {
    setRooms((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, area: r.area + 1 } : r))
    );
  };

  const decArea = (idx: number) => {
    setRooms((prev) =>
      prev.map((r, i) =>
        i === idx ? { ...r, area: Math.max(1, r.area - 1) } : r
      )
    );
  };

  const lessRooms = () => {
    setRooms((prev) => (prev.length <= 1 ? prev : prev.slice(0, -1)));
  };

  const moreRooms = () => {
    setRooms((prev) => {
      const nextIndex = prev.length + 1;
      return [...prev, { name: `${title} ${nextIndex}`, area: 1 }];
    });
  };
  const displayTitle = safeSlug === "entrance-circulation" ? "Entrance & Circulation" : content.title;

  return (
    <form className={ad.form}>
      <div className={ad.headerRow}>
        <h1 className={styles.title}>{title}</h1>
        <div className={ad.price}>{unitPrice} € / m²</div>
      </div>

      {/* Scroll SOLO aquí (la lista). El resto queda fijo */}
      <div className={ad.roomsScroll} aria-label="Rooms list">
        {rooms.map((room, idx) => (
          <div className={ad.roomBlock} key={`${idx}`}>
            <div className={ad.label}>Name</div>

                        <input
              className={ad.nameInput}
              value={nameOverrides[i] ?? ""}
              placeholder={`${displayTitle} ${i + 1}`}}
              onChange={(e) =>
                setNameOverrides((prev) => ({ ...prev, [i]: e.target.value }))
              }
            />

            <div className={ad.areaRow}>
              <div className={ad.areaLabel}>Approximate floor area (m²)</div>

              {/* Subido 5px */}
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
        Next, you'll select your options—and you can reuse the same setup for
        other rooms. In the final summary, you can edit, add, or remove rooms.
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
        <Link className={ad.actionButton} href="/select-areas">
          Back
        </Link>

        <button type="button" className={ad.actionButton}>
          Continue
        </button>
      </div>
    </form>
  );
}
