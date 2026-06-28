import { ChevronRight, Bike } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";

type RelatedMotorChipProps = {
  motorcycleName: string;
  onPress?: () => void;
};

export function RelatedMotorChip({
  motorcycleName,
  onPress,
}: RelatedMotorChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.left}>
        <View style={styles.iconBadge}>
          <Bike size={14} color={theme.primary} />
        </View>

        <AppText variant="caption" tone="secondary">
          Terkait motor:{" "}
          <AppText variant="caption" tone="primary">
            {motorcycleName}
          </AppText>
        </AppText>
      </View>

      <ChevronRight size={16} color={theme.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 40,
    borderRadius: radius.pill,
    backgroundColor: theme.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  iconBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.82,
  },
});
