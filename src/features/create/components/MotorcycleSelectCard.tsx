import { Bike, Check, ChevronRight } from "lucide-react-native";
import { Image, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";

export type MotorcycleSelectCardData = {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: string;
  imageUrl: string | null;
  engineInfo: string | null;
};

type MotorcycleSelectCardProps = {
  motorcycle: MotorcycleSelectCardData;
  selected?: boolean;
  onPress?: () => void;
};

export function MotorcycleSelectCard({
  motorcycle,
  selected = false,
  onPress,
}: MotorcycleSelectCardProps) {
  const displayName =
    motorcycle.name.trim() || `${motorcycle.brand} ${motorcycle.model}`;

  const hasImage = Boolean(motorcycle.imageUrl);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      {hasImage ? (
        <Image
          source={{ uri: motorcycle.imageUrl ?? "" }}
          style={styles.image}
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Bike size={24} color={theme.primary} />
        </View>
      )}

      <View style={styles.content}>
        <AppText variant="bodyMedium" numberOfLines={1}>
          {displayName}
        </AppText>

        <AppText variant="caption" tone="secondary" style={styles.meta}>
          {motorcycle.brand} {motorcycle.model} · {motorcycle.year}
        </AppText>
      </View>

      {selected ? (
        <View style={styles.checkCircle}>
          <Check size={16} color="#FFFFFF" />
        </View>
      ) : (
        <ChevronRight size={18} color={theme.textMuted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 76,
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  selected: {
    borderColor: theme.primary,
    backgroundColor: theme.surfaceSoft,
  },
  image: {
    width: 58,
    height: 58,
    borderRadius: radius.md,
    backgroundColor: theme.surfaceSoft,
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },
  content: {
    flex: 1,
  },
  meta: {
    marginTop: spacing.xs,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.82,
  },
});
