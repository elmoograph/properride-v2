import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  Archive,
  ChevronDown,
  ChevronRight,
  Gauge,
  MapPin,
  Package,
  Rows3,
  Trash2,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
import { BuildHero } from "@/src/features/build/components/BuildHero";
import { BuildInfoSection } from "@/src/features/build/components/BuildInfoSection";
import { colors, radius, spacing, theme } from "@/src/shared/theme";
import {
  archiveMotorcycleById,
  getMotorcycleById,
} from "@/src/features/garage/repositories/motorcycle.repository";
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
  archiveMotorcyclePartById,
  createPartArchivedTimelineItem,
  listPartsByMotorcycleId,
  listTimelineItemsByMotorcycleId,
} from "@/src/features/garage/repositories/motorcyclePart.repository";

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

const screenHeight = Dimensions.get("window").height;
const buildHeroHeight = Math.round(screenHeight * 0.6);

type MotorcycleDetailScreenProps = {
  motorcycleId?: string;
  showBackButton?: boolean;
  backFallbackHref?: string;
  onMotorcycleRemoved?: (motorcycleId: string) => void;
};

export function BuildDetailScreen({
  motorcycleId,
  showBackButton = true,
  backFallbackHref = "/(tabs)/garage",
  onMotorcycleRemoved,
}: MotorcycleDetailScreenProps = {}) {
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
  const [archivingPartId, setArchivingPartId] = useState<string | null>(null);
  const [removingMotorcycle, setRemovingMotorcycle] = useState(false);

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
    }, [resolvedMotorcycleId]),
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
            Kembali ke Build
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

  async function handleArchivePart(part: MotorcyclePartRow) {
    if (!motorcycle) {
      return;
    }

    Alert.alert(
      "Archive part?",
      `Part ${part.name} akan diarsipkan dari setup aktif motor ini.`,
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            try {
              setArchivingPartId(part.id);

              await archiveMotorcyclePartById(part.id);

              await createPartArchivedTimelineItem({
                motorcycleId: motorcycle.id,
                userId: motorcycle.user_id,
                title: part.name,
                description: `${part.brand} diarsipkan dari setup aktif ${motorcycle.brand} ${motorcycle.model}.`,
              });

              const [nextParts, nextTimelineItems] = await Promise.all([
                listPartsByMotorcycleId(motorcycle.id),
                listTimelineItemsByMotorcycleId(motorcycle.id),
              ]);

              setParts(nextParts);
              setTimelineItems(nextTimelineItems);
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Terjadi kesalahan saat mengarsipkan part.";

              Alert.alert("Gagal mengarsipkan part", message);
            } finally {
              setArchivingPartId(null);
            }
          },
        },
      ],
    );
  }

  function handleArchiveMotorcycle() {
    if (!motorcycle) {
      return;
    }

    Alert.alert(
      "Hapus motor dari Build?",
      "Motor akan diarsipkan dari Build aktif. Data part, gallery, timeline, dan post terkait tidak dihapus permanen.",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus Motor",
          style: "destructive",
          onPress: async () => {
            try {
              setRemovingMotorcycle(true);

              await archiveMotorcycleById(motorcycle.id);

              onMotorcycleRemoved?.(motorcycle.id);

              Alert.alert(
                "Motor dihapus dari Build",
                "Motor berhasil diarsipkan dari Build aktif.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      if (showBackButton) {
                        router.replace(backFallbackHref);
                      }
                    },
                  },
                ],
              );
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Terjadi kesalahan saat menghapus motor dari Build.";

              Alert.alert("Gagal menghapus motor", message);
            } finally {
              setRemovingMotorcycle(false);
            }
          },
        },
      ],
    );
  }

  return (
    <AppScreen scrollable padded={false}>
      <View style={styles.heroWrap}>
        <BuildHero
          imageUrl={motorcycleImageUrl}
          motorcycleId={motorcycle.id}
          showBackButton={showBackButton}
        />
      </View>

      <View style={styles.content}>
        <BuildInfoSection
          builderName={builderName}
          builderLocation={builderLocation}
          motorcycleTitle={motorcycleTitle}
          motorcycleBrand={motorcycle.brand}
          motorcycleModel={motorcycle.model}
          motorcycleYear={motorcycle.year}
          motorcycleEngineInfo={motorcycleEngineInfo}
          partsCount={parts.length}
          galleryCount={galleryItems.length}
        />
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
            <SetupPartsTab
              motorcycleId={motorcycle.id}
              parts={parts}
              archivingPartId={archivingPartId}
              onArchivePart={handleArchivePart}
            />
          ) : null}

          {activeTab === "timeline" ? (
            <TimelineTab timelineItems={timelineItems} />
          ) : null}

          {activeTab === "gallery" ? (
            <GalleryTab gallery={galleryItems} motorcycleId={motorcycle.id} />
          ) : null}
        </View>
        <AppCard style={styles.dangerZoneCard}>
          <View style={styles.dangerZoneText}>
            <AppText variant="bodyMedium">Kelola Build</AppText>
            <AppText
              variant="caption"
              tone="secondary"
              style={styles.dangerZoneDescription}
            >
              Arsipkan motor jika sudah tidak digunakan lagi. Data tidak dihapus
              permanen.
            </AppText>
          </View>

          <Pressable
            disabled={removingMotorcycle}
            onPress={handleArchiveMotorcycle}
            style={({ pressed }) => [
              styles.removeMotorcycleButton,
              pressed && styles.pressed,
              removingMotorcycle && styles.disabledButton,
            ]}
          >
            {removingMotorcycle ? (
              <ActivityIndicator size="small" color={theme.danger} />
            ) : (
              <Trash2 size={16} color={theme.danger} />
            )}

            <AppText variant="caption" style={styles.removeMotorcycleText}>
              {removingMotorcycle ? "Memproses..." : "Hapus"}
            </AppText>
          </Pressable>
        </AppCard>
      </View>
    </AppScreen>
  );
}

