export type DraftRoomOptional = {
  category: string; // e.g. "floorings"
  id: string;
  label: string;
  price: number;
};

export type DraftRoom = {
  name: string;
  area: number; // m²
  optionals?: DraftRoomOptional[];
};

export type SelectedArea = {
  slug: string;
  label: string;
};

export type DraftArea = {
  slug: string;
  label: string;
  rooms: DraftRoom[];
};

export type EstimateDraft = {
  selectedAreas: SelectedArea[];
  areas: Record<string, DraftArea>;
};

export type EstimateStatus = "draft" | "finalized";

export type EstimateMeta = {
  id: string;
  title: string;
  status: EstimateStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  resumeHref?: string; // e.g. "/select-areas" (más adelante lo afinamos)
  finalizedAt?: string; // ISO
  total?: string; // placeholder: "€ 12,450"
};

// Legacy single-draft key (mantenemos compatibilidad)
const KEY = "meraki_estimate_draft_v1";

// Nuevo: múltiples estimates
const INDEX_KEY = "meraki_estimates_index_v1"; // EstimateMeta[]
const ACTIVE_KEY = "meraki_active_estimate_v1"; // estimateId

export const ESTIMATES_EVENT = "meraki_estimates_change";

function emitEstimatesChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ESTIMATES_EVENT));
}


function normalizeSlug(s: string): string {
  return s.replace(/:$/, "");
}

