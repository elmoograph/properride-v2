import { router, useFocusEffect } from "expo-router";
import { Bike } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { BuildDetailScreen } from "@/src/features/build/screens/BuildDetailScreen";
import { listMotorcyclesByUserId } from "@/src/features/garage/repositories/motorcycle.repository";
import { AppButton, AppScreen, AppText } from "@/src/shared/components";
import { radius, spacing, theme } from "@/src/shared/theme";
import type { MotorcycleRow } from "@/src/shared/types/database.types";

export function BuildScreen() {
  const { user } = useAuth();

  const [motorcycles, setMotorcycles] = useState<MotorcycleRow[]>([]);
  const [selectedMotorcycleId, setSelectedMotorcycleId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadBuilds() {
        if (!user) {
          setMotorcycles([]);
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setErrorMessage(null);

          const data = await listMotorcyclesByUserId(user.id);

          if (isActive) {
            setMotorcycles(data);
            setSelectedMotorcycleId((current) =>
              current && data.some((motorcycle) => motorcycle.id === current)
                ? current
                : (data[0]?.id ?? null),
            );
          }
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat memuat build.";

          if (isActive) {
            setErrorMessage(message);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      loadBuilds();

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
          <AppText tone="secondary">Memuat Build...</AppText>
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
            Silakan masuk kembali untuk membuka Build.
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
          <AppText variant="title">Build belum siap</AppText>
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

  const selectedBuild =
    motorcycles.find((motorcycle) => motorcycle.id === selectedMotorcycleId) ??
    motorcycles[0] ??
    null;

  if (selectedBuild) {
    return (
      <BuildDetailScreen
        motorcycleId={selectedBuild.id}
        showBackButton={false}
        backFallbackHref="/(tabs)/garage"
        buildOptions={motorcycles.map((motorcycle) => ({
          label: motorcycle.name?.trim()
            ? `${motorcycle.name.trim()} · ${motorcycle.brand} ${motorcycle.model} · ${motorcycle.year}`
            : `${motorcycle.brand} ${motorcycle.model} · ${motorcycle.year}`,
          value: motorcycle.id,
        }))}
        onChangeMotorcycle={setSelectedMotorcycleId}
        onMotorcycleRemoved={(removedMotorcycleId) => {
          const nextMotorcycles = motorcycles.filter(
            (motorcycle) => motorcycle.id !== removedMotorcycleId,
          );

          setMotorcycles(nextMotorcycles);
          setSelectedMotorcycleId(nextMotorcycles[0]?.id ?? null);
        }}
      />
    );
  }

  return (
    <AppScreen>
      <View style={styles.centerState}>
        <View style={styles.emptyIcon}>
          <Bike size={24} color={theme.primary} />
        </View>

        <AppText variant="title">Belum ada build</AppText>

        <AppText variant="caption" tone="secondary" style={styles.centerText}>
          Tambahkan motor pertama untuk mulai membuat Build di ProperRide.
        </AppText>

        <AppButton onPress={() => router.push("/add-motorcycle")}>
          Tambah Motor
        </AppButton>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  emptyIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  centerText: {
    maxWidth: 280,
    textAlign: "center",
    lineHeight: 18,
  },
});
