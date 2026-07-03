import { router, useFocusEffect } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { SetupOverviewCard } from "@/src/features/garage/components/SetupOverviewCard";
import { listMotorcyclesByUserId } from "@/src/features/garage/repositories/motorcycle.repository";
import { getProfileById } from "@/src/features/profile/repositories/profile.repository";
import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
} from "@/src/shared/components";
import { spacing, theme } from "@/src/shared/theme";
import type {
  MotorcycleRow,
  ProfileRow,
} from "@/src/shared/types/database.types";

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
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const motorcycleCards = useMemo(
    () => motorcycles.map(toGarageMotorcycleCardData),
    [motorcycles],
  );

  const featuredMotorcycleName =
    motorcycleCards[0]?.name ||
    (motorcycleCards[0]
      ? `${motorcycleCards[0].brand} ${motorcycleCards[0].model}`
      : "Belum ada motor");

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadGarageData() {
        if (!user) {
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setErrorMessage(null);

          const [profileData, motorcycleData] = await Promise.all([
            getProfileById(user.id),
            listMotorcyclesByUserId(user.id),
          ]);

          if (isActive) {
            setProfile(profileData);
            setMotorcycles(motorcycleData);
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
        builderName={profile?.full_name ?? user.email ?? "ProperRide Rider"}
        onPressEdit={() => router.push("/edit-garage")}
      />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="title">My Motorcycles</AppText>

          <Pressable
            onPress={() => router.push("/(create)/add-motorcycle")}
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
            <AppText variant="bodyMedium">Belum ada motor</AppText>
            <AppText
              variant="caption"
              tone="secondary"
              style={styles.emptyText}
            >
              Tambahkan motor pertama agar Garage kamu mulai terisi.
            </AppText>

            <AppButton
              style={styles.emptyButton}
              onPress={() => router.push("/(create)/add-motorcycle")}
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
        <SetupOverviewCard
          partsCount={0}
          motorcyclesCount={motorcycles.length}
          categoriesCount={0}
          featuredMotorcycleName={featuredMotorcycleName}
        />
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
});
