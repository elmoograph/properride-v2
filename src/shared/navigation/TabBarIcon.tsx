import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { radius, theme } from "@/src/shared/theme";

type TabBarIconProps = {
  children: ReactNode;
  isCenter?: boolean;
};

export function TabBarIcon({ children, isCenter = false }: TabBarIconProps) {
  if (isCenter) {
    return <View style={styles.centerButton}>{children}</View>;
  }

  return <View style={styles.iconWrap}>{children}</View>;
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 36,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  centerButton: {
    width: 56,
    height: 56,
    marginTop: 10,
    borderRadius: radius.pill,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: theme.background,
  },
});
