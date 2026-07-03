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
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useEffect, useState } from "react";

import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
} from "@/src/shared/components";
import { getPostById } from "@/src/features/feed/repositories/post.repository";
import { getMotorcycleById } from "@/src/features/garage/repositories/motorcycle.repository";
import type { FeedPost } from "@/src/shared/types/app.types";
import type { MotorcycleRow } from "@/src/shared/types/database.types";
import { radius, spacing, theme } from "@/src/shared/theme";
import { PostMediaCarousel } from "@/src/features/feed/components/PostMediaCarousel";

export function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [post, setPost] = useState<FeedPost | null>(null);
  const [relatedMotorcycle, setRelatedMotorcycle] =
    useState<MotorcycleRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

        if (isMounted) {
          setPost(postData);
          setRelatedMotorcycle(motorcycleData);
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
  }, [id]);

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
        <View style={styles.authorRow}>
          <Image source={{ uri: post.avatarUrl }} style={styles.avatar} />

          <View style={styles.authorText}>
            <AppText variant="bodyMedium">{post.builderName}</AppText>
            <AppText variant="caption" tone="secondary">
              {post.location}
            </AppText>
          </View>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.leftActions}>
            <Pressable style={styles.actionButton}>
              <Heart size={21} color={theme.textPrimary} />
            </Pressable>

            <Pressable style={styles.actionButton}>
              <MessageCircle size={21} color={theme.textPrimary} />
            </Pressable>

            <Pressable style={styles.actionButton}>
              <Share2 size={21} color={theme.textPrimary} />
            </Pressable>
          </View>

          <Pressable style={styles.actionButton}>
            <Bookmark size={21} color={theme.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.metricsRow}>
          <AppText variant="caption" tone="secondary">
            {post.likesCount} likes
          </AppText>

          <AppText variant="caption" tone="secondary">
            {post.commentsCount} komentar
          </AppText>
        </View>

        <AppText style={styles.caption}>{post.caption}</AppText>

        {relatedMotorcycle ? (
          <AppCard style={styles.motorcycleCard}>
            <View style={styles.motorcycleInfo}>
              <AppText variant="caption" tone="secondary">
                Related Motorcycle
              </AppText>

              <AppText variant="bodyMedium" style={styles.motorcycleTitle}>
                {relatedMotorcycle.brand} {relatedMotorcycle.model}
              </AppText>

              <AppText
                variant="caption"
                tone="muted"
                style={styles.motorcycleMeta}
              >
                {relatedMotorcycle.year} ·{" "}
                {relatedMotorcycle.engine_info ??
                  (relatedMotorcycle.engine_cc
                    ? `${relatedMotorcycle.engine_cc} cc`
                    : "Mesin belum diisi")}
              </AppText>
            </View>

            <AppButton
              variant="secondary"
              style={styles.motorcycleButton}
              onPress={() => router.push(`/motorcycle/${relatedMotorcycle.id}`)}
            >
              Lihat Motor
            </AppButton>
          </AppCard>
        ) : null}
      </View>
    </AppScreen>
  );
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
    padding: spacing.lg,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: theme.surfaceSoft,
  },
  authorText: {
    flex: 1,
  },
  actionRow: {
    marginTop: spacing.xl,
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
    marginTop: spacing.md,
  },
  motorcycleCard: {
    marginTop: spacing.section,
    gap: spacing.lg,
  },
  motorcycleInfo: {
    alignItems: "flex-start",
  },
  motorcycleTitle: {
    marginTop: spacing.xs,
  },
  motorcycleMeta: {
    marginTop: spacing.xs,
  },
  motorcycleButton: {
    alignSelf: "flex-start",
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
});
