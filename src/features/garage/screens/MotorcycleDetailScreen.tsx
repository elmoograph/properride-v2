import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Package,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
} from "@/src/shared/components";
import { GarageGalleryGrid } from "@/src/features/garage/components/GarageGalleryGrid";
import { radius, spacing, theme } from "@/src/shared/theme";
import { getMotorcycleById } from "@/src/features/garage/repositories/motorcycle.repository";
import { getProfileById } from "@/src/features/profile/repositories/profile.repository";
import type {
  MotorcycleGalleryItemRow,
  MotorcyclePartRow,
  MotorcycleRow,
  MotorcycleTimelineItemRow,
  ProfileRow,
} from "@/src/shared/types/database.types";
import { listGalleryItemsByMotorcycleId } from "@/src/features/garage/repositories/motorcycleGallery.repository";
import {
  listPartsByMotorcycleId,
  listTimelineItemsByMotorcycleId,
} from "@/src/features/garage/repositories/motorcyclePart.repository";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { openBuilderProfile } from "@/src/shared/navigation/builderNavigation";

type DetailTab = "setup" | "timeline" | "gallery";

type PartCategoryGroup = {
  category: string;
  parts: MotorcyclePartRow[];
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

type MotorcycleDetailScreenProps = {
  motorcycleId?: string;
  showBackButton?: boolean;
  backFallbackHref?: string;
};

export function MotorcycleDetailScreen({
  motorcycleId,
  showBackButton = true,
  backFallbackHref = "/(tabs)/garage",
}: MotorcycleDetailScreenProps = {}) {
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const resolvedMotorcycleId = motorcycleId ?? id;
  const [activeTab, setActiveTab] = useState<DetailTab>("setup");

  const [motorcycle, setMotorcycle] = useState<MotorcycleRow | null>(null);
  const [builderProfile, setBuilderProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [parts, setParts] = useState<MotorcyclePartRow[]>([]);
  const [timelineItems, setTimelineItems] = useState<
    MotorcycleTimelineItemRow[]
  >([]);
  const [galleryItems, setGalleryItems] = useState<MotorcycleGalleryItemRow[]>(
    [],
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadMotorcycle() {
        if (!resolvedMotorcycleId) {
          setLoading(false);
          setErrorMessage("Motor tidak ditemukan.");
          return;
        }

        try {
          setLoading(true);
          setErrorMessage(null);

          const motorcycleData = await getMotorcycleById(resolvedMotorcycleId);

          if (!motorcycleData) {
            throw new Error("Motor tidak ditemukan.");
          }

          if (
            motorcycleData.archived_at &&
            user?.id !== motorcycleData.user_id
          ) {
            throw new Error("Build ini sudah tidak tersedia.");
          }

          const [partsData, timelineData, galleryData, profileData] =
            await Promise.all([
              listPartsByMotorcycleId(resolvedMotorcycleId),
              listTimelineItemsByMotorcycleId(resolvedMotorcycleId),
              listGalleryItemsByMotorcycleId(resolvedMotorcycleId),
              getProfileById(motorcycleData.user_id),
            ]);

          if (isActive) {
            setMotorcycle(motorcycleData);
            setBuilderProfile(profileData);
            setParts(partsData);
            setTimelineItems(timelineData);
            setGalleryItems(galleryData);
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat detail motor.";

          if (isActive) {
            setErrorMessage(message);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      loadMotorcycle();

      return () => {
        isActive = false;
      };
    }, [resolvedMotorcycleId, user?.id]),
  );

  if (loading) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.primary} />
          <AppText tone="secondary" style={styles.centerText}>
            Memuat detail motor...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  if (errorMessage || !motorcycle) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <AppText variant="title">Motor tidak ditemukan</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            {errorMessage ?? "Data motor belum tersedia atau sudah dihapus."}
          </AppText>
          <AppButton onPress={() => router.replace(backFallbackHref)}>
            Kembali
          </AppButton>
        </View>
      </AppScreen>
    );
  }

  const motorcycleImageUrl = motorcycle.image_url;

  const motorcycleTitle =
    motorcycle.name || `${motorcycle.brand} ${motorcycle.model}`;

  const motorcycleEngineInfo =
    motorcycle.engine_info ??
    (motorcycle.engine_cc ? `${motorcycle.engine_cc} cc` : "Belum diisi");

  const builderName =
    builderProfile?.username ?? builderProfile?.full_name ?? "ProperRide Rider";

  const builderLocation = builderProfile?.location ?? "Lokasi belum diisi";
  const isArchived = Boolean(motorcycle.archived_at);

  return (
    <AppScreen scrollable padded={false}>
      <View style={styles.heroWrap}>
        {motorcycleImageUrl ? (
          <Image
            source={{ uri: motorcycleImageUrl }}
            style={styles.heroImage}
          />
        ) : (
          <View style={[styles.heroImage, styles.heroPlaceholder]}>
            <AppText variant="caption" tone="secondary">
              Foto motor belum ditambahkan.
            </AppText>
          </View>
        )}

        <View style={styles.heroOverlay} />

        <View style={styles.topActions}>
          {showBackButton ? (
            <Pressable style={styles.iconButton} onPress={() => router.back()}>
              <ChevronLeft size={22} color={theme.textPrimary} />
            </Pressable>
          ) : (
            <View />
          )}

          <View style={styles.topActionPlaceholder} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.detailInfoSection}>
          {isArchived ? (
            <View style={styles.archivedBadge}>
              <AppText variant="caption" tone="secondary">
                Diarsipkan · Mode hanya-baca
              </AppText>
            </View>
          ) : null}

          <Pressable
            style={styles.builderNameText}
            onPress={() =>
              openBuilderProfile({
                currentUserId: user?.id,
                builderUserId: motorcycle.user_id,
              })
            }
          >
            <AppText variant="bodyMedium" tone="accent" numberOfLines={1}>
              {builderName}
            </AppText>
          </Pressable>

          <View style={styles.motorcycleTitleBlock}>
            <View style={styles.motorcycleMetaRow}>
              <AppText
                variant="titleLarge"
                style={styles.title}
                numberOfLines={1}
              >
                {motorcycleTitle}
              </AppText>
              <View style={styles.yearPill}>
                <AppText variant="tiny" tone="accent">
                  {motorcycle.year}
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
              <AppText variant="bodyMedium">{parts.length}</AppText>
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
              <AppText variant="bodyMedium">{galleryItems.length}</AppText>
            </View>
          </View>
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
          {activeTab === "setup" ? <SetupPartsTab parts={parts} /> : null}

          {activeTab === "timeline" ? (
            <TimelineTab timelineItems={timelineItems} />
          ) : null}

          {activeTab === "gallery" ? (
            <GalleryTab gallery={galleryItems} />
          ) : null}
        </View>
      </View>
    </AppScreen>
  );
}

