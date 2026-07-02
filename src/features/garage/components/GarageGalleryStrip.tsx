import { Image, StyleSheet, View } from "react-native";

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
    <View style={styles.row}>
      {items.slice(0, 3).map((item) => (
        <Image
          key={item.id}
          source={{ uri: item.imageUrl }}
          style={styles.image}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  image: {
    flex: 1,
    height: 88,
    borderRadius: radius.lg,
    backgroundColor: theme.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },
});
