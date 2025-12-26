"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";
import sa from "./SelectAreasForm.module.css";
import { setSelectedAreas, type SelectedArea } from "../../lib/estimateDraft";

const AREAS = [
  "Entrance & Circulation",
  "Living Area",
  "Kitchen",
  "Dining Area",
  "Bedrooms",
  "Bathrooms",
  "Pantry, Laundry & Utility",
  "Storage",
  "Outdoor Living Areas",
  "Garden & Outdoor Leisure",
  "Parking",
  "Dressing Room",
  "Technical Rooms",
  "Full Renovation (All them)",
];

const AREA_META = [
  { label: "Entrance & Circulation", slug: "entrance-circulation" },
  { label: "Living Area", slug: "living-area" },
  { label: "Kitchen", slug: "kitchen" },
  { label: "Dining Area", slug: "dining-area" },
  { label: "Bedrooms", slug: "bedrooms" },
  { label: "Bathrooms", slug: "bathrooms" },
  { label: "Pantry, Laundry & Utility", slug: "pantry-laundry-utility" },
  { label: "Storage", slug: "storage" },
  { label: "Outdoor Living Areas", slug: "outdoor-living-areas" },
  { label: "Garden & Outdoor Leisure", slug: "garden-outdoor-leisure" },
  { label: "Parking", slug: "parking" },
  { label: "Dressing Room", slug: "dressing-room" },
  { label: "Technical Rooms", slug: "technical-rooms" },
] as const;

export default function SelectAreasForm() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const mainAreas = useMemo(() => AREAS.slice(0, -1), []);
  const fullRenovation = useMemo(() => AREAS[AREAS.length - 1], []);

  const toggle = (label: string) => {
    setSelected((prev) => {
      if (label === fullRenovation) {
        const allSelected = mainAreas.every((x) => prev.includes(x)) && prev.includes(fullRenovation);
        return allSelected ? [] : [...mainAreas, fullRenovation];
      }

      let next = prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label];

      const allAreasSelected = mainAreas.every((x) => next.includes(x));
      if (allAreasSelected) {
        if (!next.includes(fullRenovation)) next = [...next, fullRenovation];
      } else {
        next = next.filter((x) => x !== fullRenovation);
      }

      return next;
    });
  };

  const hasSelection = selected.length > 0;

  const handleContinue = () => {
    const selectedMain = selected.filter((x) => x !== fullRenovation);

    // preserva el orden del listado “oficial”
    const picked: SelectedArea[] = AREA_META
      .filter((a) => selectedMain.includes(a.label))
      .map((a) => ({ slug: a.slug, label: a.label }));
    if (picked.length === 0) return;

    setSelectedAreas(picked);
    router.push(`/quantity/${encodeURIComponent(picked[0].slug)}`);
  };

  return (
    <form className={styles.authCard}>
      <h1 className={styles.title}>Select areas to estimate</h1>

      <p className={`${styles.socialText} ${sa.leftText}`} style={{ marginTop: 8 }}>
        Choose one or more areas.
      </p>

      <div className={sa.pillsGrid} style={{ marginTop: 22 }}>
        {mainAreas.map((label) => {
          const isOn = selected.includes(label);
          return (
            <button
              key={label}
              type="button"
              className={`${sa.pill} ${isOn ? sa.pillActive : ""}`}
              onClick={() => toggle(label)}
              aria-pressed={isOn}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className={sa.fullRow}>
        <button
          type="button"
          className={`${sa.pill} ${selected.includes(fullRenovation) ? sa.pillActive : ""}`}
          onClick={() => toggle(fullRenovation)}
          aria-pressed={selected.includes(fullRenovation)}
        >
          {fullRenovation}
        </button>
      </div>

      <div className={styles.buttonWrapper} style={{ marginTop: 26 }}>
        <button
          type="button"
          className={styles.continueButton}
          disabled={!hasSelection}
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>

      <div className={sa.backRow}>
        <Link className={sa.backLink} href="/create-profile">
          Back
        </Link>
      </div>
    </form>
  );
}