function SetupPartsTab({
  motorcycleId,
  parts,
  archivingPartId,
  onArchivePart,
}: {
  motorcycleId: string;
  parts: MotorcyclePartRow[];
  archivingPartId: string | null;
  onArchivePart: (part: MotorcyclePartRow) => void;
}) {
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

        <Pressable
          onPress={() =>
            router.push(`/(create)/add-part?motorcycleId=${motorcycleId}`)
          }
          style={({ pressed }) => [
            styles.sectionActionButton,
            pressed && styles.pressed,
          ]}
        >
          <AppText variant="caption" tone="accent">
            Add Part
          </AppText>
        </Pressable>
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
                      <Pressable
                        key={part.id}
                        onPress={() => router.push(`/part/edit/${part.id}`)}
                        style={({ pressed }) => [
                          styles.partRow,
                          pressed && styles.pressed,
                        ]}
                      >
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

                        <Pressable
                          disabled={archivingPartId === part.id}
                          onPress={() => onArchivePart(part)}
                          style={({ pressed }) => [
                            styles.archivePartButton,
                            pressed && styles.pressed,
                            archivingPartId === part.id &&
                              styles.disabledButton,
                          ]}
                        >
                          {archivingPartId === part.id ? (
                            <ActivityIndicator
                              size="small"
                              color={theme.primary}
                            />
                          ) : (
                            <Archive size={16} color={theme.primary} />
                          )}
                        </Pressable>
                      </Pressable>
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

function GalleryTab({
  gallery,
  motorcycleId,
}: {
  gallery: MotorcycleGalleryItemRow[];
  motorcycleId: string;
}) {
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
    height: buildHeroHeight,
    minHeight: 420,
    backgroundColor: theme.surfaceSoft,
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
  archivePartButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: "center",
    justifyContent: "center",
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
  removeMotorcycleButton: {
    minHeight: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255, 91, 91, 0.35)",
    backgroundColor: "rgba(255, 91, 91, 0.08)",
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  removeMotorcycleText: {
    color: theme.danger,
  },
  dangerZoneCard: {
    marginTop: spacing.section,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  dangerZoneText: {
    flex: 1,
  },
  dangerZoneDescription: {
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  locationMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexShrink: 1,
  },
  sectionHeaderText: {
    flex: 1,
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
});
