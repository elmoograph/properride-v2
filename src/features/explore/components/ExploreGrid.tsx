import { Image, StyleSheet, View } from "react-native";

import { AppText } from "@/src/shared/components";
import { explorePosts } from "@/src/shared/constants/mockData";
import { radius, spacing, theme } from "@/src/shared/theme";

export function ExploreGrid() {
  return (
    <View style={styles.grid}>
      {explorePosts.map((item, index) => {
        const isLarge = index % 3 === 0;

        return (
          <View
            key={item.id}
            style={[styles.tile, isLarge ? styles.largeTile : styles.smallTile]}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.image} />

            <View style={styles.overlay}>
              <AppText variant="caption" numberOfLines={1}>
                {item.builderName}
              </AppText>
              <AppText variant="tiny" tone="secondary" numberOfLines={1}>
                {item.location}
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    marginTop: spacing.xl,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  tile: {
    overflow: "hidden",
    borderRadius: radius.lg,
    backgroundColor: theme.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },
  largeTile: {
    width: "100%",
    height: 220,
  },
  smallTile: {
    width: "48.7%",
    height: 180,
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.surfaceSoft,
  },
  overlay: {
    position: "absolute",
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: "rgba(11, 15, 20, 0.72)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
