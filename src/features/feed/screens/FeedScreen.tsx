import { router } from "expo-router";
import { Search, Bell } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import type { FeedCategory } from "@/src/shared/constants/feedCategories";
import { spacing, theme } from "@/src/shared/theme";
import { FeedCategoryChips } from "@/src/features/feed/components/FeedCategoryChips";
import { FeedPost } from "@/src/features/feed/components/FeedPost";

import { AppButton, AppScreen, AppText } from "@/src/shared/components";
import { listPublicFeedPosts } from "@/src/features/feed/repositories/post.repository";
import type { FeedPost as FeedPostType } from "@/src/shared/types/app.types";

export function FeedScreen() {
  const [selectedCategory, setSelectedCategory] = useState<FeedCategory>("All");
  const [posts, setPosts] = useState<FeedPostType[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPosts() {
      try {
        setLoadingPosts(true);
        setPostError(null);

        const data = await listPublicFeedPosts();

        if (isMounted) {
          setPosts(data);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memuat Feed.";

        if (isMounted) {
          setPostError(message);
        }
      } finally {
        if (isMounted) {
          setLoadingPosts(false);
        }
      }
    }

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "All") {
      return posts;
    }

    return posts.filter((post) => post.category === selectedCategory);
  }, [posts, selectedCategory]);

  return (
    <AppScreen scrollable>
      <View style={styles.header}>
        <View>
          <AppText variant="titleLarge">ProperRide</AppText>
          <AppText variant="caption" tone="secondary" style={styles.subtitle}>
            Temukan inspirasi dari rider lain.
          </AppText>
        </View>

        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton} hitSlop={10}>
            <Search size={20} color={theme.textPrimary} />
          </Pressable>

          <Pressable style={styles.iconButton} hitSlop={10}>
            <Bell size={20} color={theme.textPrimary} />
          </Pressable>
        </View>
      </View>

      <FeedCategoryChips
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {loadingPosts ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.primary} />
          <AppText tone="secondary" style={styles.centerText}>
            Memuat Feed...
          </AppText>
        </View>
      ) : null}

      {!loadingPosts && postError ? (
        <View style={styles.centerState}>
          <AppText variant="title">Feed belum bisa dimuat</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            {postError}
          </AppText>
          <AppButton onPress={() => router.replace("/(tabs)/feed")}>
            Muat Ulang
          </AppButton>
        </View>
      ) : null}

      {!loadingPosts && !postError && filteredPosts.length === 0 ? (
        <View style={styles.centerState}>
          <AppText variant="title">Belum ada post</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            Post publik dari rider akan tampil di sini.
          </AppText>
        </View>
      ) : null}

      {!loadingPosts && !postError && filteredPosts.length > 0 ? (
        <View style={styles.feedList}>
          {filteredPosts.map((post) => (
            <FeedPost
              key={post.id}
              post={post}
              onPress={() => router.push(`/post/${post.id}`)}
              onPressMotorcycle={() => {
                if (post.relatedMotorcycleId) {
                  router.push(`/motorcycle/${post.relatedMotorcycleId}`);
                }
              }}
            />
          ))}
        </View>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  feedList: {
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
  centerState: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  centerText: {
    maxWidth: 280,
    textAlign: "center",
  },
});
