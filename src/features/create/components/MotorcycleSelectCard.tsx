import { Check, ChevronRight } from "lucide-react-native";
import { Image, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/src/shared/components";
import type { Motorcycle } from "@/src/shared/types/app.types";
import { radius, spacing, theme } from "@/src/shared/theme";

type MotorcycleSelectCardProps = {
  motorcycle: Motorcycle;
  selected?: boolean;
  onPress?: () => void;
};

export function MotorcycleSelectCard({
  motorcycle,
  selected = false,
  onPress,
}: MotorcycleSelectCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <Image source={{ uri: motorcycle.imageUrl }} style={styles.image} />

      <View style={styles.content}>
        <AppText variant="bodyMedium" numberOfLines={1}>
          {motorcycle.name}
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
