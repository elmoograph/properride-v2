export const exploreCategories = [
  "Untukmu",
  "Rider",
  "Motor",
  "Lokasi",
  "Topik",
  "Event",
] as const;

export type ExploreCategory = (typeof exploreCategories)[number];
