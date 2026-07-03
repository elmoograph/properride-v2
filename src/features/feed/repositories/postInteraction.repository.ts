import { supabase } from "@/src/shared/lib/supabase";

export type PostInteractionState = {
  liked: boolean;
  saved: boolean;
  likesCount: number;
};

export async function getPostInteractionState({
  postId,
  userId,
}: {
  postId: string;
  userId: string;
}): Promise<PostInteractionState> {
  const [likeRows, saveRows, likesCountResult] = await Promise.all([
    supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .limit(1),

    supabase
      .from("post_saves")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .limit(1),

    supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId),
  ]);

  if (likeRows.error) {
    throw likeRows.error;
  }

  if (saveRows.error) {
    throw saveRows.error;
  }

  if (likesCountResult.error) {
    throw likesCountResult.error;
  }

  return {
    liked: (likeRows.data?.length ?? 0) > 0,
    saved: (saveRows.data?.length ?? 0) > 0,
    likesCount: likesCountResult.count ?? 0,
  };
}

export async function togglePostLike({
  postId,
  userId,
  currentlyLiked,
}: {
  postId: string;
  userId: string;
  currentlyLiked: boolean;
}) {
  if (currentlyLiked) {
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return false;
  }

  const { error } = await supabase.from("post_likes").insert({
    post_id: postId,
    user_id: userId,
  });

  if (error) {
    throw error;
  }

  return true;
}

export async function togglePostSave({
  postId,
  userId,
  currentlySaved,
}: {
  postId: string;
  userId: string;
  currentlySaved: boolean;
}) {
  if (currentlySaved) {
    const { error } = await supabase
      .from("post_saves")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return false;
  }

  const { error } = await supabase.from("post_saves").insert({
    post_id: postId,
    user_id: userId,
  });

  if (error) {
    throw error;
  }

  return true;
}
