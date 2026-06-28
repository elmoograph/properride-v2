import type { ReactNode } from "react";
import type { TextStyle } from "react-native";
import { StyleSheet, Text } from "react-native";

import { theme, typography } from "@/src/shared/theme";

type TextVariant = keyof typeof typography;
type TextTone = "primary" | "secondary" | "muted" | "accent" | "danger";

type AppTextProps = {
  children: ReactNode;
  variant?: TextVariant;
  tone?: TextTone;
  style?: TextStyle;
  numberOfLines?: number;
};

const toneColor: Record<TextTone, string> = {
  primary: theme.textPrimary,
  secondary: theme.textSecondary,
  muted: theme.textMuted,
  accent: theme.primary,
  danger: theme.danger,
};

export function AppText({
  children,
  variant = "body",
  tone = "primary",
  style,
  numberOfLines,
}: AppTextProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        styles.base,
        typography[variant],
        { color: toneColor[tone] },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
