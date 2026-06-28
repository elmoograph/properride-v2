import { ChevronRight } from "lucide-react-native";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppScreen, AppText } from "@/src/shared/components";
import {
  builderProfile,
  galleryItems,
  motorcycles,
} from "@/src/shared/constants/mockData";
import { spacing, theme } from "@/src/shared/theme";
import { GarageGalleryStrip } from "@/src/features/garage/components/GarageGalleryStrip";
import { GarageHeader } from "@/src/features/garage/components/GarageHeader";
import { GarageMotorcycleCard } from "@/src/features/garage/components/GarageMotorcycleCard";

export function GarageScreen() {
  return (
    <AppScreen scrollable>
      <GarageHeader
        garageName={builderProfile.garageName}
        builderName={builderProfile.builderName}
      />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="title">My Motorcycles</AppText>

          <View style={styles.viewAll}>
            <AppText variant="caption" tone="accent">
              Lihat Semua
            </AppText>
            <ChevronRight size={16} color={theme.primary} />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.motorcycleList}
        >
          {motorcycles.map((motorcycle) => (
            <GarageMotorcycleCard key={motorcycle.id} motorcycle={motorcycle} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="title">Latest Garage Photos</AppText>

          <View style={styles.viewAll}>
            <AppText variant="caption" tone="accent">
              Lihat Semua
            </AppText>
            <ChevronRight size={16} color={theme.primary} />
          </View>
        </View>

        <GarageGalleryStrip items={galleryItems} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.section,
  },
  sectionHeader: {
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  viewAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  motorcycleList: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
});
