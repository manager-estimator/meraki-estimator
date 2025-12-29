"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./RoomSummaryForm.module.css";
import { getAreaRooms, getNextSelectedAreaSlug, getSelectedAreaLabel, setAreaRooms, type DraftRoomOptional } from "../../lib/estimateDraft";
import { useFinalizedGuard } from "./useFinalizedGuard";

import { unitPriceForSlug } from "@/lib/pricing";
function titleFromSlug(slug: string) {
  if (!slug) return "";
  if (slug === "entrance-circulation") return "Entrance & Circulation";
  const s = slug.replace(/-/g, " ").trim();
  return s.replace(/\b\w/g, (m) => m.toUpperCase());
}

function euro(n: number) {
  return n.toLocaleString("es-ES", { maximumFractionDigits: 0 }) + " €";
}

export default function RoomSummaryForm({
  slug,
  roomIndex,
}: {
  slug: string;
  roomIndex: string;
}) {
  const router = useRouter();
  useFinalizedGuard();

  
  

  const searchParams = useSearchParams();
  const from = searchParams?.get("from");
  const returnTo = searchParams?.get("returnTo") || "/project-summary";
  const isEdit = from === "edit";
  const qs = isEdit ? `?from=edit&returnTo=${encodeURIComponent(returnTo)}` : "";
const safeSlug = (slug ?? "").trim().replace(/:$/, "");
const fallbackLabel = useMemo(() => titleFromSlug(slug), [slug]);
  const areaLabel = getSelectedAreaLabel(safeSlug) ?? fallbackLabel;

  const rooms = getAreaRooms(safeSlug);
  const cur = parseInt(roomIndex, 10) || 1;
  const idx = Math.max(0, cur - 1);

  const room = rooms[idx];
  const roomName = room?.name ?? `${areaLabel} ${cur}`;
  const roomCount = rooms.length > 0 ? rooms.length : 1;

  const roomArea = typeof room?.area === "number" && room.area > 0 ? room.area : 1;
  const base = roomArea * unitPriceForSlug(safeSlug);

  const chosen: DraftRoomOptional[] = Array.isArray(room?.optionals) ? room!.optionals! : [];
  const optionals = chosen.reduce((acc, x) => acc + (typeof x.price === "number" ? x.price : 0), 0);
  const total = base + optionals;

  // Reuse pills: todas las rooms excepto la actual
  const reuseTargets: string[] = [];
  for (let i = 1; i <= roomCount; i++) {
    if (i !== cur) reuseTargets.push(String(i));
  }

const [reuse, setReuse] = useState<Record<string, boolean>>({});
  const toggleReuse = (k: string) => setReuse((prev) => ({ ...prev, [k]: !prev[k] }));

  function applyReuseIfNeeded() {
    const keys = Object.entries(reuse).filter(([, v]) => v).map(([k]) => k);
    if (keys.length === 0) return;

    const curRooms = getAreaRooms(safeSlug);
    const nextRooms = curRooms.map((r, i) => {
      const roomNo = i + 1;
      if (roomNo === cur) return r;
      if (!keys.includes(String(roomNo))) return r;

      const hasAny = Array.isArray(r.optionals) && r.optionals.length > 0;
      // “Apply to other empty rooms” => solo si está vacío
      if (hasAny) return r;

      return { ...r, optionals: chosen.map((o) => ({ ...o })) };
    });

    setAreaRooms(slug, areaLabel, nextRooms);
  }

  const handleContinue = () => {
    
    if (isEdit) {
      router.push(returnTo);
      return;
    }

applyReuseIfNeeded();

    if (cur < roomCount) {
      const nextNo = cur + 1;

      // After reuse, if the next room already has optionals, skip optionals selection step.
      const updatedRooms = getAreaRooms(safeSlug);
      const nextRoom = updatedRooms[nextNo - 1];
      const nextHasOptionals = Array.isArray(nextRoom?.optionals) && nextRoom.optionals.length > 0;

      router.push(
        nextHasOptionals
          ? `/room-summary/${encodeURIComponent(slug)}/${nextNo}`
          : `/optionals/${encodeURIComponent(slug)}/${nextNo}`
      );
      return;
    }
    const nextArea = getNextSelectedAreaSlug(slug);
    if (nextArea) {
      router.push(`/area/${nextArea}`);
      return;
    }
    router.push(`/project-summary`);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.title}>{roomName}</div>
        <div className={styles.subtitle}>Summary · Room {roomIndex}</div>
      </div>

      <div className={styles.main}>
        <div className={styles.bigBox}>
          <div className={styles.bigBoxTitle}>Selected optionals</div>

          <div className={styles.list} role="list">
            {chosen.length === 0 ? (
              <div className={styles.row} role="listitem">
                <div className={styles.rowLabel}>—</div>
                <div className={styles.rowPrice}>—</div>
              </div>
            ) : (
              chosen.map((x) => (
                <div key={`${x.category}:${x.id}`} className={styles.row} role="listitem">
                  <div className={styles.rowLabel}>
                    {x.category} · {x.label}
                  </div>
                  <div className={styles.rowPrice}>{euro(x.price)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.side}>
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

          <div className={styles.reuse}>
            <div className={styles.reuseTitle}>Reuse this setup?</div>
            <div className={styles.reuseHelp}>Apply to other empty rooms in this category.</div>

            <div className={styles.pills}>
              {reuseTargets.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`${styles.pill} ${reuse[k] ? styles.pillOn : ""}`}
                  onClick={() => toggleReuse(k)}
                >
                  {areaLabel} {k}
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
          onClick={() => router.push(`/optionals/${encodeURIComponent(slug)}/${roomIndex}${qs}`)}
        >
          Back
        </button>

        <button type="button" className={styles.continueBtn} onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}
