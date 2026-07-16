import { Play } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import { AppText } from "@/src/shared/components";
import { spacing, theme } from "@/src/shared/theme";
import type { FeedPost, PostMedia } from "@/src/shared/types/app.types";

type PostMediaCarouselProps = {
  post: FeedPost;
  onPress?: () => void;
};

export function PostMediaCarousel({ post, onPress }: PostMediaCarouselProps) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const mediaItems = useMemo<PostMedia[]>(() => {
    if (post.media && post.media.length > 0) {
      return post.media;
    }

    return [
      {
        id: `${post.id}-fallback-media`,
        url: post.imageUrl,
        type: "image",
      },
    ];
  }, [post]);

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const offsetX = event.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(offsetX / width);
    setActiveIndex(nextIndex);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={mediaItems}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        renderItem={({ item }) => {
          const isVideo = item.type === "video";

          return (
            <Pressable onPress={onPress} style={{ width }}>
              {isVideo ? (
                <View style={styles.videoPlaceholder}>
                  <View style={styles.playButton}>
                    <Play
                      size={26}
                      color={theme.textPrimary}
                      fill={theme.textPrimary}
                    />
                  </View>

                  <AppText
                    variant="caption"
                    tone="secondary"
                    style={styles.videoLabel}
                  >
                    Video
                  </AppText>
                </View>
              ) : (
                <Image
                  source={{ uri: item.url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              )}
            </Pressable>
          );
        }}
      />

      {mediaItems.length > 1 ? (
        <>
          <View style={styles.counterPill}>
            <AppText variant="tiny">
              {activeIndex + 1}/{mediaItems.length}
            </AppText>
          </View>

          <View style={styles.dotsRow}>
            {mediaItems.map((item, index) => {
              const isActive = index === activeIndex;

              return (
                <View
                  key={item.id}
                  style={[styles.dot, isActive && styles.dotActive]}
                />
              );
            })}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  image: {
    width: "100%",
    aspectRatio: 4 / 5,
    backgroundColor: theme.surfaceSoft,
  },
  videoPlaceholder: {
    width: "100%",
    aspectRatio: 4 / 5,
    backgroundColor: theme.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 62,
    height: 62,
    borderRadius: 999,
    backgroundColor: "rgba(11, 15, 20, 0.72)",
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  videoLabel: {
    marginTop: spacing.sm,
  },
  counterPill: {
    position: "absolute",
    right: spacing.lg,
    top: spacing.md,
    borderRadius: 999,
    backgroundColor: "rgba(11, 15, 20, 0.72)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dotsRow: {
    position: "absolute",
    bottom: spacing.md,
    alignSelf: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(243, 244, 246, 0.42)",
  },
  dotActive: {
    width: 16,
    backgroundColor: theme.primary,
  },
});
