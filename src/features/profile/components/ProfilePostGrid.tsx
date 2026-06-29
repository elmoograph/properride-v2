import { Image, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";
import type { FeedPost } from "@/src/shared/types/app.types";
import { router } from "expo-router";

type ProfilePostGridProps = {
  posts: FeedPost[];
};

export function ProfilePostGrid({ posts }: ProfilePostGridProps) {
  if (posts.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <AppText variant="bodyMedium">Belum ada post</AppText>
        <AppText variant="caption" tone="secondary" style={styles.emptyText}>
          Post yang kamu buat akan tampil di sini.
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {posts.map((post) => (
        <Pressable
          key={post.id}
          style={styles.gridItem}
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
  },
  emptyText: {
    marginTop: spacing.xs,
  },
});