function SetupPartsTab({ parts }: { parts: MotorcyclePartRow[] }) {
  const groupedParts = useMemo(() => groupPartsByCategory(parts), [parts]);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >(() =>
    groupedParts.reduce<Record<string, boolean>>((result, group, index) => {
      result[group.category] = index === 0;
      return result;
    }, {}),
  );

  useEffect(() => {
    setExpandedCategories(
      groupedParts.reduce<Record<string, boolean>>((result, group, index) => {
        result[group.category] = index === 0;
        return result;
      }, {}),
    );
  }, [groupedParts]);

  function toggleCategory(category: string) {
    setExpandedCategories((current) => ({
      ...current,
      [category]: !current[category],
    }));
  }

  return (
    <View>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderText}>
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

      {groupedParts.length === 0 ? (
        <AppCard style={styles.emptyCard}>
          <AppText variant="bodyMedium">Belum ada part</AppText>
          <AppText variant="caption" tone="secondary" style={styles.emptyText}>
            Tambahkan part pertama untuk mulai mencatat setup motor ini.
          </AppText>
        </AppCard>
      ) : null}

      {groupedParts.length > 0 ? (
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
                        <View style={styles.partThumbnail}>
                          <Package size={18} color={theme.primary} />
                        </View>

                        <View style={styles.partText}>
                          <AppText variant="bodyMedium" numberOfLines={1}>
                            {part.name}
                          </AppText>

                          <AppText
                            variant="caption"
                            tone="secondary"
                            style={styles.partMeta}
                            numberOfLines={1}
                          >
                            {part.brand} · {part.category}
                          </AppText>

                          {part.description ? (
                            <AppText
                              variant="caption"
                              tone="muted"
                              style={styles.partDescription}
                            >
                              {part.description}
                            </AppText>
                          ) : null}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function TimelineTab({
  timelineItems,
}: {
  timelineItems: MotorcycleTimelineItemRow[];
}) {
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

      {timelineItems.length === 0 ? (
        <AppCard style={styles.emptyCard}>
          <AppText variant="bodyMedium">Belum ada timeline</AppText>
          <AppText variant="caption" tone="secondary" style={styles.emptyText}>
            Timeline akan terisi otomatis saat part ditambahkan atau dilepas.
          </AppText>
        </AppCard>
      ) : null}

      {timelineItems.length > 0 ? (
        <View style={styles.timelineList}>
          {timelineItems.map((item, index) => {
            const isLastItem = index === timelineItems.length - 1;

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
                      {new Date(item.created_at).toLocaleDateString("id-ID")}
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
      ) : null}
    </View>
  );
}

function GalleryTab({ gallery }: { gallery: MotorcycleGalleryItemRow[] }) {
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
            Foto terbaru dari motor ini.
          </AppText>
        </View>
      </View>

      {gallery.length === 0 ? (
        <AppCard style={styles.emptyCard}>
          <AppText variant="bodyMedium">Belum ada foto</AppText>
          <AppText variant="caption" tone="secondary" style={styles.emptyText}>
            Tambahkan foto untuk mulai membangun galeri motor ini.
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

function groupPartsByCategory(parts: MotorcyclePartRow[]): PartCategoryGroup[] {
  const grouped = parts.reduce<Record<string, MotorcyclePartRow[]>>(
    (result, part) => {
      if (!result[part.category]) {
        result[part.category] = [];
      }

      result[part.category].push(part);
      return result;
    },
    {},
  );

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
    backgroundColor: "rgba(11, 15, 20, 0.16)",
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
    marginTop: -40,
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
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderSoft,
  },
  partThumbnail: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: theme.primarySoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  partText: {
    flex: 1,
  },
  partMeta: {
    marginTop: spacing.xs,
  },
  disabledButton: {
    opacity: 0.5,
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
  timelineTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  timelineTitle: {
    marginTop: spacing.xs,
  },
  timelineDescription: {
    marginTop: spacing.xs,
  },
  emptyCard: {
    alignItems: "flex-start",
  },
  emptyText: {
    marginTop: spacing.xs,
  },
  bottomButton: {
    marginTop: spacing.section,
  },
  pressed: {
    opacity: 0.82,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  centerText: {
    maxWidth: 280,
    textAlign: "center",
  },
  partDescription: {
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  heroPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  motorcycleMeta: {
    marginTop: -spacing.xs,
  },
  detailInfoSection: {
    gap: 0,
  },
  archivedBadge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    backgroundColor: theme.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  builderNameText: {
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
  sectionHeaderText: {
    flex: 1,
  },
  topActionPlaceholder: {
    width: 40,
    height: 40,
  },
});
