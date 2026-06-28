import type {
  BuilderProfile,
  FeedPost,
  GalleryItem,
  Motorcycle,
} from "@/src/shared/types/app.types";

export const builderProfile: BuilderProfile = {
  builderName: "Ryan Pratama",
  location: "Yogyakarta, Indonesia",
  bio: "Rider harian. Pecinta detail. Pemburu senja.",
  avatarUrl:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400",
  garageName: "Ryan Pratama Garage",
};

export const motorcycles: Motorcycle[] = [
  {
    id: "motorcycle-1",
    name: "NMAX Atlas",
    brand: "Yamaha",
    model: "NMAX",
    year: "2023",
    engineInfo: "155cc",
    imageUrl:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=900",
  },
  {
    id: "motorcycle-2",
    name: "Aerox 155",
    brand: "Yamaha",
    model: "Aerox",
    year: "2022",
    engineInfo: "155cc",
    imageUrl:
      "https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=900",
  },
];

export const galleryItems: GalleryItem[] = [
  {
    id: "gallery-1",
    imageUrl:
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=600",
  },
  {
    id: "gallery-2",
    imageUrl:
      "https://images.unsplash.com/photo-1558981852-426c6c22a060?q=80&w=600",
  },
  {
    id: "gallery-3",
    imageUrl:
      "https://images.unsplash.com/photo-1558981359-219d6364c9c8?q=80&w=600",
  },
];

export const feedPosts: FeedPost[] = [
  {
    id: "post-1",
    builderName: "Ryan Pratama",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400",
    location: "Yogyakarta, Indonesia",
    imageUrl:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200",
    caption:
      "Hujan bukan alasan buat nggak ride. Nikmati prosesnya, hargai hasilnya.",
    createdAt: "2 jam yang lalu",
    likesCount: 512,
    commentsCount: 24,
    relatedMotorcycleName: "NMAX Atlas",
    category: "NMAX",
  },
  {
    id: "post-2",
    builderName: "Dimas Wicaksono",
    avatarUrl:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400",
    location: "Bandung, Indonesia",
    imageUrl:
      "https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=1200",
    caption:
      "Setup harian yang tetap nyaman dipakai, tapi punya karakter sendiri.",
    createdAt: "5 jam yang lalu",
    likesCount: 288,
    commentsCount: 13,
    relatedMotorcycleName: "Aerox Blue",
    category: "Aerox",
  },
  {
    id: "post-3",
    builderName: "Andra Garage",
    avatarUrl:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400",
    location: "Jakarta, Indonesia",
    imageUrl:
      "https://images.unsplash.com/photo-1558981033-0f0309284409?q=80&w=1200",
    caption: "Detail kecil kadang bikin motor terasa jauh lebih personal.",
    createdAt: "1 hari yang lalu",
    likesCount: 164,
    commentsCount: 8,
    relatedMotorcycleName: "PCX Daily",
    category: "PCX",
  },
];

export const explorePosts = [
  ...feedPosts,
  {
    id: "explore-1",
    imageUrl:
      "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?q=80&w=900",
    builderName: "Satria Build",
    location: "Bali, Indonesia",
  },
  {
    id: "explore-2",
    imageUrl:
      "https://images.unsplash.com/photo-1558981001-79274e04f1bf?q=80&w=900",
    builderName: "Reza Motor",
    location: "Surabaya, Indonesia",
  },
];
