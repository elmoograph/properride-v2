import { router } from "expo-router";
import { Image, Pressable, StyleSheet, View } from "react-native";

import { radius, spacing, theme } from "@/src/shared/theme";

export type GarageGalleryGridItem = {
  id: string;
  imageUrl: string;
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
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
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
});
