import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";

type ProfileMenuItemProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  danger?: boolean;
  onPress?: () => void;
};

export function ProfileMenuItem({
  icon,
  title,
  description,
  danger = false,
  onPress,
}: ProfileMenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}
    >
      <View style={styles.left}>
        <View style={[styles.iconBadge, danger && styles.dangerIconBadge]}>
          {icon}
        </View>

        <View style={styles.textWrap}>
          <AppText variant="bodyMedium" tone={danger ? "danger" : "primary"}>
            {title}
          </AppText>

          {description ? (
            <AppText
              variant="caption"
              tone="secondary"
              style={styles.description}
              numberOfLines={1}
            >
              {description}
            </AppText>
          ) : null}
        </View>
      </View>

      {!danger && <ChevronRight size={18} color={theme.textMuted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: 64,
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: theme.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerIconBadge: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
  },
  textWrap: {
    flex: 1,
  },
  description: {
    marginTop: 2,
  },
  pressed: {
    opacity: 0.82,
  },
});
