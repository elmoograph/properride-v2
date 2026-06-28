import type { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";

import { radius, spacing, theme } from "@/src/shared/theme";
import { AppText } from "./AppText";

type AppChipProps = {
  children: ReactNode;
  selected?: boolean;
  onPress?: () => void;
};

export function AppChip({ children, selected = false, onPress }: AppChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.default,
        pressed && styles.pressed,
      ]}
    >
      <AppText
        variant="caption"
        tone={selected ? "primary" : "secondary"}
        style={selected ? styles.selectedText : undefined}
      >
        {children}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 34,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  default: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
  },
  selected: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  selectedText: {
    color: "#FFFFFF",
  },
  pressed: {
    opacity: 0.82,
  },
});
