export const AREA_UNIT_PRICE: Record<string, number> = {
  "entrance-circulation": 800,
  "living-area": 650,
  "kitchen": 700,
  "dining-area": 600,
  "bedrooms": 600,
  "bathrooms": 500,
  "pantry-laundry-utility": 550,
  "storage": 450,
  "outdoor-living-areas": 500,
  "garden-outdoor-leisure": 400,
  "parking": 350,
  "dressing-room": 550,
  "technical-rooms": 450,
};

export function unitPriceForSlug(slug: string): number {
  const s = (slug ?? "").replace(/:$/, "").trim();
  return AREA_UNIT_PRICE[s] ?? 800;
}
