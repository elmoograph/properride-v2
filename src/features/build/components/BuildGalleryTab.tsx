import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { GarageGalleryGrid } from "@/src/features/garage/components/GarageGalleryGrid";
import { AppCard, AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";
import type { MotorcycleGalleryItemRow } from "@/src/shared/types/database.types";

type BuildGalleryTabProps = {
  gallery: MotorcycleGalleryItemRow[];
  motorcycleId: string;
};

export function BuildGalleryTab({
  gallery,
  motorcycleId,
}: BuildGalleryTabProps) {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderText}>
          <AppText variant="title">Gallery</AppText>
          <AppText
            variant="caption"
            tone="secondary"
            style={styles.sectionSubtitle}
          >
            Foto dan video terbaru dari motor ini.
          </AppText>
        </View>

        <Pressable
          onPress={() =>
            router.push(`/(create)/add-gallery?motorcycleId=${motorcycleId}`)
          }
          style={({ pressed }) => [
            styles.sectionActionButton,
            pressed && styles.pressed,
          ]}
        >
          <AppText variant="caption" tone="accent">
            Add Gallery
          </AppText>
        </Pressable>
      </View>

      {gallery.length === 0 ? (
        <AppCard style={styles.emptyCard}>
          <AppText variant="bodyMedium">Belum ada media</AppText>
          <AppText variant="caption" tone="secondary" style={styles.emptyText}>
            Tambahkan foto atau video untuk mulai membangun galeri motor ini.
          </AppText>
        </AppCard>
      ) : (
        <GarageGalleryGrid
          items={gallery.map((item) => ({
            id: item.id,
            imageUrl: item.image_url,
            mediaType: item.media_type,
          }))}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionSubtitle: {
    marginTop: spacing.xs,
  },
  sectionActionButton: {
    minHeight: 34,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    alignItems: "flex-start",
  },
  emptyText: {
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.82,
  },
});
