import {
  Bike,
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppAvatar, AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";
import type { FeedPost as FeedPostType } from "@/src/shared/types/app.types";
import { PostMediaCarousel } from "./PostMediaCarousel";

type FeedPostProps = {
  post: FeedPostType;
  liked?: boolean;
  saved?: boolean;
  updatingLike?: boolean;
  updatingSave?: boolean;
  likesCount?: number;
  onPress?: () => void;
  onPressMotorcycle?: () => void;
  onToggleLike?: () => void;
  onToggleSave?: () => void;
  onShare?: () => void;
};

export function FeedPost({
  post,
  liked = false,
  saved = false,
  updatingLike = false,
  updatingSave = false,
  likesCount = post.likesCount,
  onPress,
  onPressMotorcycle,
  onToggleLike,
  onToggleSave,
  onShare,
}: FeedPostProps) {
  const hasRelatedMotorcycle = Boolean(post.relatedMotorcycleId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.builderInfo}>
          <AppAvatar uri={post.avatarUrl} size="md" />

          <View style={styles.builderText}>
            <AppText variant="bodyMedium" numberOfLines={1}>
              {post.builderName}
            </AppText>
            <AppText variant="caption" tone="secondary" numberOfLines={1}>
              {post.location}
            </AppText>
          </View>
        </View>

        <Pressable hitSlop={12}>
          <MoreHorizontal size={22} color={theme.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.imageWrap}>
        <PostMediaCarousel post={post} onPress={onPress} />

        {hasRelatedMotorcycle ? (
          <Pressable
            style={styles.motorcycleFloatingButton}
            hitSlop={10}
            onPress={onPressMotorcycle}
          >
            <Bike size={16} color={theme.primary} />
            <AppText variant="caption" tone="accent" numberOfLines={1}>
              {post.relatedMotorcycleName || "Lihat Build"}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.content}>
        <View style={styles.actions}>
          <View style={styles.leftActions}>
            <Pressable
              style={[
                styles.actionButton,
                updatingLike && styles.disabledAction,
              ]}
              hitSlop={10}
              disabled={updatingLike}
              onPress={onToggleLike}
            >
              <Heart
                size={22}
                color={liked ? theme.primary : theme.textPrimary}
                fill={liked ? theme.primary : "transparent"}
              />
            </Pressable>

            <Pressable
              style={styles.actionButton}
              hitSlop={10}
              onPress={onPress}
            >
              <MessageCircle size={22} color={theme.textPrimary} />
            </Pressable>

            <Pressable
              style={styles.actionButton}
              hitSlop={10}
              onPress={onShare}
            >
              <Send size={21} color={theme.textPrimary} />
            </Pressable>
          </View>

          <Pressable
            style={[styles.actionButton, updatingSave && styles.disabledAction]}
            hitSlop={10}
            disabled={updatingSave}
            onPress={onToggleSave}
          >
            <Bookmark
              size={22}
              color={saved ? theme.primary : theme.textPrimary}
              fill={saved ? theme.primary : "transparent"}
            />
          </Pressable>
        </View>

        <Pressable onPress={onPress}>
          <View style={styles.metricsRow}>
            <AppText variant="bodyMedium">{likesCount} suka</AppText>

            <AppText variant="caption" tone="secondary">
              {post.commentsCount} komentar
            </AppText>
          </View>

          <AppText style={styles.caption} numberOfLines={2}>
            <AppText variant="bodyMedium">{post.builderName} </AppText>
            <AppText tone="secondary">{post.caption}</AppText>
          </AppText>

          <AppText variant="caption" tone="muted" style={styles.createdAt}>
            {post.createdAt}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderSoft,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  builderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  builderText: {
    flex: 1,
  },
  imageWrap: {
    position: "relative",
    width: "100%",
  },
  motorcycleFloatingButton: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
    maxWidth: 190,
    minHeight: 38,
    borderRadius: radius.pill,
    backgroundColor: "rgba(11, 15, 20, 0.82)",
    borderWidth: 1,
    borderColor: theme.primary,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  actionButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  caption: {
    marginTop: spacing.xs,
  },
  createdAt: {
    marginTop: spacing.xs,
  },
  disabledAction: {
    opacity: 0.55,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});
