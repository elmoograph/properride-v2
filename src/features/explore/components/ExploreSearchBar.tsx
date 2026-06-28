import { Search, SlidersHorizontal } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";

export function ExploreSearchBar() {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Search size={18} color={theme.textMuted} />
        <AppText tone="muted">Cari rider, lokasi, atau topik</AppText>
      </View>

      <Pressable hitSlop={10}>
        <SlidersHorizontal size={18} color={theme.textPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    borderRadius: radius.pill,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
});
