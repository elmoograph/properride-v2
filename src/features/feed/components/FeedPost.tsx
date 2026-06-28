import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react-native";
import { Image, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/src/shared/components";
import type { FeedPost as FeedPostType } from "@/src/shared/types/app.types";
import { radius, spacing, theme } from "@/src/shared/theme";
import { RelatedMotorChip } from "./RelatedMotorChip";

type FeedPostProps = {
  post: FeedPostType;
};

export function FeedPost({ post }: FeedPostProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.builderInfo}>
          <Image source={{ uri: post.avatarUrl }} style={styles.avatar} />

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

      <Image source={{ uri: post.imageUrl }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.actions}>
          <View style={styles.leftActions}>
            <Pressable style={styles.actionButton} hitSlop={10}>
              <Heart size={22} color={theme.textPrimary} />
            </Pressable>

            <Pressable style={styles.actionButton} hitSlop={10}>
              <MessageCircle size={22} color={theme.textPrimary} />
            </Pressable>
          </View>

          <Pressable style={styles.actionButton} hitSlop={10}>
            <Bookmark size={22} color={theme.textPrimary} />
          </Pressable>
        </View>

        <AppText variant="bodyMedium">{post.likesCount} suka</AppText>

        <AppText style={styles.caption} numberOfLines={2}>
          <AppText variant="bodyMedium">{post.builderName} </AppText>
          <AppText tone="secondary">{post.caption}</AppText>
        </AppText>

        <AppText variant="caption" tone="muted" style={styles.createdAt}>
          {post.createdAt}
        </AppText>

        <RelatedMotorChip motorcycleName={post.relatedMotorcycleName} />
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: theme.surfaceSoft,
  },
  builderText: {
    flex: 1,
  },
  image: {
    width: "100%",
    aspectRatio: 4 / 5,
    backgroundColor: theme.surfaceSoft,
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
    marginBottom: spacing.md,
  },
});