function emptyDraft(): EstimateDraft {
  return { selectedAreas: [], areas: {} };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isDraftEmpty(d: EstimateDraft): boolean {
  return (d.selectedAreas?.length ?? 0) === 0 && Object.keys(d.areas ?? {}).length === 0;
}

function draftKeyFor(id: string): string {
  return `${KEY}:${id}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function genId(): string {
  const a = Date.now().toString(36);
  const b = Math.random().toString(36).slice(2, 8);
  return `est_${a}_${b}`;
}

function coerceSelectedArea(v: unknown): SelectedArea | null {
  if (!isRecord(v)) return null;
  const slug = typeof v["slug"] === "string" ? normalizeSlug(v["slug"]) : null;
  const label = typeof v["label"] === "string" ? (v["label"] as string) : null;
  if (!slug || !label) return null;
  return { slug, label };
}

function coerceDraftRoom(v: unknown): DraftRoom | null {
  if (!isRecord(v)) return null;

  const name = typeof v["name"] === "string" ? (v["name"] as string) : null;
  const area = typeof v["area"] === "number" && Number.isFinite(v["area"]) ? (v["area"] as number) : null;
  if (!name || area === null) return null;

  const optRaw = v["optionals"];
  const optionals: DraftRoomOptional[] = Array.isArray(optRaw)
    ? optRaw
        .filter(isRecord)
        .map((o) => {
          const category = typeof o["category"] === "string" ? (o["category"] as string) : null;
          const id = typeof o["id"] === "string" ? (o["id"] as string) : null;
          const label = typeof o["label"] === "string" ? (o["label"] as string) : null;
          const price = typeof o["price"] === "number" && Number.isFinite(o["price"]) ? (o["price"] as number) : null;
          if (!category || !id || !label || price === null) return null;
          return { category, id, label, price };
        })
        .filter((x): x is DraftRoomOptional => x !== null)
    : [];

  return optionals.length > 0 ? { name, area, optionals } : { name, area };
}


function coerceDraftArea(v: unknown): DraftArea | null {
  if (!isRecord(v)) return null;
  const slug = typeof v["slug"] === "string" ? normalizeSlug(v["slug"]) : null;
  const label = typeof v["label"] === "string" ? (v["label"] as string) : null;
  if (!slug || !label) return null;

  const roomsRaw = v["rooms"];
  const rooms: DraftRoom[] = Array.isArray(roomsRaw)
    ? roomsRaw.map(coerceDraftRoom).filter((x): x is DraftRoom => x !== null)
    : [];

  return { slug, label, rooms };
}

function loadIndex(): EstimateMeta[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    const out: EstimateMeta[] = [];
    for (const it of parsed) {
      if (!isRecord(it)) continue;

      const id = typeof it["id"] === "string" ? (it["id"] as string) : null;
      const title = typeof it["title"] === "string" ? (it["title"] as string) : null;
      const status: EstimateStatus = it["status"] === "finalized" ? "finalized" : "draft";
      const createdAt = typeof it["createdAt"] === "string" ? (it["createdAt"] as string) : null;
      const updatedAt = typeof it["updatedAt"] === "string" ? (it["updatedAt"] as string) : null;

      if (!id || !title || !createdAt || !updatedAt) continue;

      const resumeHref = typeof it["resumeHref"] === "string" ? (it["resumeHref"] as string) : undefined;
      const finalizedAt = typeof it["finalizedAt"] === "string" ? (it["finalizedAt"] as string) : undefined;
      const total = typeof it["total"] === "string" ? (it["total"] as string) : undefined;

      out.push({ id, title, status, createdAt, updatedAt, resumeHref, finalizedAt, total });
    }
    return out;
  } catch {
    return [];
  }
}

function saveIndex(list: EstimateMeta[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INDEX_KEY, JSON.stringify(list));
  emitEstimatesChange();
}


function removeMeta(id: string) {
  const list = loadIndex().filter((x) => x.id !== id);
  saveIndex(list);
}

function touchMeta(id: string, patch?: { resumeHref?: string; total?: string; status?: EstimateStatus; finalizedAt?: string }) {
  const list = loadIndex();
  const idx = list.findIndex((x) => x.id === id);

  // Auto-heal: si el active id existe pero no hay meta en el índice, lo creamos
  if (idx < 0) {
    const now = nowIso();
    list.unshift({
      id,
      title: "Estimate",
      status: "draft",
      createdAt: now,
      updatedAt: now,
      resumeHref: "/select-areas",
    });
    saveIndex(list);
  }

  const idx2 = list.findIndex((x) => x.id === id);
  if (idx2 < 0) return;

  const prev = list[idx2];
  const next: EstimateMeta = {
    ...prev,
    updatedAt: nowIso(),
    ...(patch?.resumeHref ? { resumeHref: patch.resumeHref } : {}),
    ...(patch?.total ? { total: patch.total } : {}),
    ...(patch?.status ? { status: patch.status } : {}),
    ...(patch?.finalizedAt ? { finalizedAt: patch.finalizedAt } : {}),
  };

  list[idx2] = next;
  saveIndex(list);
}

export function listEstimates(): EstimateMeta[] {
  return loadIndex().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getActiveEstimateId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_KEY);
}

export function setActiveEstimateId(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_KEY, id);
  emitEstimatesChange();
}

function ensureActiveEstimateId(): string | null {

  const active = getActiveEstimateId();
  if (active) return active;

  const list = listEstimates();
  if (list[0]?.id) {
    setActiveEstimateId(list[0].id);
    return list[0].id;
  }

  // Si no hay index pero hay legacy, migramos abajo en loadDraft()
  return null;
}

function loadDraftByKey(storageKey: string): EstimateDraft {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return emptyDraft();
    const parsed = JSON.parse(raw) as Partial<EstimateDraft> | null;

    const d = emptyDraft();

    if (Array.isArray(parsed?.selectedAreas)) {
      d.selectedAreas = parsed.selectedAreas.map(coerceSelectedArea).filter((x): x is SelectedArea => x !== null);
    }

    if (isRecord(parsed?.areas)) {
      for (const [key, value] of Object.entries(parsed.areas)) {
        const area = coerceDraftArea(value);
        if (!area) continue;
        const k = normalizeSlug(key);
        d.areas[k] = { ...area, slug: k };
      }
    }

    return d;
  } catch {
    return emptyDraft();
  }
}

function saveDraftByKey(storageKey: string, draft: EstimateDraft) {
  window.localStorage.setItem(storageKey, JSON.stringify(draft));
  emitEstimatesChange();
}

function migrateLegacyIfNeeded(): string | null {

  // Caso: hay draft legacy pero aún no hay index/active.
  const legacyRaw = window.localStorage.getItem(KEY);
  if (!legacyRaw) return null;

  const legacy = loadDraftByKey(KEY);
  if (isDraftEmpty(legacy)) {
    // Legacy vacío -> lo eliminamos para no “ensuciar”
    window.localStorage.removeItem(KEY);
    emitEstimatesChange();
    return null;
  }

  // Creamos estimate nuevo e importamos
  const meta = createEstimate({ title: "Imported estimate" });
  saveDraftByKey(draftKeyFor(meta.id), legacy);
  window.localStorage.removeItem(KEY);
  emitEstimatesChange();
  touchMeta(meta.id, { resumeHref: "/select-areas" });
  return meta.id;
}


const MRK_COUNTER_KEY = "meraki:estimateCounter";

function nextEstimateNumber(existing: EstimateMeta[]): number {
  if (typeof window === "undefined") return 1;

  const ls = window.localStorage;
  const raw = ls.getItem(MRK_COUNTER_KEY);
  let cur = Number.parseInt(raw || "", 10);

  if (!Number.isFinite(cur) || cur < 0) {
    // Si no hay contador, lo inferimos del máximo MRKxx existente para evitar duplicados.
    cur = 0;
    for (const m of existing || []) {
      const t = m.title;
      if (typeof t !== "string") continue;
      const mt = /MRK\s*0*([0-9]+)/i.exec(t);
      if (!mt) continue;
      const v = Number.parseInt(mt[1], 10);
      if (Number.isFinite(v)) cur = Math.max(cur, v);
    }
  }

  const next = cur + 1;
  ls.setItem(MRK_COUNTER_KEY, String(next));
  return next;
}

function buildDefaultEstimateTitle(existing: EstimateMeta[]): string {
  const dateStr = new Date().toLocaleDateString("es-ES");
  const n = nextEstimateNumber(existing);
  const code = `MRK${String(n).padStart(2, "0")}`;
  return `${code} Estimate (${dateStr})`;
}

export function createEstimate(opts?: { title?: string }): EstimateMeta {
  if (typeof window === "undefined") {
    // En SSR no creamos nada; devolvemos un placeholder
    const iso = nowIso();
    return { id: "ssr", title: opts?.title ?? "Estimate", status: "draft", createdAt: iso, updatedAt: iso };
  }

  const iso = nowIso();
  const id = genId();
  const title = opts?.title ?? buildDefaultEstimateTitle(listEstimates());
  const meta: EstimateMeta = {
    id,
    title,
    status: "draft",
    createdAt: iso,
    updatedAt: iso,
    resumeHref: "/select-areas",
  };

  const list = loadIndex();
  list.unshift(meta);
  saveIndex(list);

  setActiveEstimateId(id);
  saveDraftByKey(draftKeyFor(id), emptyDraft());
  return meta;
}

export function deleteEstimate(id: string) {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(draftKeyFor(id));
  emitEstimatesChange();
  removeMeta(id);

  const active = getActiveEstimateId();
  if (active === id) {
    const next = listEstimates()[0]?.id ?? null;
    if (next) setActiveEstimateId(next);
    else window.localStorage.removeItem(ACTIVE_KEY);
    emitEstimatesChange();
  }
}

export function setEstimateTitle(id: string, title: string) {
  if (isEstimateFinalized(id)) return;
  const list = loadIndex();
  const idx = list.findIndex((x) => x.id === id);
  if (idx < 0) return;
  list[idx] = { ...list[idx], title, updatedAt: nowIso() };
  saveIndex(list);
}

export function setEstimateResumeHref(href: string) {
  if (typeof window === "undefined") return;
  const id = getActiveId();
  if (!id) return;
  touchMeta(id, { resumeHref: href });
}

export function finalizeActiveEstimate(patch?: { total?: string }) {
  if (typeof window === "undefined") return;
  const id = getActiveId();
  if (!id) return;
  if (isEstimateFinalized(id)) return;
  touchMeta(id, { status: "finalized", finalizedAt: nowIso(), total: patch?.total });
}


function getActiveId(): string | null {
  return ensureActiveEstimateId() ?? migrateLegacyIfNeeded() ?? ensureActiveEstimateId();
}

function isEstimateFinalized(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return listEstimates().find((e) => e.id === id)?.status === "finalized";
  } catch {
    return false;
  }
}

export function isActiveEstimateFinalized(): boolean {
  const id = getActiveId();
  return id ? isEstimateFinalized(id) : false;
}

function loadDraft(): EstimateDraft {
  if (typeof window === "undefined") return emptyDraft();

  const active = getActiveId();

  if (active) {
    const k = draftKeyFor(active);
    // Si existe meta pero no draft, inicializamos
    if (!window.localStorage.getItem(k)) {
      // No creamos draft para estimates finalizados (solo lectura)
      if (isEstimateFinalized(active)) return emptyDraft();
      saveDraftByKey(k, emptyDraft());
    }
    return loadDraftByKey(k);
  }

  // fallback: legacy (por si acaso)
  return loadDraftByKey(KEY);
}

function saveDraft(draft: EstimateDraft) {
  if (typeof window === "undefined") return;

  const active = getActiveId();
  if (active) {
    if (isEstimateFinalized(active)) return;
    saveDraftByKey(draftKeyFor(active), draft);
    touchMeta(active); // actualiza updatedAt
    return;
  }

  // fallback legacy
  saveDraftByKey(KEY, draft);
}

export function clearDraft() {
  if (typeof window === "undefined") return;

  const active = getActiveId();
  if (active) {
    if (isEstimateFinalized(active)) return;
    saveDraftByKey(draftKeyFor(active), emptyDraft());
    touchMeta(active, { resumeHref: "/select-areas" });
    return;
  }

  window.localStorage.removeItem(KEY);
  emitEstimatesChange();
}

export function setSelectedAreas(areas: SelectedArea[]) {
  const active = getActiveId();
  if (active && isEstimateFinalized(active)) return;
  const draft = loadDraft();

  const normalized = areas.map((a) => ({ ...a, slug: normalizeSlug(a.slug) }));
  draft.selectedAreas = normalized;

  for (const a of normalized) {
    const slug = a.slug;

    // Migración defensiva de clave antigua con ":"
    const legacyKey = `${slug}:`;
    if (!draft.areas[slug] && draft.areas[legacyKey]) {
      draft.areas[slug] = { ...draft.areas[legacyKey], slug };
      delete draft.areas[legacyKey];
    }

    if (!draft.areas[slug]) {
      draft.areas[slug] = { slug, label: a.label, rooms: [] };
    } else {
      draft.areas[slug].label = a.label;
    }
  }

  saveDraft(draft);
  setEstimateResumeHref("/quantity/" + (normalized[0]?.slug ?? "")); // hint suave (opcional)
}

export function getSelectedAreas(): SelectedArea[] {
  return loadDraft().selectedAreas ?? [];
}

export function getSelectedAreaLabel(slug: string): string | null {
  const s = normalizeSlug(slug);
  const draft = loadDraft();
  const fromSelected = draft.selectedAreas.find((a) => a.slug === s)?.label ?? null;
  return fromSelected ?? draft.areas[s]?.label ?? null;
}

export function getNextSelectedAreaSlug(currentSlug: string): string | null {
  const s = normalizeSlug(currentSlug);
  const list = getSelectedAreas();
  const idx = list.findIndex((a) => a.slug === s);
  if (idx < 0) return list[0]?.slug ?? null;
  return list[idx + 1]?.slug ?? null;
}

export function setAreaRooms(slug: string, label: string, rooms: DraftRoom[]) {
  const active = getActiveId();
  if (active && isEstimateFinalized(active)) return;
  const s = normalizeSlug(slug);
  const draft = loadDraft();
  if (!draft.areas[s]) {
    draft.areas[s] = { slug: s, label, rooms: [] };
  }
  draft.areas[s].label = label;
  draft.areas[s].rooms = rooms;
  saveDraft(draft);
  setEstimateResumeHref(`/quantity/${s}`);
}

export function getAreaRooms(slug: string): DraftRoom[] {
  const s = normalizeSlug(slug);
  const draft = loadDraft();
  return draft.areas[s]?.rooms ?? [];
}


// Snapshot del draft activo (para cálculos en UI). En SSR devuelve draft vacío.
export function getActiveDraftSnapshot(): EstimateDraft {
  return (typeof window === "undefined") ? { selectedAreas: [], areas: {} } : (loadDraft() as EstimateDraft);
}
