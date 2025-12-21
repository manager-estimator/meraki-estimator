"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "../page.module.css";
import sa from "./SelectAreasForm.module.css";

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

export default function SelectAreasForm() {
  const [selected, setSelected] = useState<string[]>([]);

  const mainAreas = useMemo(() => AREAS.slice(0, -1), []);
  const fullRenovation = useMemo(() => AREAS[AREAS.length - 1], []);

  const toggle = (label: string) => {
  setSelected((prev) => {
    // Si clicas Full Renovation => toggle de “seleccionar todo”
    if (label === fullRenovation) {
      const allSelected = mainAreas.every((x) => prev.includes(x)) && prev.includes(fullRenovation);
      return allSelected ? [] : [...mainAreas, fullRenovation];
    }

    // Toggle normal de una píldora individual
    let next = prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label];

    // Si están todas las áreas seleccionadas, activa Full Renovation.
    // Si falta alguna, desactívalo.
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
