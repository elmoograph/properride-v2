import {
  ChevronRight,
  Layers3,
  Package,
  Shapes,
  Warehouse,
} from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";

type SetupOverviewCardProps = {
  partsCount: number;
  motorcyclesCount: number;
  categoriesCount: number;
  featuredMotorcycleName?: string;
};

export function SetupOverviewCard({
  partsCount,
  motorcyclesCount,
  categoriesCount,
  featuredMotorcycleName = "NMAX Atlas",
}: SetupOverviewCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Layers3 size={20} color={theme.primary} />
        </View>

        <View style={styles.headerText}>
          <AppText variant="title">Setup Overview</AppText>
          <AppText variant="caption" tone="secondary" style={styles.subtitle}>
            Ringkasan part dan setup yang sudah kamu catat di Garage.
          </AppText>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Package size={18} color={theme.primary} />
          <AppText variant="title" style={styles.statValue}>
            {partsCount}
          </AppText>
          <AppText variant="caption" tone="secondary">
            Parts
          </AppText>
        </View>

        <View style={styles.statCard}>
          <Warehouse size={18} color={theme.primary} />
          <AppText variant="title" style={styles.statValue}>
            {motorcyclesCount}
          </AppText>
          <AppText variant="caption" tone="secondary">
            Motorcycles
          </AppText>
        </View>

        <View style={styles.statCard}>
          <Shapes size={18} color={theme.primary} />
          <AppText variant="title" style={styles.statValue}>
            {categoriesCount}
          </AppText>
          <AppText variant="caption" tone="secondary">
            Categories
          </AppText>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
      >
        <View>
          <AppText variant="bodyMedium">Kelola Setup</AppText>
          <AppText
            variant="caption"
            tone="secondary"
            style={styles.ctaSubtitle}
          >
            {featuredMotorcycleName} punya setup paling lengkap.
          </AppText>
        </View>

        <ChevronRight size={18} color={theme.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  statsGrid: {
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minHeight: 96,
    borderRadius: radius.lg,
    backgroundColor: theme.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.md,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  statValue: {
    marginTop: spacing.sm,
  },
  cta: {
    marginTop: spacing.md,
    minHeight: 58,
    borderRadius: radius.lg,
    backgroundColor: "rgba(23, 177, 105, 0.1)",
    borderWidth: 1,
    borderColor: theme.primary,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  ctaSubtitle: {
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.82,
  },
});
