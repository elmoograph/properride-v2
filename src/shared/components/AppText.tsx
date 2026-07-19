import type { ReactNode } from "react";
import type { TextProps, TextStyle } from "react-native";
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
  onPress?: TextProps["onPress"];
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
  onPress,
}: AppTextProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      onPress={onPress}
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
