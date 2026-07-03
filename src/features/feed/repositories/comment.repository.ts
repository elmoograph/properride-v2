import { supabase } from "@/src/shared/lib/supabase";
import type { CommentRow, ProfileRow } from "@/src/shared/types/database.types";

export type PostComment = CommentRow & {
  author: {
    fullName: string;
    username: string;
    avatarUrl: string | null;
  };
};

type CommentWithAuthor = CommentRow & {
  profiles?: ProfileRow | null;
};

export async function listCommentsByPostId(
  postId: string,
): Promise<PostComment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      profiles (*)
    `,
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as CommentWithAuthor[]).map((comment) => ({
    ...comment,
    author: {
      fullName: comment.profiles?.full_name ?? "ProperRide User",
      username: comment.profiles?.username ?? "properride_user",
      avatarUrl: comment.profiles?.avatar_url ?? null,
    },
  }));
}

export async function createComment({
  postId,
  userId,
  body,
}: {
  postId: string;
  userId: string;
  body: string;
}): Promise<CommentRow> {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      user_id: userId,
      body,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
