import { MapPin } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";

type BuildInfoSectionProps = {
  builderName: string;
  builderLocation: string;
  motorcycleTitle: string;
  motorcycleYear: string;
  motorcycleEngineInfo: string;
  partsCount: number;
  galleryCount: number;
  onPressBuilderProfile: () => void;
};

export function BuildInfoSection({
  builderName,
  builderLocation,
  motorcycleTitle,
  motorcycleYear,
  motorcycleEngineInfo,
  partsCount,
  galleryCount,
  onPressBuilderProfile,
}: BuildInfoSectionProps) {
  const builderNameText = (
    <AppText variant="bodyMedium" tone="accent" numberOfLines={1}>
      {builderName}
    </AppText>
  );

  return (
    <View style={styles.buildInfoSection}>
      <Pressable
          onPress={onPressBuilderProfile}
          style={({ pressed }) => [
            styles.builderNameButton,
            pressed && styles.pressed,
          ]}
        >
          {builderNameText}
        </Pressable>

      <View style={styles.motorcycleTitleBlock}>
        <View style={styles.motorcycleMetaRow}>
          <AppText variant="titleLarge" style={styles.title} numberOfLines={1}>
            {motorcycleTitle}
          </AppText>

          <View style={styles.yearPill}>
            <AppText variant="tiny" tone="accent">
              {motorcycleYear}
            </AppText>
          </View>
        </View>

        <View style={styles.motorcycleMetaRow}>
          <View style={styles.locationMeta}>
            <MapPin size={14} color={theme.primary} />
            <AppText variant="caption" tone="secondary" numberOfLines={1}>
              {builderLocation}
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.quickStatsRow}>
        <View style={styles.quickStatItem}>
          <AppText variant="caption" tone="secondary">
            Parts
          </AppText>
          <AppText variant="bodyMedium">{partsCount}</AppText>
        </View>

        <View style={styles.quickStatDivider} />

        <View style={styles.quickStatItem}>
          <AppText variant="caption" tone="secondary">
            Mesin
          </AppText>
          <AppText variant="bodyMedium" numberOfLines={1}>
            {motorcycleEngineInfo}
          </AppText>
        </View>

        <View style={styles.quickStatDivider} />

        <View style={styles.quickStatItem}>
          <AppText variant="caption" tone="secondary">
            Gallery
          </AppText>
          <AppText variant="bodyMedium">{galleryCount}</AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buildInfoSection: {
    gap: 0,
  },
  builderNameButton: {
    alignSelf: "flex-start",
  },
  motorcycleTitleBlock: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  motorcycleMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  title: {
    marginTop: spacing.xs,
  },
  locationMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexShrink: 1,
  },
  yearPill: {
    minHeight: 26,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  quickStatsRow: {
    marginTop: spacing.lg,
    minHeight: 64,
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  quickStatItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  quickStatDivider: {
    width: 1,
    height: 34,
    backgroundColor: theme.borderSoft,
  },
  pressed: {
    opacity: 0.82,
  },
});
