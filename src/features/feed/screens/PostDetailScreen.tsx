import { router, useLocalSearchParams } from "expo-router";
import {
  Bookmark,
  ChevronLeft,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react-native";
import { Image, Pressable, StyleSheet, View } from "react-native";

import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
} from "@/src/shared/components";
import { feedPosts, motorcycles } from "@/src/shared/constants/mockData";
import { radius, spacing, theme } from "@/src/shared/theme";

export function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const post = feedPosts.find((item) => item.id === id) ?? feedPosts[0];

  const relatedMotorcycle = motorcycles.find(
    (motorcycle) => motorcycle.id === post.relatedMotorcycleId,
  );

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

      <Image source={{ uri: post.imageUrl }} style={styles.postImage} />

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
                {relatedMotorcycle.year} · {relatedMotorcycle.engineInfo}
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
  postImage: {
    width: "100%",
    aspectRatio: 4 / 5,
    backgroundColor: theme.surfaceSoft,
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
});
