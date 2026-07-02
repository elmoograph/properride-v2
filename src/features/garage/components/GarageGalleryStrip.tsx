import { Dimensions, Image, StyleSheet, View } from "react-native";

import { radius, spacing, theme } from "@/src/shared/theme";

export type GarageGalleryStripItem = {
  id: string;
  imageUrl: string;
};

type GarageGalleryStripProps = {
  items: GarageGalleryStripItem[];
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const HORIZONTAL_CONTENT_PADDING = spacing.lg * 2;
const COLUMN_GAP = spacing.sm;
const COLUMN_COUNT = 3;

const ITEM_SIZE =
  (SCREEN_WIDTH -
    HORIZONTAL_CONTENT_PADDING -
    COLUMN_GAP * (COLUMN_COUNT - 1)) /
  COLUMN_COUNT;

export function GarageGalleryStrip({ items }: GarageGalleryStripProps) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.id} style={styles.gridItem}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: COLUMN_GAP,
    rowGap: COLUMN_GAP,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: radius.lg,
    backgroundColor: theme.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
