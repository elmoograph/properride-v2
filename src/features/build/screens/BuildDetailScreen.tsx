import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  View,
} from "react-native";

import {
  AppButton,
  AppScreen,
  AppSelect,
  AppText,
  type SelectOption,
} from "@/src/shared/components";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { BuildGalleryTab } from "@/src/features/build/components/BuildGalleryTab";
import { BuildHero } from "@/src/features/build/components/BuildHero";
import { BuildInfoSection } from "@/src/features/build/components/BuildInfoSection";
import { BuildSetupPartsTab } from "@/src/features/build/components/BuildSetupPartsTab";
import { BuildTimelineTab } from "@/src/features/build/components/BuildTimelineTab";
import { BuildManagementCard } from "@/src/features/build/components/BuildManagementCard";
import {
  BuildDetailTabs,
  type BuildDetailTab,
} from "@/src/features/build/components/BuildDetailTabs";
import { radius, spacing, theme } from "@/src/shared/theme";
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
import { openBuilderProfile } from "@/src/shared/navigation/builderNavigation";
import {
  archiveMotorcyclePartById,
  createPartArchivedTimelineItem,
  listPartsByMotorcycleId,
  listTimelineItemsByMotorcycleId,
} from "@/src/features/garage/repositories/motorcyclePart.repository";

const screenHeight = Dimensions.get("window").height;
const buildHeroHeight = Math.round(screenHeight * 0.6);

type BuildDetailScreenProps = {
  motorcycleId?: string;
  showBackButton?: boolean;
  backFallbackHref?: string;
  onMotorcycleRemoved?: (motorcycleId: string) => void;
  buildOptions?: SelectOption[];
  onChangeMotorcycle?: (motorcycleId: string) => void;
};

export function BuildDetailScreen({
  motorcycleId,
  showBackButton = true,
  backFallbackHref = "/(tabs)/garage",
  onMotorcycleRemoved,
  buildOptions = [],
  onChangeMotorcycle,
}: BuildDetailScreenProps = {}) {
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const resolvedMotorcycleId = motorcycleId ?? id;
  const [activeTab, setActiveTab] = useState<BuildDetailTab>("setup");

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
  const [buildSelectorVisible, setBuildSelectorVisible] = useState(false);

  useEffect(() => {
    setActiveTab("setup");
    setBuildSelectorVisible(false);
  }, [resolvedMotorcycleId]);

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
  const isOwner = user?.id === motorcycle.user_id;
  const isArchived = Boolean(motorcycle.archived_at);
  const canManage = isOwner && !isArchived;

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
      "Arsipkan Build?",
      "Motor akan diarsipkan dari Build aktif. Data part, gallery, timeline, dan post terkait tidak dihapus permanen.",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Arsipkan Build",
          style: "destructive",
          onPress: async () => {
            try {
              setRemovingMotorcycle(true);

              await archiveMotorcycleById(motorcycle.id);

              onMotorcycleRemoved?.(motorcycle.id);

              Alert.alert(
                "Build diarsipkan",
                "Build berhasil dipindahkan dari daftar Build aktif.",
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
                  : "Terjadi kesalahan saat mengarsipkan Build.";

              Alert.alert("Gagal mengarsipkan Build", message);
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
          canEdit={canManage}
        />
      </View>

      <View style={styles.content}>
        {isArchived ? (
          <View style={styles.archivedBadge}>
            <AppText variant="caption" tone="secondary">
              Diarsipkan · Mode hanya-baca
            </AppText>
          </View>
        ) : null}
        {buildOptions.length > 1 && resolvedMotorcycleId ? (
          <View style={styles.buildSelector}>
            <AppSelect
              label="Pilih Build"
              placeholder="Pilih motor"
              value={resolvedMotorcycleId}
              options={buildOptions}
              visible={buildSelectorVisible}
              onOpen={() => setBuildSelectorVisible(true)}
              onClose={() => setBuildSelectorVisible(false)}
              onChange={(nextMotorcycleId) => {
                onChangeMotorcycle?.(nextMotorcycleId);
              }}
            />
          </View>
        ) : null}

        <BuildInfoSection
          builderName={builderName}
          builderLocation={builderLocation}
          motorcycleTitle={motorcycleTitle}
          motorcycleYear={motorcycle.year}
          motorcycleEngineInfo={motorcycleEngineInfo}
          partsCount={parts.length}
          galleryCount={galleryItems.length}
          onPressBuilderProfile={() =>
            openBuilderProfile({
              currentUserId: user?.id,
              builderUserId: motorcycle.user_id,
            })
          }
        />
        <BuildDetailTabs activeTab={activeTab} onChangeTab={setActiveTab} />

        <View style={styles.tabContent}>
          {activeTab === "setup" ? (
            <BuildSetupPartsTab
              motorcycleId={motorcycle.id}
              parts={parts}
              archivingPartId={archivingPartId}
              onArchivePart={handleArchivePart}
              canManage={canManage}
            />
          ) : null}

          {activeTab === "timeline" ? (
            <BuildTimelineTab timelineItems={timelineItems} />
          ) : null}

          {activeTab === "gallery" ? (
            <BuildGalleryTab
              gallery={galleryItems}
              motorcycleId={motorcycle.id}
              canManage={canManage}
            />
          ) : null}
        </View>
        {canManage ? (
          <BuildManagementCard
            removingMotorcycle={removingMotorcycle}
            onRemoveMotorcycle={handleArchiveMotorcycle}
          />
        ) : null}
      </View>
    </AppScreen>
  );
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
  buildSelector: {
    marginBottom: spacing.lg,
  },
  archivedBadge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    backgroundColor: theme.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
  },
  tabContent: {
    marginTop: spacing.xl,
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
});
