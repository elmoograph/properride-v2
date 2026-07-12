import { router, useFocusEffect } from "expo-router";
import { Edit3, Plus, Star } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { GarageHeader } from "@/src/features/garage/components/GarageHeader";
import {
  GarageMotorcycleCard,
  type GarageMotorcycleCardData,
} from "@/src/features/garage/components/GarageMotorcycleCard";
import { listMotorcyclesByUserId } from "@/src/features/garage/repositories/motorcycle.repository";
import { listPartsByMotorcycleId } from "@/src/features/garage/repositories/motorcyclePart.repository";
import { listGalleryItemsByMotorcycleId } from "@/src/features/garage/repositories/motorcycleGallery.repository";
import { listPostsByUserId } from "@/src/features/feed/repositories/post.repository";
import { getProfileById } from "@/src/features/profile/repositories/profile.repository";
import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
} from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";
import type {
  MotorcycleGalleryItemRow,
  MotorcycleRow,
  ProfileRow,
} from "@/src/shared/types/database.types";
import { GarageGalleryGrid } from "@/src/features/garage/components/GarageGalleryGrid";

function toGarageMotorcycleCardData(
  motorcycle: MotorcycleRow,
): GarageMotorcycleCardData {
  return {
    id: motorcycle.id,
    name: motorcycle.name ?? "",
    brand: motorcycle.brand,
    model: motorcycle.model,
    year: motorcycle.year,
    imageUrl: motorcycle.image_url,
    engineInfo:
      motorcycle.engine_info ??
      (motorcycle.engine_cc ? `${motorcycle.engine_cc} cc` : null),
  };
}

