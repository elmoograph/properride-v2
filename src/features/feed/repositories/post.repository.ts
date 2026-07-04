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

type PostWithMedia = PostRow & {
  post_media: PostMediaRow[];
};

type PostLikesCountRow = {
  post_id: string;
};

type PostCommentsCountRow = {
  post_id: string;
};

export type CreatePostPayload = {
  userId: string;
  motorcycleId?: string | null;
  caption: string;
  visibility: Visibility;
  mediaCount?: number;
  mediaUrls?: string[];
};

export async function createPostWithMedia({
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

export async function listSavedPostsByUserId(
  userId: string,
): Promise<FeedPost[]> {
  const { data: savedRows, error: savedError } = await supabase
    .from("post_saves")
    .select("post_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (savedError) {
    throw savedError;
  }

  const postIds = savedRows.map((row) => row.post_id);

  if (postIds.length === 0) {
    return [];
  }

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(
      `
      *,
      post_media (*)
    `,
    )
    .in("id", postIds)
    .neq("status", "deleted");

  if (postsError) {
    throw postsError;
  }

  const mappedPosts = await mapPostsToFeedPosts(posts);

  return postIds
    .map((postId) => mappedPosts.find((post) => post.id === postId))
    .filter((post): post is FeedPost => Boolean(post));
}

export async function listLikedPostsByUserId(
  userId: string,
): Promise<FeedPost[]> {
  const { data: likedRows, error: likedError } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (likedError) {
    throw likedError;
  }

  const postIds = likedRows.map((row) => row.post_id);

  if (postIds.length === 0) {
    return [];
  }

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(
      `
      *,
      post_media (*)
    `,
    )
    .in("id", postIds)
    .neq("status", "deleted");

  if (postsError) {
    throw postsError;
  }

  const mappedPosts = await mapPostsToFeedPosts(posts);

  return postIds
    .map((postId) => mappedPosts.find((post) => post.id === postId))
    .filter((post): post is FeedPost => Boolean(post));
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

  const postIds = posts.map((post) => post.id);

  const { data: likesRows, error: likesError } = await supabase
    .from("post_likes")
    .select("post_id")
    .in("post_id", postIds);

  if (likesError) {
    throw likesError;
  }

  const likesCountMap = new Map<string, number>();

  (likesRows as PostLikesCountRow[]).forEach((row) => {
    likesCountMap.set(row.post_id, (likesCountMap.get(row.post_id) ?? 0) + 1);
  });

  const { data: commentsRows, error: commentsError } = await supabase
    .from("comments")
    .select("post_id")
    .in("post_id", postIds);

  if (commentsError) {
    throw commentsError;
  }

  const commentsCountMap = new Map<string, number>();

  (commentsRows as PostCommentsCountRow[]).forEach((row) => {
    commentsCountMap.set(
      row.post_id,
      (commentsCountMap.get(row.post_id) ?? 0) + 1,
    );
  });

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
      builderName: profile?.username ?? "properride.builder",
      avatarUrl: profile?.avatar_url ?? null,
      location: profile?.location ?? "Indonesia",
      imageUrl: firstImageUrl,
      media,
      caption: post.caption,
      createdAt: formatPostDate(post.created_at),
      likesCount: likesCountMap.get(post.id) ?? 0,
      commentsCount: commentsCountMap.get(post.id) ?? 0,
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
