import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { useAuth } from "@/src/features/auth/hooks/useAuth";
import {
  MotorcycleSelectCard,
  type MotorcycleSelectCardData,
} from "@/src/features/create/components/MotorcycleSelectCard";
import { listMotorcyclesByUserId } from "@/src/features/garage/repositories/motorcycle.repository";
import {
  AppButton,
  AppCard,
  AppScreen,
  AppText,
} from "@/src/shared/components";
import { spacing, theme } from "@/src/shared/theme";
import type { MotorcycleRow } from "@/src/shared/types/database.types";

function toMotorcycleSelectCardData(
  motorcycle: MotorcycleRow,
): MotorcycleSelectCardData {
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

export function SelectMotorcycleForPartScreen() {
  const { user } = useAuth();

  const [motorcycles, setMotorcycles] = useState<MotorcycleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const motorcycleCards = useMemo(
    () => motorcycles.map(toMotorcycleSelectCardData),
    [motorcycles],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadMotorcycles() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage(null);

        const data = await listMotorcyclesByUserId(user.id);

        if (isMounted) {
          setMotorcycles(data);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memuat motor.";

        if (isMounted) {
          setErrorMessage(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMotorcycles();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loading) {
    return (
      <AppScreen>
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.primary} />
          <AppText tone="secondary" style={styles.centerText}>
            Memuat motor di Garage...
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
            Silakan masuk kembali untuk memilih motor.
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
          <AppText variant="title">Motor belum siap</AppText>
          <AppText tone="secondary" style={styles.centerText}>
            {errorMessage}
          </AppText>
          <AppButton onPress={() => router.back()}>Kembali</AppButton>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen scrollable>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={22} color={theme.textPrimary} />
        </Pressable>

        <View style={styles.headerText}>
          <AppText variant="titleLarge">Pilih Motor</AppText>
          <AppText tone="secondary" style={styles.subtitle}>
            Pilih motor yang ingin kamu tambahkan part-nya.
          </AppText>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <AppText variant="caption" tone="secondary">
            Motor di Garage
          </AppText>

          <AppText variant="caption" tone="muted">
            Wajib
          </AppText>
        </View>

        {motorcycleCards.length === 0 ? (
          <AppCard style={styles.emptyCard}>
            <AppText variant="bodyMedium">Belum ada motor</AppText>
            <AppText
              variant="caption"
              tone="secondary"
              style={styles.emptyText}
            >
              Tambahkan motor terlebih dahulu sebelum mencatat part.
            </AppText>
            <AppButton
              style={styles.emptyButton}
              onPress={() => router.push("/(create)/add-motorcycle")}
            >
              Tambah Motor
            </AppButton>
          </AppCard>
        ) : (
          <View style={styles.motorcycleList}>
            {motorcycleCards.map((motorcycle) => (
              <MotorcycleSelectCard
                key={motorcycle.id}
                motorcycle={motorcycle}
                onPress={() =>
                  router.push(
                    `/(create)/add-part?motorcycleId=${motorcycle.id}`,
                  )
                }
              />
            ))}
          </View>
        )}

        <AppText variant="caption" tone="muted" style={styles.note}>
          Add Part membutuhkan konteks motor agar setup dan timeline tetap rapi.
        </AppText>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  subtitle: {
    marginTop: spacing.xs,
    maxWidth: 320,
  },
  content: {
    marginTop: spacing.section,
    gap: spacing.md,
  },
  sectionHeader: {
    marginLeft: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  motorcycleList: {
    gap: spacing.sm,
  },
  note: {
    marginTop: spacing.md,
    textAlign: "center",
    paddingHorizontal: spacing.md,
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
});