export function GarageScreen() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [motorcycles, setMotorcycles] = useState<MotorcycleRow[]>([]);
  const [totalPartsCount, setTotalPartsCount] = useState(0);
  const [totalGalleryCount, setTotalGalleryCount] = useState(0);
  const [recentGalleryItems, setRecentGalleryItems] = useState<
    MotorcycleGalleryItemRow[]
  >([]);
  const [totalPostsCount, setTotalPostsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const motorcycleCards = useMemo(
    () => motorcycles.map(toGarageMotorcycleCardData),
    [motorcycles],
  );

  const featuredMotorcycle = motorcycleCards[0] ?? null;

  const featuredMotorcycleName = featuredMotorcycle
    ? featuredMotorcycle.name ||
      `${featuredMotorcycle.brand} ${featuredMotorcycle.model}`.trim()
    : "Belum ada build";

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadGarageData() {
        if (!user) {
          setProfile(null);
          setMotorcycles([]);
          setTotalPartsCount(0);
          setTotalGalleryCount(0);
          setRecentGalleryItems([]);
          setTotalPostsCount(0);
          setLoading(false);
          return;
        }
        try {
          setLoading(true);
          setErrorMessage(null);

          const [profileData, motorcycleData, postData] = await Promise.all([
            getProfileById(user.id),
            listMotorcyclesByUserId(user.id),
            listPostsByUserId(user.id),
          ]);

          const [partsByMotorcycle, galleryByMotorcycle] = await Promise.all([
            Promise.all(
              motorcycleData.map((motorcycle) =>
                listPartsByMotorcycleId(motorcycle.id),
              ),
            ),
            Promise.all(
              motorcycleData.map((motorcycle) =>
                listGalleryItemsByMotorcycleId(motorcycle.id),
              ),
            ),
          ]);

          const partsCount = partsByMotorcycle.reduce(
            (total, parts) => total + parts.length,
            0,
          );

          const galleryCount = galleryByMotorcycle.reduce(
            (total, galleryItems) => total + galleryItems.length,
            0,
          );

          const recentGallery = galleryByMotorcycle
            .flat()
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            )
            .slice(0, 6);

          if (isActive) {
            setProfile(profileData);
            setMotorcycles(motorcycleData);
            setTotalPartsCount(partsCount);
            setTotalGalleryCount(galleryCount);
            setRecentGalleryItems(recentGallery);
            setTotalPostsCount(postData.length);
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat Garage.";

          if (isActive) {
            setErrorMessage(message);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      loadGarageData();

      return () => {
        isActive = false;
      };
    }, [user]),
  );

  if (loading) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.primary} />
          <AppText tone="secondary" style={styles.centerText}>
            Memuat Garage...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  if (!user) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <AppText variant="title">Sesi tidak aktif</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            Silakan masuk kembali untuk membuka Garage.
          </AppText>
          <AppButton onPress={() => router.replace("/(auth)/login")}>
            Masuk
          </AppButton>
        </View>
      </AppScreen>
    );
  }

  if (errorMessage) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <AppText variant="title">Garage belum siap</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            {errorMessage}
          </AppText>
          <AppButton onPress={() => router.replace("/(tabs)/feed")}>
            Kembali ke Feed
          </AppButton>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen scrollable>
      <GarageHeader
        garageName={profile?.garage_name ?? "ProperRide Garage"}
        builderName={profile?.username ?? user.email ?? "ProperRide Rider"}
        coverUrl={profile?.garage_cover_url ?? null}
        onPressEdit={() => router.push("/edit-garage")}
      />

      <View style={styles.statsRow}>
        <GarageStatItem label="Builds" value={motorcycles.length} />
        <GarageStatItem label="Parts" value={totalPartsCount} />
        <GarageStatItem label="Gallery" value={totalGalleryCount} />
        <GarageStatItem label="Posts" value={totalPostsCount} />
      </View>

      <View style={styles.featuredSection}>
        <View style={styles.sectionHeader}>
          <AppText variant="title">Featured Build</AppText>
        </View>

        <Pressable
          disabled={!featuredMotorcycle}
          onPress={() => {
            if (featuredMotorcycle) {
              router.push(`/motorcycle/${featuredMotorcycle.id}`);
            }
          }}
          style={({ pressed }) => [
            styles.featuredCard,
            pressed && featuredMotorcycle && styles.pressed,
          ]}
        >
          {featuredMotorcycle?.imageUrl ? (
            <Image
              source={{ uri: featuredMotorcycle.imageUrl }}
              style={styles.featuredImage}
            />
          ) : (
            <View style={styles.featuredIcon}>
              <Star size={18} color={theme.primary} />
            </View>
          )}

          <View style={styles.featuredText}>
            <AppText variant="bodyMedium" numberOfLines={1}>
              {featuredMotorcycleName}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={styles.featuredMeta}
              numberOfLines={2}
            >
              {featuredMotorcycle
                ? `${featuredMotorcycle.brand} ${featuredMotorcycle.model} · ${
                    featuredMotorcycle.year
                  } · ${featuredMotorcycle.engineInfo ?? "Mesin belum diisi"}`
                : "Tambahkan motor pertama untuk menampilkan build unggulan."}
            </AppText>
          </View>
        </Pressable>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="title">Builds</AppText>

          <Pressable
            onPress={() => router.push("/add-motorcycle")}
            style={({ pressed }) => [styles.viewAll, pressed && styles.pressed]}
          >
            <AppText variant="caption" tone="accent">
              Tambah
            </AppText>
            <Plus size={16} color={theme.primary} />
          </Pressable>
        </View>

        {motorcycleCards.length === 0 ? (
          <AppCard style={styles.emptyCard}>
            <AppText variant="bodyMedium">Belum ada build</AppText>
            <AppText
              variant="caption"
              tone="secondary"
              style={styles.emptyText}
            >
              Tambahkan build pertama agar Garage kamu mulai terisi.
            </AppText>

            <AppButton
              style={styles.emptyButton}
              onPress={() => router.push("/add-motorcycle")}
            >
              Tambah Motor
            </AppButton>
          </AppCard>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.motorcycleList}
          >
            {motorcycleCards.map((motorcycle) => (
              <GarageMotorcycleCard
                key={motorcycle.id}
                motorcycle={motorcycle}
              />
            ))}
          </ScrollView>
        )}
      </View>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <AppText variant="title">Garage Gallery</AppText>
            <AppText
              variant="caption"
              tone="secondary"
              style={styles.sectionSubtitle}
            >
              Foto terbaru dari semua build di Garage kamu.
            </AppText>
          </View>
        </View>

        {recentGalleryItems.length === 0 ? (
          <AppCard style={styles.emptyCard}>
            <AppText variant="bodyMedium">Belum ada foto gallery</AppText>
            <AppText
              variant="caption"
              tone="secondary"
              style={styles.emptyText}
            >
              Tambahkan foto dari detail motor agar Gallery Garage mulai terisi.
            </AppText>
          </AppCard>
        ) : (
          <GarageGalleryGrid
            items={recentGalleryItems.map((item) => ({
              id: item.id,
              imageUrl: item.image_url,
            }))}
          />
        )}
      </View>
    </AppScreen>
  );
}

function GarageStatItem({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statItem}>
      <AppText variant="bodyMedium">{value}</AppText>
      <AppText variant="caption" tone="secondary" style={styles.statLabel}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    marginTop: spacing.section,
    borderRadius: radius.xl,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statLabel: {
    marginTop: 2,
  },
  featuredSection: {
    marginTop: spacing.section,
  },
  featuredCard: {
    minHeight: 92,
    borderRadius: radius.xl,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  featuredImage: {
    width: 72,
    height: 58,
    borderRadius: radius.lg,
    backgroundColor: theme.surfaceSoft,
  },
  featuredIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  featuredText: {
    flex: 1,
  },
  featuredMeta: {
    marginTop: spacing.xs,
    lineHeight: 18,
  },
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
  emptyCard: {
    alignItems: "flex-start",
  },
  emptyText: {
    marginTop: spacing.xs,
  },
  emptyButton: {
    marginTop: spacing.lg,
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
  pressed: {
    opacity: 0.82,
  },
  sectionSubtitle: {
    marginTop: spacing.xs,
  },
});
