import { router } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet } from "react-native";

import { radius, spacing, theme } from "@/src/shared/theme";

export type GarageGalleryStripItem = {
  id: string;
  imageUrl: string;
};

type GarageGalleryStripProps = {
  items: GarageGalleryStripItem[];
};

export function GarageGalleryStrip({ items }: GarageGalleryStripProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  item: {
    width: 132,
    height: 132,
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
