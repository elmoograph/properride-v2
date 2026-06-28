import { ChevronRight } from "lucide-react-native";
import { Image, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/src/shared/components";
import type { Motorcycle } from "@/src/shared/types/app.types";
import { radius, spacing, theme } from "@/src/shared/theme";

type GarageMotorcycleCardProps = {
  motorcycle: Motorcycle;
};

export function GarageMotorcycleCard({
  motorcycle,
}: GarageMotorcycleCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Image source={{ uri: motorcycle.imageUrl }} style={styles.image} />

      <View style={styles.content}>
        <AppText variant="bodyMedium" numberOfLines={1}>
          {motorcycle.name}
        </AppText>

        <AppText variant="caption" tone="secondary" style={styles.year}>
          {motorcycle.year}
        </AppText>

        <View style={styles.actionRow}>
          <AppText variant="caption" tone="accent">
            View Detail
          </AppText>
          <ChevronRight size={16} color={theme.primary} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },
  image: {
    width: "100%",
    height: 122,
    backgroundColor: theme.surfaceSoft,
  },
  content: {
    padding: spacing.md,
  },
  year: {
    marginTop: spacing.xs,
  },
  actionRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pressed: {
    opacity: 0.86,
  },
});
