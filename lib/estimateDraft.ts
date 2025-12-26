/* eslint-disable @typescript-eslint/no-explicit-any */
export type DraftRoom = {
  name: string;
  area: number; // m²
};

export type SelectedArea = {
  slug: string;
  label: string;
};

type DraftArea = {
  slug: string;
  label: string;
  rooms: DraftRoom[];
};

type EstimateDraft = {
  selectedAreas: SelectedArea[];
  areas: Record<string, DraftArea>;
};

const KEY = "meraki_estimate_draft_v1";

function emptyDraft(): EstimateDraft {
  return { selectedAreas: [], areas: {} };
}

function loadDraft(): EstimateDraft {
  if (typeof window === "undefined") return emptyDraft();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyDraft();
    const parsed = JSON.parse(raw) as Partial<EstimateDraft> | null;

    const d = emptyDraft();
    if (parsed?.selectedAreas && Array.isArray(parsed.selectedAreas)) d.selectedAreas = parsed.selectedAreas as any;
    if (parsed?.areas && typeof parsed.areas === "object") d.areas = parsed.areas as any;
    return d;
  } catch {
    return emptyDraft();
  }
}

function saveDraft(draft: EstimateDraft) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(draft));
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function setSelectedAreas(areas: SelectedArea[]) {
  const draft = loadDraft();
  draft.selectedAreas = areas;

  // asegura que existan en draft.areas con su label
  for (const a of areas) {
    if (!draft.areas[a.slug]) {
      draft.areas[a.slug] = { slug: a.slug, label: a.label, rooms: [] };
    } else {
      draft.areas[a.slug].label = a.label;
    }
  }

  saveDraft(draft);
}

export function getSelectedAreas(): SelectedArea[] {
  return loadDraft().selectedAreas ?? [];
}

export function getSelectedAreaLabel(slug: string): string | null {
  const draft = loadDraft();
  const fromSelected = draft.selectedAreas.find((a) => a.slug === slug)?.label ?? null;
  return fromSelected ?? draft.areas[slug]?.label ?? null;
}

export function getNextSelectedAreaSlug(currentSlug: string): string | null {
  const list = getSelectedAreas();
  const idx = list.findIndex((a) => a.slug === currentSlug);
  if (idx < 0) return list[0]?.slug ?? null;
  return list[idx + 1]?.slug ?? null;
}

export function setAreaRooms(slug: string, label: string, rooms: DraftRoom[]) {
  const draft = loadDraft();
  if (!draft.areas[slug]) {
    draft.areas[slug] = { slug, label, rooms: [] };
  }
  draft.areas[slug].label = label;
  draft.areas[slug].rooms = rooms;
  saveDraft(draft);
}

export function getAreaRooms(slug: string): DraftRoom[] {
  const draft = loadDraft();
  return draft.areas[slug]?.rooms ?? [];
}
