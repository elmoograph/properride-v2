import { router, useLocalSearchParams } from "expo-router";
import {
  Bookmark,
  ChevronLeft,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react-native";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/auth/hooks/useAuth";

import {
  AppAvatar,
  AppButton,
  AppInput,
  AppScreen,
  AppText,
} from "@/src/shared/components";
import { getPostById } from "@/src/features/feed/repositories/post.repository";
import { getMotorcycleById } from "@/src/features/garage/repositories/motorcycle.repository";
import {
  getPostInteractionState,
  togglePostLike,
  togglePostSave,
} from "@/src/features/feed/repositories/postInteraction.repository";
import {
  createComment,
  listCommentsByPostId,
  type PostComment,
} from "@/src/features/feed/repositories/comment.repository";
import type { FeedPost } from "@/src/shared/types/app.types";
import type { MotorcycleRow } from "@/src/shared/types/database.types";
import { radius, spacing, theme } from "@/src/shared/theme";
import { PostMediaCarousel } from "@/src/features/feed/components/PostMediaCarousel";

export function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [post, setPost] = useState<FeedPost | null>(null);
  const [relatedMotorcycle, setRelatedMotorcycle] =
    useState<MotorcycleRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [updatingLike, setUpdatingLike] = useState(false);
  const [updatingSave, setUpdatingSave] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPostDetail() {
      if (!id) {
        setLoading(false);
        setErrorMessage("Post tidak ditemukan.");
        return;
      }

      try {
        setLoading(true);
        setErrorMessage(null);

        const postData = await getPostById(id);

        if (!postData) {
          if (isMounted) {
            setPost(null);
            setRelatedMotorcycle(null);
            setErrorMessage("Post tidak ditemukan atau sudah dihapus.");
          }

          return;
        }

        const motorcycleData = postData.relatedMotorcycleId
          ? await getMotorcycleById(postData.relatedMotorcycleId)
          : null;

        const interactionState = user
          ? await getPostInteractionState({
              postId: postData.id,
              userId: user.id,
            })
          : {
              liked: false,
              saved: false,
              likesCount: postData.likesCount,
            };

        const postComments = await listCommentsByPostId(postData.id);

        if (isMounted) {
          setPost(postData);
          setRelatedMotorcycle(motorcycleData);
          setLiked(interactionState.liked);
          setSaved(interactionState.saved);
          setLikesCount(interactionState.likesCount);
          setComments(postComments);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memuat post.";

        if (isMounted) {
          setErrorMessage(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPostDetail();

    return () => {
      isMounted = false;
    };
  }, [id, user]);

  async function handleToggleLike() {
    if (!post) {
      return;
    }

    if (!user) {
      Alert.alert(
        "Sesi tidak aktif",
        "Silakan masuk kembali untuk menyukai post.",
      );
      router.replace("/(auth)/login");
      return;
    }

    try {
      setUpdatingLike(true);

      const nextLiked = await togglePostLike({
        postId: post.id,
        userId: user.id,
        currentlyLiked: liked,
      });

      setLiked(nextLiked);
      setLikesCount((current) => {
        if (nextLiked) {
          return current + 1;
        }

        return Math.max(current - 1, 0);
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memperbarui like.";

      Alert.alert("Gagal memperbarui like", message);
    } finally {
      setUpdatingLike(false);
    }
  }

  async function handleToggleSave() {
    if (!post) {
      return;
    }

    if (!user) {
      Alert.alert(
        "Sesi tidak aktif",
        "Silakan masuk kembali untuk menyimpan post.",
      );
      router.replace("/(auth)/login");
      return;
    }

    try {
      setUpdatingSave(true);

      const nextSaved = await togglePostSave({
        postId: post.id,
        userId: user.id,
        currentlySaved: saved,
      });

      setSaved(nextSaved);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan post.";

      Alert.alert("Gagal menyimpan post", message);
    } finally {
      setUpdatingSave(false);
    }
  }

  async function handleSubmitComment() {
    if (!post) {
      return;
    }

    if (!user) {
      Alert.alert(
        "Sesi tidak aktif",
        "Silakan masuk kembali untuk menulis komentar.",
      );
      router.replace("/(auth)/login");
      return;
    }

    const trimmedBody = commentBody.trim();

    if (!trimmedBody) {
      Alert.alert("Komentar kosong", "Tulis komentar terlebih dahulu.");
      return;
    }

    try {
      setSubmittingComment(true);

      await createComment({
        postId: post.id,
        userId: user.id,
        body: trimmedBody,
      });

      const latestComments = await listCommentsByPostId(post.id);

      setComments(latestComments);
      setPost((currentPost) => {
        if (!currentPost) {
          return currentPost;
        }

        return {
          ...currentPost,
          commentsCount: latestComments.length,
        };
      });
      setCommentBody("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengirim komentar.";

      Alert.alert("Gagal mengirim komentar", message);
    } finally {
      setSubmittingComment(false);
    }
  }

  if (loading) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.primary} />
          <AppText tone="secondary" style={styles.centerText}>
            Memuat detail post...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  if (errorMessage || !post) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <AppText variant="title">Post belum tersedia</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            {errorMessage ?? "Data post belum tersedia."}
          </AppText>
          <AppButton onPress={() => router.replace("/(tabs)/feed")}>
            Kembali ke Feed
          </AppButton>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen scrollable padded={false}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color={theme.textPrimary} />
        </Pressable>

        <View style={styles.headerText}>
          <AppText variant="title">Post Detail</AppText>
          <AppText variant="caption" tone="secondary">
            {post.createdAt}
          </AppText>
        </View>
      </View>

      <PostMediaCarousel post={post} />

      <View style={styles.content}>
        <View style={styles.postInfo}>
          <View style={styles.authorRow}>
            <AppAvatar uri={post.avatarUrl} size="lg" />

            <View style={styles.authorText}>
              <AppText variant="bodyMedium">{post.builderName}</AppText>
              <AppText variant="caption" tone="secondary">
                {post.location} · {post.createdAt}
              </AppText>
            </View>
          </View>

          <AppText style={styles.caption}>{post.caption}</AppText>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.leftActions}>
            <Pressable
              style={[
                styles.actionButton,
                updatingLike && styles.disabledAction,
              ]}
              disabled={updatingLike}
              onPress={handleToggleLike}
            >
              <Heart
                size={22}
                color={liked ? theme.primary : theme.textPrimary}
                fill={liked ? theme.primary : "transparent"}
              />
            </Pressable>

            <Pressable style={styles.actionButton}>
              <MessageCircle size={22} color={theme.textPrimary} />
            </Pressable>

            <Pressable style={styles.actionButton}>
              <Share2 size={22} color={theme.textPrimary} />
            </Pressable>
          </View>

          <Pressable
            style={[styles.actionButton, updatingSave && styles.disabledAction]}
            disabled={updatingSave}
            onPress={handleToggleSave}
          >
            <Bookmark
              size={22}
              color={saved ? theme.primary : theme.textPrimary}
              fill={saved ? theme.primary : "transparent"}
            />
          </Pressable>
        </View>

        <View style={styles.metricsRow}>
          <AppText variant="bodyMedium">{likesCount} likes</AppText>
          <AppText variant="caption" tone="secondary">
            {post.commentsCount} komentar
          </AppText>
        </View>

        {relatedMotorcycle ? (
          <Pressable
            style={styles.relatedMotorcycleBar}
            onPress={() => router.push(`/motorcycle/${relatedMotorcycle.id}`)}
          >
            <View style={styles.relatedMotorcycleText}>
              <AppText variant="caption" tone="secondary">
                Related Motorcycle
              </AppText>
              <AppText variant="bodyMedium" numberOfLines={1}>
                {relatedMotorcycle.brand} {relatedMotorcycle.model}
              </AppText>
            </View>

            <AppText variant="caption" tone="muted">
              Lihat
            </AppText>
          </Pressable>
        ) : null}

        <View style={styles.commentsSection}>
          <View style={styles.commentsHeader}>
            <AppText variant="title">Komentar</AppText>
            <AppText variant="caption" tone="muted">
              {comments.length}
            </AppText>
          </View>

          <View style={styles.commentComposer}>
            <AppInput
              label="Komentar"
              placeholder="Tulis komentar..."
              value={commentBody}
              onChangeText={setCommentBody}
              multiline
              inputStyle={styles.commentInput}
            />

            <AppButton
              onPress={handleSubmitComment}
              disabled={submittingComment}
            >
              {submittingComment ? "Mengirim..." : "Kirim"}
            </AppButton>
          </View>

          <View style={styles.commentList}>
            {comments.length === 0 ? (
              <View style={styles.emptyComments}>
                <AppText variant="bodyMedium">Belum ada komentar</AppText>
                <AppText
                  variant="caption"
                  tone="secondary"
                  style={styles.emptyText}
                >
                  Jadilah yang pertama memberi komentar.
                </AppText>
              </View>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <AppAvatar uri={comment.author.avatarUrl} size="sm" />

                  <View style={styles.commentContent}>
                    <View style={styles.commentMeta}>
                      <AppText variant="bodyMedium" numberOfLines={1}>
                        {comment.author.fullName}
                      </AppText>

                      <AppText variant="caption" tone="muted">
                        {formatCommentDate(comment.created_at)}
                      </AppText>
                    </View>

                    <AppText tone="secondary" style={styles.commentBody}>
                      {comment.body}
                    </AppText>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </View>
    </AppScreen>
  );
}

function formatCommentDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.section,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: theme.background,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.section,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  authorText: {
    flex: 1,
  },
  actionRow: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.borderSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  actionButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  metricsRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  caption: {
    lineHeight: 22,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  centerText: {
    maxWidth: 280,
    textAlign: "center",
  },
  disabledAction: {
    opacity: 0.55,
  },
  commentsSection: {
    marginTop: spacing.section,
    gap: spacing.md,
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  commentComposer: {
    gap: spacing.sm,
  },
  commentInput: {
    minHeight: 72,
  },
  commentList: {
    gap: spacing.md,
  },
  emptyComments: {
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.lg,
    alignItems: "center",
  },
  emptyText: {
    marginTop: spacing.xs,
    textAlign: "center",
  },
  commentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  commentContent: {
    flex: 1,
  },
  commentMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  commentBody: {
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  postInfo: {
    gap: spacing.md,
  },
  relatedMotorcycleBar: {
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  relatedMotorcycleText: {
    flex: 1,
    gap: spacing.xs,
  },
});
