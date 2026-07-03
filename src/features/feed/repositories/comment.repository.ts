import { supabase } from "@/src/shared/lib/supabase";
import type { CommentRow, ProfileRow } from "@/src/shared/types/database.types";

export type PostComment = CommentRow & {
  author: {
    fullName: string;
    username: string;
    avatarUrl: string | null;
  };
};

export type UserCommentActivity = PostComment & {
  post: {
    id: string;
    caption: string;
  } | null;
};

type CommentWithAuthor = CommentRow & {
  profiles?: ProfileRow | null;
};

type CommentWithActivityRelations = CommentRow & {
  profiles?: ProfileRow | null;
  posts?: {
    id: string;
    caption: string;
  } | null;
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

export async function listCommentsByUserId(
  userId: string,
): Promise<UserCommentActivity[]> {
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      profiles (*),
      posts (
        id,
        caption
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const comments = data as CommentWithActivityRelations[];

  return comments.map((comment) => ({
    ...comment,
    author: {
      fullName: comment.profiles?.full_name ?? "ProperRide User",
      username: comment.profiles?.username ?? "properride_user",
      avatarUrl: comment.profiles?.avatar_url ?? null,
    },
    post: comment.posts
      ? {
          id: comment.posts.id,
          caption: comment.posts.caption,
        }
      : null,
  }));
}
