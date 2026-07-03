import { router, useFocusEffect } from "expo-router";
import {
  Bookmark,
  ChevronLeft,
  Heart,
  MessageCircle,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import {
  listLikedPostsByUserId,
  listSavedPostsByUserId,
} from "@/src/features/feed/repositories/post.repository";
import {
  listCommentsByUserId,
  type UserCommentActivity,
} from "@/src/features/feed/repositories/comment.repository";
import { AppButton, AppScreen, AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";
import type { FeedPost } from "@/src/shared/types/app.types";

export function ActivityScreen() {
  const { user } = useAuth();

  const [likedPosts, setLikedPosts] = useState<FeedPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<FeedPost[]>([]);
  const [comments, setComments] = useState<UserCommentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadActivity() {
        if (!user) {
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setErrorMessage(null);

          const [liked, saved, userComments] = await Promise.all([
            listLikedPostsByUserId(user.id),
            listSavedPostsByUserId(user.id),
            listCommentsByUserId(user.id),
          ]);

          if (isActive) {
            setLikedPosts(liked);
            setSavedPosts(saved);
            setComments(userComments);
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat aktivitas.";

          if (isActive) {
            setErrorMessage(message);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      loadActivity();

      return () => {
        isActive = false;
      };
    }, [user]),
  );

  if (loading) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.primary} />
          <AppText tone="secondary" style={styles.centerText}>
            Memuat aktivitas...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  if (!user) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <AppText variant="title">Sesi tidak aktif</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            Silakan masuk kembali untuk melihat aktivitas.
          </AppText>
          <AppButton onPress={() => router.replace("/(auth)/login")}>
            Masuk
          </AppButton>
        </View>
      </AppScreen>
    );
  }

  if (errorMessage) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <AppText variant="title">Aktivitas belum bisa dimuat</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            {errorMessage}
          </AppText>
          <AppButton onPress={() => router.replace("/(tabs)/profile")}>
            Kembali ke Profile
          </AppButton>
        </View>
      </AppScreen>
    );
  }

  const totalActivity = likedPosts.length + savedPosts.length + comments.length;

  return (
    <AppScreen scrollable>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color={theme.textPrimary} />
        </Pressable>

        <View style={styles.headerText}>
          <AppText variant="titleLarge">Aktivitas</AppText>
          <AppText tone="secondary" style={styles.subtitle}>
            Ringkasan interaksi kamu di ProperRide.
          </AppText>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <AppText variant="bodyMedium">{totalActivity} aktivitas</AppText>
        <AppText variant="caption" tone="secondary" style={styles.summaryText}>
          Like, simpan, dan komentar yang pernah kamu lakukan.
        </AppText>
      </View>

      <View style={styles.section}>
        <ActivitySectionHeader
          icon={<Heart size={18} color={theme.primary} />}
          title="Post yang kamu sukai"
          count={likedPosts.length}
        />

        {likedPosts.length === 0 ? (
          <EmptyActivity text="Belum ada post yang kamu sukai." />
        ) : (
          likedPosts
            .slice(0, 5)
            .map((post) => (
              <ActivityPostItem
                key={post.id}
                title={post.builderName}
                description={post.caption}
                meta={`${post.likesCount} suka · ${post.commentsCount} komentar`}
                onPress={() => router.push(`/post/${post.id}`)}
              />
            ))
        )}
      </View>

      <View style={styles.section}>
        <ActivitySectionHeader
          icon={<Bookmark size={18} color={theme.primary} />}
          title="Post yang kamu simpan"
          count={savedPosts.length}
        />

        {savedPosts.length === 0 ? (
          <EmptyActivity text="Belum ada post yang kamu simpan." />
        ) : (
          savedPosts
            .slice(0, 5)
            .map((post) => (
              <ActivityPostItem
                key={post.id}
                title={post.builderName}
                description={post.caption}
                meta={`${post.likesCount} suka · ${post.commentsCount} komentar`}
                onPress={() => router.push(`/post/${post.id}`)}
              />
            ))
        )}
      </View>

      <View style={styles.section}>
        <ActivitySectionHeader
          icon={<MessageCircle size={18} color={theme.primary} />}
          title="Komentar kamu"
          count={comments.length}
        />

        {comments.length === 0 ? (
          <EmptyActivity text="Belum ada komentar yang kamu tulis." />
        ) : (
          comments.slice(0, 8).map((comment) => (
            <ActivityPostItem
              key={comment.id}
              title="Kamu berkomentar"
              description={comment.body}
              meta={comment.post?.caption ?? "Post tidak tersedia"}
              onPress={() => {
                if (comment.post?.id) {
                  router.push(`/post/${comment.post.id}`);
                }
              }}
            />
          ))
        )}
      </View>
    </AppScreen>
  );
}

function ActivitySectionHeader({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionIcon}>{icon}</View>
        <AppText variant="title">{title}</AppText>
      </View>

      <AppText variant="caption" tone="muted">
        {count}
      </AppText>
    </View>
  );
}

function ActivityPostItem({
  title,
  description,
  meta,
  onPress,
}: {
  title: string;
  description: string;
  meta: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.activityItem, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.activityText}>
        <AppText variant="bodyMedium" numberOfLines={1}>
          {title}
        </AppText>

        <AppText
          tone="secondary"
          numberOfLines={2}
          style={styles.itemDescription}
        >
          {description}
        </AppText>

        <AppText variant="caption" tone="muted" numberOfLines={1}>
          {meta}
        </AppText>
      </View>
    </Pressable>
  );
}

function EmptyActivity({ text }: { text: string }) {
  return (
    <View style={styles.emptyBox}>
      <AppText variant="caption" tone="secondary">
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  subtitle: {
    marginTop: spacing.xs,
    maxWidth: 320,
  },
  summaryCard: {
    marginTop: spacing.section,
    borderRadius: radius.xl,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.lg,
  },
  summaryText: {
    marginTop: spacing.xs,
  },
  section: {
    marginTop: spacing.section,
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  activityItem: {
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.md,
  },
  activityText: {
    gap: spacing.xs,
  },
  itemDescription: {
    lineHeight: 20,
  },
  emptyBox: {
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.md,
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
  pressed: {
    opacity: 0.82,
  },
});
