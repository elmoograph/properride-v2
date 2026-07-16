export type Visibility = "public" | "private";

export type MotorcycleStatus = "in_progress" | "completed" | "on_hold";

export type PostStatus = "published" | "archived" | "deleted";

export type PostMediaType = "image" | "video";

export type GalleryMediaType = "image" | "video";

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
  onboarding_completed: boolean;
  garage_cover_url: string | null;
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
  archived_at: string | null;
};

export type MotorcyclePartRow = {
  id: string;
  motorcycle_id: string;
  user_id: string;
  category: string;
  brand: string;
  name: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  description: string | null;
};

export type MotorcycleGalleryItemRow = {
  id: string;
  motorcycle_id: string;
  user_id: string;
  image_url: string;
  media_type: GalleryMediaType;
  caption: string | null;
  related_post_id: string | null;
  status: "active" | "archived" | "deleted";
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

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: {
          id: string;
          full_name: string;
          username: string;
          garage_name?: string | null;
          avatar_url?: string | null;
          location?: string | null;
          bio?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ProfileRow, "id" | "created_at">>;
        Relationships: [];
      };
      motorcycles: {
        Row: MotorcycleRow;
        Insert: {
          id?: string;
          user_id: string;
          name?: string | null;
          brand: string;
          model: string;
          year: string;
          engine_cc?: number | null;
          engine_info?: string | null;
          image_url?: string | null;
          status?: MotorcycleStatus;
          visibility?: Visibility;
          created_at?: string;
          updated_at?: string;
          archived_at?: string | null;
        };
        Update: Partial<Omit<MotorcycleRow, "id" | "user_id" | "created_at">>;
        Relationships: [];
      };
      motorcycle_parts: {
        Row: MotorcyclePartRow;
        Insert: {
          id?: string;
          motorcycle_id: string;
          user_id: string;
          category: string;
          brand: string;
          name: string;
          archived_at?: string | null;
          created_at?: string;
          updated_at?: string;
          description?: string | null;
        };
        Update: Partial<
          Omit<
            MotorcyclePartRow,
            "id" | "motorcycle_id" | "user_id" | "created_at"
          >
        >;
        Relationships: [];
      };
      motorcycle_gallery_items: {
        Row: MotorcycleGalleryItemRow;
        Insert: {
          id?: string;
          motorcycle_id: string;
          user_id: string;
          image_url: string;
          caption?: string | null;
          media_type?: GalleryMediaType;
          related_post_id?: string | null;
          status?: "active" | "archived" | "deleted";
          created_at?: string;
        };
        Update: Partial<
          Omit<
            MotorcycleGalleryItemRow,
            "id" | "motorcycle_id" | "user_id" | "created_at"
          >
        >;
        Relationships: [];
      };
      motorcycle_timeline_items: {
        Row: MotorcycleTimelineItemRow;
        Insert: {
          id?: string;
          motorcycle_id: string;
          user_id: string;
          action: TimelineAction;
          title: string;
          description: string;
          created_at?: string;
        };
        Update: Partial<
          Omit<
            MotorcycleTimelineItemRow,
            "id" | "motorcycle_id" | "user_id" | "created_at"
          >
        >;
        Relationships: [];
      };
      posts: {
        Row: PostRow;
        Insert: {
          id?: string;
          user_id: string;
          motorcycle_id?: string | null;
          caption: string;
          visibility?: Visibility;
          status?: PostStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<PostRow, "id" | "user_id" | "created_at">>;
        Relationships: [];
      };
      post_media: {
        Row: PostMediaRow;
        Insert: {
          id?: string;
          post_id: string;
          media_url: string;
          media_type: PostMediaType;
          order_index: number;
          created_at?: string;
        };
        Update: Partial<Omit<PostMediaRow, "id" | "post_id" | "created_at">>;
        Relationships: [];
      };
      post_likes: {
        Row: PostLikeRow;
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      post_saves: {
        Row: PostSaveRow;
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      comments: {
        Row: CommentRow;
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          body: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Omit<CommentRow, "id" | "post_id" | "user_id" | "created_at">
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      visibility: Visibility;
      motorcycle_status: MotorcycleStatus;
      post_status: PostStatus;
      post_media_type: PostMediaType;
      gallery_media_type: GalleryMediaType;
      timeline_action: TimelineAction;
    };
    CompositeTypes: Record<string, never>;
  };
};
