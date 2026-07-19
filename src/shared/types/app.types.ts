export type MotorcycleType =
  | "NMAX"
  | "Aerox"
  | "PCX"
  | "Vespa"
  | "Sport"
  | "Daily"
  | "Racing";

export type PostMedia = {
  id: string;
  url: string;
  type: "image" | "video";
};

export type FeedPost = {
  id: string;
  userId: string;
  builderName: string;
  avatarUrl: string | null;
  location: string;
  imageUrl: string;
  media?: PostMedia[];
  caption: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  relatedMotorcycleName: string;
  relatedMotorcycleId?: string;
  relatedMotorcycleArchivedAt?: string | null;
  category: MotorcycleType;
  visibility?: "public" | "private";
  status?: "published" | "archived" | "deleted";
};

export type Motorcycle = {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: string;
  imageUrl: string;
  engineInfo: string;
};

export type GalleryItem = {
  id: string;
  imageUrl: string;
};

export type BuilderProfile = {
  builderName: string;
  location: string;
  bio: string;
  avatarUrl: string;
  garageName: string;
};

export type MotorcyclePart = {
  id: string;
  motorcycleId: string;
  category: string;
  brand: string;
  name: string;
};

export type MotorcycleTimelineItem = {
  id: string;
  motorcycleId: string;
  date: string;
  action: "Part ditambahkan" | "Part dilepas" | "Gallery ditambahkan";
  title: string;
  description: string;
};

export type MotorcycleGalleryItem = {
  id: string;
  motorcycleId: string;
  imageUrl: string;
  caption?: string;
};
