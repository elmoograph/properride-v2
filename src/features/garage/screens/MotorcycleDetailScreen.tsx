import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Edit3, Gauge, Package, Rows3 } from "lucide-react-native";
import { Image, Pressable, StyleSheet, View } from "react-native";

import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
} from "@/src/shared/components";
import { galleryItems, motorcycles } from "@/src/shared/constants/mockData";
import { radius, spacing, theme } from "@/src/shared/theme";
import { GarageGalleryStrip } from "@/src/features/garage/components/GarageGalleryStrip";

const mockParts = [
  {
    id: "part-1",
    category: "Exhaust",
    brand: "R9",
    name: "Alpha Series",
  },
  {
    id: "part-2",
    category: "Suspension",
    brand: "YSS",
    name: "G-Sport",
  },
  {
    id: "part-3",
    category: "Brake",
    brand: "Brembo",
    name: "Caliper 2P",
  },
];

export function MotorcycleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const motorcycle =
    motorcycles.find((item) => item.id === id) ?? motorcycles[0];

  return (
    <AppScreen scrollable padded={false}>
      <View style={styles.heroWrap}>
        <Image source={{ uri: motorcycle.imageUrl }} style={styles.heroImage} />

        <View style={styles.heroOverlay} />

        <View style={styles.topActions}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <ChevronLeft size={22} color={theme.textPrimary} />
          </Pressable>

          <Pressable style={styles.iconButton}>
            <Edit3 size={18} color={theme.textPrimary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.identity}>
          <AppText variant="caption" tone="accent">
            Motorcycle Detail
          </AppText>

          <AppText variant="titleLarge" style={styles.title}>
            {motorcycle.brand} {motorcycle.model}
          </AppText>
        </View>

        <View style={styles.statsRow}>
          <AppCard style={styles.statCard}>
            <Gauge size={20} color={theme.primary} />
            <AppText
              variant="caption"
              tone="secondary"
              style={styles.statLabel}
            >
              Mesin
            </AppText>
            <AppText variant="bodyMedium">{motorcycle.engineInfo}</AppText>
          </AppCard>

          <AppCard style={styles.statCard}>
            <Package size={20} color={theme.primary} />
            <AppText
              variant="caption"
              tone="secondary"
              style={styles.statLabel}
            >
              Parts
            </AppText>
            <AppText variant="bodyMedium">{mockParts.length} item</AppText>
          </AppCard>

          <AppCard style={styles.statCard}>
            <Rows3 size={20} color={theme.primary} />
            <AppText
              variant="caption"
              tone="secondary"
              style={styles.statLabel}
            >
              Tahun
            </AppText>
            <AppText variant="bodyMedium">{motorcycle.year}</AppText>
          </AppCard>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <AppText variant="title">Setup Parts</AppText>
              <AppText
                variant="caption"
                tone="secondary"
                style={styles.sectionSubtitle}
              >
                Part yang terhubung ke motor ini.
              </AppText>
            </View>

            <AppText variant="caption" tone="accent">
              Lihat semua
            </AppText>
          </View>

          <View style={styles.partList}>
            {mockParts.map((part) => (
              <AppCard key={part.id} style={styles.partCard}>
                <View style={styles.partIcon}>
                  <Package size={18} color={theme.primary} />
                </View>

                <View style={styles.partText}>
                  <AppText variant="bodyMedium">{part.name}</AppText>
                  <AppText
                    variant="caption"
                    tone="secondary"
                    style={styles.partMeta}
                  >
                    {part.brand} · {part.category}
                  </AppText>
                </View>
              </AppCard>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <AppText variant="title">Gallery</AppText>
              <AppText
                variant="caption"
                tone="secondary"
                style={styles.sectionSubtitle}
              >
                Foto terbaru dari motor ini.
              </AppText>
            </View>

            <AppText variant="caption" tone="accent">
              Lihat semua
            </AppText>
          </View>

          <GarageGalleryStrip items={galleryItems} />
        </View>

        <AppButton variant="secondary" style={styles.bottomButton}>
          Edit Detail Motor
        </AppButton>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    height: 280,
    backgroundColor: theme.surfaceSoft,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(11, 15, 20, 0.22)",
  },
  topActions: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    top: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: "rgba(11, 15, 20, 0.72)",
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    marginTop: -28,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: theme.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.section,
  },
  identity: {
    gap: spacing.xs,
  },
  title: {
    marginTop: spacing.xs,
  },
  statsRow: {
    marginTop: spacing.xl,
    flexDirection: "row",
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minHeight: 100,
    alignItems: "flex-start",
  },
  statLabel: {
    marginTop: spacing.md,
  },
  section: {
    marginTop: spacing.section,
  },
  sectionHeader: {
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  sectionSubtitle: {
    marginTop: spacing.xs,
  },
  partList: {
    gap: spacing.sm,
  },
  partCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  partIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  partText: {
    flex: 1,
  },
  partMeta: {
    marginTop: spacing.xs,
  },
  bottomButton: {
    marginTop: spacing.section,
  },
});
