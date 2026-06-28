export const feedCategories = [
  "All",
  "NMAX",
  "Aerox",
  "PCX",
  "Vespa",
  "Sport",
  "Daily",
  "Racing",
] as const;

export type FeedCategory = (typeof feedCategories)[number];
