import { router, useFocusEffect } from "expo-router";
import { Search, Bell } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import type { FeedCategory } from "@/src/shared/constants/feedCategories";
import { spacing, theme } from "@/src/shared/theme";
import { FeedCategoryChips } from "@/src/features/feed/components/FeedCategoryChips";
import { FeedPost } from "@/src/features/feed/components/FeedPost";

import { AppButton, AppScreen, AppText } from "@/src/shared/components";
import { listPublicFeedPosts } from "@/src/features/feed/repositories/post.repository";
import {
  getPostInteractionState,
  togglePostLike,
  togglePostSave,
  type PostInteractionState,
} from "@/src/features/feed/repositories/postInteraction.repository";
import type { FeedPost as FeedPostType } from "@/src/shared/types/app.types";

type FeedInteractionMap = Record<string, PostInteractionState>;

type FeedUpdatingMap = Record<string, boolean>;

export function FeedScreen() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<FeedCategory>("All");
  const [posts, setPosts] = useState<FeedPostType[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);
  const [interactionMap, setInteractionMap] = useState<FeedInteractionMap>({});
  const [updatingLikeMap, setUpdatingLikeMap] = useState<FeedUpdatingMap>({});
  const [updatingSaveMap, setUpdatingSaveMap] = useState<FeedUpdatingMap>({});

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadPosts() {
        try {
          setLoadingPosts(true);
          setPostError(null);

          const data = await listPublicFeedPosts();
          const interactions = user
            ? await Promise.all(
                data.map(async (post) => {
                  const state = await getPostInteractionState({
                    postId: post.id,
                    userId: user.id,
                  });

                  return [post.id, state] as const;
                }),
              )
            : [];

          const nextInteractionMap = Object.fromEntries(interactions);

          if (isActive) {
            setPosts(data);
            setInteractionMap(nextInteractionMap);
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat Feed.";

          if (isActive) {
            setPostError(message);
          }
        } finally {
          if (isActive) {
            setLoadingPosts(false);
          }
        }
      }

      loadPosts();

      return () => {
        isActive = false;
      };
    }, [user]),
  );

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "All") {
      return posts;
    }

    return posts.filter((post) => post.category === selectedCategory);
  }, [posts, selectedCategory]);

  async function handleToggleLike(post: FeedPostType) {
    if (!user) {
      Alert.alert(
        "Sesi tidak aktif",
        "Silakan masuk kembali untuk menyukai post.",
      );
      router.replace("/(auth)/login");
      return;
    }

    const currentInteraction = interactionMap[post.id] ?? {
      liked: false,
      saved: false,
      likesCount: post.likesCount,
    };

    try {
      setUpdatingLikeMap((current) => ({
        ...current,
        [post.id]: true,
      }));

      const nextLiked = await togglePostLike({
        postId: post.id,
        userId: user.id,
        currentlyLiked: currentInteraction.liked,
      });

      setInteractionMap((current) => {
        const previous = current[post.id] ?? currentInteraction;

        return {
          ...current,
          [post.id]: {
            ...previous,
            liked: nextLiked,
            likesCount: nextLiked
              ? previous.likesCount + 1
              : Math.max(previous.likesCount - 1, 0),
          },
        };
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memperbarui like.";

      Alert.alert("Gagal memperbarui like", message);
    } finally {
      setUpdatingLikeMap((current) => ({
        ...current,
        [post.id]: false,
      }));
    }
  }

  async function handleToggleSave(post: FeedPostType) {
    if (!user) {
      Alert.alert(
        "Sesi tidak aktif",
        "Silakan masuk kembali untuk menyimpan post.",
      );
      router.replace("/(auth)/login");
      return;
    }

    const currentInteraction = interactionMap[post.id] ?? {
      liked: false,
      saved: false,
      likesCount: post.likesCount,
    };

    try {
      setUpdatingSaveMap((current) => ({
        ...current,
        [post.id]: true,
      }));

      const nextSaved = await togglePostSave({
        postId: post.id,
        userId: user.id,
        currentlySaved: currentInteraction.saved,
      });

      setInteractionMap((current) => {
        const previous = current[post.id] ?? currentInteraction;

        return {
          ...current,
          [post.id]: {
            ...previous,
            saved: nextSaved,
          },
        };
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan post.";

      Alert.alert("Gagal menyimpan post", message);
    } finally {
      setUpdatingSaveMap((current) => ({
        ...current,
        [post.id]: false,
      }));
    }
  }

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
          {filteredPosts.map((post) => {
            const interaction = interactionMap[post.id];

            return (
              <FeedPost
                key={post.id}
                post={post}
                liked={interaction?.liked ?? false}
                saved={interaction?.saved ?? false}
                likesCount={interaction?.likesCount ?? post.likesCount}
                updatingLike={updatingLikeMap[post.id] ?? false}
                updatingSave={updatingSaveMap[post.id] ?? false}
                onToggleLike={() => handleToggleLike(post)}
                onToggleSave={() => handleToggleSave(post)}
                onPress={() => router.push(`/post/${post.id}`)}
                onPressMotorcycle={() => {
                  if (post.relatedMotorcycleId) {
                    router.push(`/motorcycle/${post.relatedMotorcycleId}`);
                  }
                }}
              />
            );
          })}
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
