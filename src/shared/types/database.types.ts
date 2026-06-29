export type Visibility = "public" | "private";

export type MotorcycleStatus = "in_progress" | "completed" | "on_hold";

export type PostStatus = "published" | "archived" | "deleted";

export type PostMediaType = "image" | "video";

export type TimelineAction =
  | "part_added"
  | "part_removed"
  | "gallery_added"
  | "motorcycle_updated";

export type ProfileRow = {
  id: string;
  full_name: string;
  username: string;
  garage_name: string | null;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type MotorcycleRow = {
  id: string;
  user_id: string;
  name: string | null;
  brand: string;
  model: string;
  year: string;
  engine_cc: number | null;
  engine_info: string | null;
  image_url: string | null;
  status: MotorcycleStatus;
  visibility: Visibility;
  created_at: string;
  updated_at: string;
};

export type MotorcyclePartRow = {
  id: string;
  motorcycle_id: string;
  user_id: string;
  category: string;
  brand: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type MotorcycleGalleryItemRow = {
  id: string;
  motorcycle_id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
};

export type MotorcycleTimelineItemRow = {
  id: string;
  motorcycle_id: string;
  user_id: string;
  action: TimelineAction;
  title: string;
  description: string;
  created_at: string;
};

export type PostRow = {
  id: string;
  user_id: string;
  motorcycle_id: string | null;
  caption: string;
  visibility: Visibility;
  status: PostStatus;
  created_at: string;
  updated_at: string;
};

export type PostMediaRow = {
  id: string;
  post_id: string;
  media_url: string;
  media_type: PostMediaType;
  order_index: number;
  created_at: string;
};

export type PostLikeRow = {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
};

export type PostSaveRow = {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
};

export type CommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  updated_at: string;
};
