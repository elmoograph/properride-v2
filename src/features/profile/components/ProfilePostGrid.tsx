import { Image, Pressable, StyleSheet, View } from "react-native";
import { ImagePlus } from "lucide-react-native";
import { router } from "expo-router";

import { AppButton, AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";
import type { FeedPost } from "@/src/shared/types/app.types";

type ProfilePostGridProps = {
  posts: FeedPost[];
  canCreatePost?: boolean;
};

export function ProfilePostGrid({
  posts,
  canCreatePost = true,
}: ProfilePostGridProps) {
  if (posts.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIcon}>
          <ImagePlus size={22} color={theme.primary} />
        </View>

        <AppText variant="bodyMedium">Belum ada post</AppText>

        <AppText variant="caption" tone="secondary" style={styles.emptyText}>
          {canCreatePost
            ? "Bagikan foto build, detail modifikasi, atau inspirasi motor pertama kamu ke Feed."
            : "Builder ini belum membagikan post publik."}
        </AppText>

        {canCreatePost ? <AppButton
          variant="secondary"
          style={styles.emptyButton}
          onPress={() => router.push("/create-post")}
        >
          Buat Post
        </AppButton> : null}
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {posts.map((post) => (
        <Pressable
          key={post.id}
          style={({ pressed }) => [styles.gridItem, pressed && styles.pressed]}
          onPress={() => router.push(`/post/${post.id}`)}
        >
          <Image source={{ uri: post.imageUrl }} style={styles.image} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  gridItem: {
    width: "32%",
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: theme.surfaceSoft,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  emptyCard: {
    borderRadius: radius.xl,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.lg,
    alignItems: "flex-start",
  },
  emptyIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyText: {
    marginTop: spacing.xs,
    maxWidth: 300,
    lineHeight: 18,
  },
  emptyButton: {
    marginTop: spacing.lg,
  },
  pressed: {
    opacity: 0.82,
  },
});
