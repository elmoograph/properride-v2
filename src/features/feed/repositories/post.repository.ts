import { supabase } from "@/src/shared/lib/supabase";
import type {
  PostMediaRow,
  PostRow,
  ProfileRow,
  Visibility,
} from "@/src/shared/types/database.types";
import type {
  FeedPost,
  MotorcycleType,
  PostMedia,
} from "@/src/shared/types/app.types";

const TEMP_POST_IMAGE_URL =
  "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200";

const DEFAULT_AVATAR_URL =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400";

type PostWithMedia = PostRow & {
  post_media: PostMediaRow[];
};

export type CreatePostPayload = {
  userId: string;
  motorcycleId?: string | null;
  caption: string;
  visibility: Visibility;
  mediaCount?: number;
  mediaUrls?: string[];
};

export async function createPostWithPlaceholderMedia({
  userId,
  motorcycleId = null,
  caption,
  visibility,
  mediaCount = 1,
  mediaUrls,
}: CreatePostPayload): Promise<PostWithMedia> {
  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      user_id: userId,
      motorcycle_id: motorcycleId,
      caption,
      visibility,
      status: "published",
    })
    .select("*")
    .single();

  if (postError) {
    throw postError;
  }

  const mediaSources =
    mediaUrls && mediaUrls.length > 0
      ? mediaUrls
      : Array.from({ length: mediaCount }).map(() => TEMP_POST_IMAGE_URL);

  const mediaRows = mediaSources.map((mediaUrl, index) => ({
    post_id: post.id,
    media_url: mediaUrl,
    media_type: "image" as const,
    order_index: index,
  }));

  const { data: media, error: mediaError } = await supabase
    .from("post_media")
    .insert(mediaRows)
    .select("*")
    .order("order_index", { ascending: true });

  if (mediaError) {
    throw mediaError;
  }

  return {
    ...post,
    post_media: media,
  };
}

export async function listPublicFeedPosts(): Promise<FeedPost[]> {
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      post_media (*)
    `,
    )
    .eq("visibility", "public")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return mapPostsToFeedPosts(posts);
}

export async function listPostsByUserId(userId: string): Promise<FeedPost[]> {
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      post_media (*)
    `,
    )
    .eq("user_id", userId)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return mapPostsToFeedPosts(posts);
}

export async function getPostById(id: string): Promise<FeedPost | null> {
  const { data: post, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      post_media (*)
    `,
    )
    .eq("id", id)
    .neq("status", "deleted")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!post) {
    return null;
  }

  const mappedPosts = await mapPostsToFeedPosts([post]);

  return mappedPosts[0] ?? null;
}

async function mapPostsToFeedPosts(
  posts: PostWithMedia[],
): Promise<FeedPost[]> {
  if (posts.length === 0) {
    return [];
  }

  const userIds = Array.from(new Set(posts.map((post) => post.user_id)));

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", userIds);

  if (profileError) {
    throw profileError;
  }

  const profileMap = new Map<string, ProfileRow>(
    profiles.map((profile) => [profile.id, profile]),
  );

  return posts.map((post) => {
    const profile = profileMap.get(post.user_id);
    const sortedMedia = [...post.post_media].sort(
      (first, second) => first.order_index - second.order_index,
    );

    const media: PostMedia[] = sortedMedia.map((item) => ({
      id: item.id,
      url: item.media_url,
      type: item.media_type,
    }));

    const firstImageUrl = media[0]?.url ?? TEMP_POST_IMAGE_URL;

    return {
      id: post.id,
      userId: post.user_id,
      builderName: profile?.full_name ?? "ProperRide User",
      avatarUrl: profile?.avatar_url ?? DEFAULT_AVATAR_URL,
      location: profile?.location ?? "Indonesia",
      imageUrl: firstImageUrl,
      media,
      caption: post.caption,
      createdAt: formatPostDate(post.created_at),
      likesCount: 0,
      commentsCount: 0,
      relatedMotorcycleName: "",
      relatedMotorcycleId: post.motorcycle_id ?? undefined,
      category: "Daily" satisfies MotorcycleType,
      visibility: post.visibility,
      status: post.status,
    };
  });
}

function formatPostDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}
