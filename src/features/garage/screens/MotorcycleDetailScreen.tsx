import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Gauge,
  ImagePlus,
  Package,
  Rows3,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, View } from "react-native";

import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
} from "@/src/shared/components";
import { galleryItems, motorcycles } from "@/src/shared/constants/mockData";
import { radius, spacing, theme } from "@/src/shared/theme";
import { GarageGalleryStrip } from "@/src/features/garage/components/GarageGalleryStrip";

type DetailTab = "setup" | "timeline" | "gallery";

type MockPart = {
  id: string;
  category: string;
  brand: string;
  name: string;
};

type PartCategoryGroup = {
  category: string;
  parts: MockPart[];
};

const detailTabs: Array<{
  label: string;
  value: DetailTab;
}> = [
  {
    label: "Setup Parts",
    value: "setup",
  },
  {
    label: "Timeline",
    value: "timeline",
  },
  {
    label: "Gallery",
    value: "gallery",
  },
];

const mockParts: MockPart[] = [
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
  {
    id: "part-4",
    category: "Brake",
    brand: "TDR",
    name: "Brake Hose",
  },
  {
    id: "part-5",
    category: "Lighting",
    brand: "Koso",
    name: "LED Signal",
  },
];

const mockTimeline = [
  {
    id: "timeline-1",
    date: "24 Jun 2026",
    action: "Part ditambahkan",
    title: "Alpha Series",
    description: "R9 ditambahkan ke kategori Exhaust.",
  },
  {
    id: "timeline-2",
    date: "18 Jun 2026",
    action: "Part ditambahkan",
    title: "G-Sport",
    description: "YSS ditambahkan ke kategori Suspension.",
  },
  {
    id: "timeline-3",
    date: "14 Jun 2026",
    action: "Part dilepas",
    title: "Cover CVT",
    description: "Part dilepas dari setup motor ini.",
  },
];

