import { router } from "expo-router";
import { Bike, ChevronRight } from "lucide-react-native";
import { Image, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";

export type GarageMotorcycleCardData = {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: string;
  imageUrl: string | null;
  engineInfo: string | null;
};

type GarageMotorcycleCardProps = {
  motorcycle: GarageMotorcycleCardData;
};

export function GarageMotorcycleCard({
  motorcycle,
}: GarageMotorcycleCardProps) {
  const displayName =
    motorcycle.name.trim() || `${motorcycle.brand} ${motorcycle.model}`;

  const hasImage = Boolean(motorcycle.imageUrl);

  return (
    <Pressable
      onPress={() => router.push(`/motorcycle/${motorcycle.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {hasImage ? (
        <Image
          source={{ uri: motorcycle.imageUrl ?? "" }}
          style={styles.image}
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <View style={styles.placeholderIcon}>
            <Bike size={28} color={theme.primary} />
          </View>
        </View>
      )}

      <View style={styles.content}>
        <AppText variant="bodyMedium" numberOfLines={1}>
          {displayName}
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
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
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
