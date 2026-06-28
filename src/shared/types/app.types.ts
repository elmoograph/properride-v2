export type MotorcycleType =
  | "NMAX"
  | "Aerox"
  | "PCX"
  | "Vespa"
  | "Sport"
  | "Daily"
  | "Racing";

export type FeedPost = {
  id: string;
  builderName: string;
  avatarUrl: string;
  location: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  relatedMotorcycleName: string;
  category: MotorcycleType;
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