export function MotorcycleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<DetailTab>("setup");

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

        <View style={styles.tabBar}>
          {detailTabs.map((tab) => {
            const isActive = activeTab === tab.value;

            return (
              <Pressable
                key={tab.value}
                onPress={() => setActiveTab(tab.value)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
              >
                <AppText
                  variant="caption"
                  tone={isActive ? "accent" : "secondary"}
                >
                  {tab.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.tabContent}>
          {activeTab === "setup" ? (
            <SetupPartsTab motorcycleId={motorcycle.id} />
          ) : null}
          {activeTab === "timeline" ? <TimelineTab /> : null}
          {activeTab === "gallery" ? <GalleryTab /> : null}
        </View>
      </View>
    </AppScreen>
  );
}

function SetupPartsTab({ motorcycleId }: { motorcycleId: string }) {
  const groupedParts = groupPartsByCategory(mockParts);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >(() =>
    groupedParts.reduce<Record<string, boolean>>((result, group, index) => {
      result[group.category] = index === 0;
      return result;
    }, {}),
  );

  function toggleCategory(category: string) {
    setExpandedCategories((current) => ({
      ...current,
      [category]: !current[category],
    }));
  }

  return (
    <View>
      <View style={styles.sectionHeader}>
        <View>
          <AppText variant="title">Setup Parts</AppText>
          <AppText
            variant="caption"
            tone="secondary"
            style={styles.sectionSubtitle}
          >
            Part dikelompokkan berdasarkan kategori setup.
          </AppText>
        </View>
      </View>

      <View style={styles.categoryList}>
        {groupedParts.map((group) => {
          const isExpanded = expandedCategories[group.category];

          return (
            <View key={group.category} style={styles.categoryAccordion}>
              <Pressable
                onPress={() => toggleCategory(group.category)}
                style={({ pressed }) => [
                  styles.accordionHeader,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.accordionTitle}>
                  <AppText variant="bodyMedium">{group.category}</AppText>

                  <View style={styles.categoryCountPill}>
                    <AppText variant="tiny" tone="secondary">
                      {group.parts.length} item
                    </AppText>
                  </View>
                </View>

                {isExpanded ? (
                  <ChevronDown size={18} color={theme.textMuted} />
                ) : (
                  <ChevronRight size={18} color={theme.textMuted} />
                )}
              </Pressable>

              {isExpanded ? (
                <View style={styles.partList}>
                  {group.parts.map((part) => (
                    <View key={part.id} style={styles.partRow}>
                      <View style={styles.partDot} />

                      <View style={styles.partText}>
                        <AppText variant="bodyMedium">{part.name}</AppText>
                        <AppText
                          variant="caption"
                          tone="secondary"
                          style={styles.partMeta}
                        >
                          By {part.brand}
                        </AppText>
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <AppButton
        style={styles.bottomButton}
        onPress={() =>
          router.push(`/(create)/add-part?motorcycleId=${motorcycleId}`)
        }
      >
        Add Part
      </AppButton>
    </View>
  );
}

function TimelineTab() {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <View>
          <AppText variant="title">Timeline</AppText>
          <AppText
            variant="caption"
            tone="secondary"
            style={styles.sectionSubtitle}
          >
            Riwayat otomatis dari perubahan setup motor ini.
          </AppText>
        </View>
      </View>

      <View style={styles.timelineList}>
        {mockTimeline.map((item, index) => {
          const isLastItem = index === mockTimeline.length - 1;

          return (
            <View key={item.id} style={styles.timelineItem}>
              <View style={styles.timelineIndicator}>
                <View style={styles.timelineDot} />
                {!isLastItem ? <View style={styles.timelineLine} /> : null}
              </View>

              <AppCard style={styles.timelineCard}>
                <View style={styles.timelineTopRow}>
                  <AppText variant="caption" tone="accent">
                    {item.action}
                  </AppText>

                  <AppText variant="caption" tone="muted">
                    {item.date}
                  </AppText>
                </View>

                <AppText variant="bodyMedium" style={styles.timelineTitle}>
                  {item.title}
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={styles.timelineDescription}
                >
                  {item.description}
                </AppText>
              </AppCard>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function GalleryTab() {
  return (
    <View>
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
      </View>

      <GarageGalleryStrip items={galleryItems} />

      <AppButton
        style={styles.bottomButton}
        onPress={() => {
          Alert.alert(
            "Add Gallery",
            "Form Add Gallery akan dibuat setelah flow motor dan part stabil.",
          );
        }}
      >
        Add Gallery
      </AppButton>
    </View>
  );
}

function groupPartsByCategory(parts: MockPart[]): PartCategoryGroup[] {
  const grouped = parts.reduce<Record<string, MockPart[]>>((result, part) => {
    if (!result[part.category]) {
      result[part.category] = [];
    }

    result[part.category].push(part);
    return result;
  }, {});

  return Object.entries(grouped).map(([category, categoryParts]) => ({
    category,
    parts: categoryParts,
  }));
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
    top: spacing.section,
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
  tabBar: {
    marginTop: spacing.section,
    minHeight: 44,
    borderRadius: radius.pill,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.xs,
    flexDirection: "row",
    gap: spacing.xs,
  },
  tabButton: {
    flex: 1,
    minHeight: 34,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonActive: {
    backgroundColor: theme.primarySoft,
  },
  tabContent: {
    marginTop: spacing.xl,
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
  categoryList: {
    gap: spacing.md,
  },
  categoryAccordion: {
    borderRadius: radius.lg,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    overflow: "hidden",
  },
  accordionHeader: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  accordionTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  categoryCountPill: {
    borderRadius: radius.pill,
    backgroundColor: theme.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  partList: {
    borderTopWidth: 1,
    borderTopColor: theme.borderSoft,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  partRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderSoft,
  },
  partDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: theme.primary,
  },
  partText: {
    flex: 1,
  },
  partMeta: {
    marginTop: spacing.xs,
  },
  timelineList: {
    gap: spacing.md,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.md,
  },
  timelineIndicator: {
    width: 18,
    alignItems: "center",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: theme.primary,
    marginTop: spacing.lg,
  },
  timelineLine: {
    flex: 1,
    width: 1,
    backgroundColor: theme.border,
    marginTop: spacing.xs,
  },
  timelineCard: {
    flex: 1,
  },
  timelineTitle: {
    marginTop: spacing.xs,
  },
  timelineDescription: {
    marginTop: spacing.xs,
  },
  bottomButton: {
    marginTop: spacing.section,
  },
  pressed: {
    opacity: 0.82,
  },
  timelineTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
});
