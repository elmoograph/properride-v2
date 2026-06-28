import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";

import { radius, spacing, theme } from "@/src/shared/theme";

type AppCardProps = {
  children: ReactNode;
  padded?: boolean;
  style?: ViewStyle;
};

export function AppCard({ children, padded = true, style }: AppCardProps) {
  return (
    <View style={[styles.card, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: theme.borderSoft,
  },
  padded: {
    padding: spacing.lg,
  },
});
