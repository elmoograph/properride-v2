import { router } from "expo-router";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Play } from "lucide-react-native";
import { AppText } from "@/src/shared/components";

import { radius, spacing, theme } from "@/src/shared/theme";

export type GarageGalleryGridItem = {
  id: string;
  imageUrl: string;
  mediaType?: "image" | "video";
};

type GarageGalleryGridProps = {
  items: GarageGalleryGridItem[];
};

export function GarageGalleryGrid({ items }: GarageGalleryGridProps) {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => router.push(`/gallery/${item.id}`)}
          style={({ pressed }) => [styles.item, pressed && styles.pressed]}
        >
          {item.mediaType === "video" ? (
            <View style={styles.videoFallback}>
              <Play size={28} color={theme.primary} fill={theme.primary} />
            </View>
          ) : (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          )}

          {item.mediaType === "video" ? (
            <View style={styles.videoBadge}>
              <AppText variant="tiny" style={styles.videoBadgeText}>
                Video
              </AppText>
            </View>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  item: {
    width: "47.8%",
    aspectRatio: 1,
    borderRadius: radius.xl,
    backgroundColor: theme.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  pressed: {
    opacity: 0.82,
  },
  videoFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  videoBadge: {
    position: "absolute",
    left: spacing.xs,
    bottom: spacing.xs,
    minHeight: 22,
    borderRadius: radius.pill,
    backgroundColor: "rgba(11, 15, 20, 0.78)",
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  videoBadgeText: {
    color: theme.textPrimary,
  },
});
